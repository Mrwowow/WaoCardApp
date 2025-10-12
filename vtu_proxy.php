<?php
/**
 * VTU.ng API Proxy Server
 * Securely handles VTU.ng API requests without exposing merchant credentials to frontend
 * 
 * Author: WaoCard Development Team
 * Version: 1.0.0
 */

// Start session for token storage
session_start();

// Security headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// VTU.ng Configuration - Keep these secure on server
class VTUConfig {
    // Test mode - set to false for real API testing
    const TEST_MODE = false;
    
    // VTU.ng Merchant Credentials (NEVER expose these to frontend)
    const MERCHANT_USERNAME = 'waocard@gmail.com';
    const MERCHANT_PASSWORD = 'Possible@2023';
    
    // VTU.ng API Configuration
    const BASE_URL = 'https://vtu.ng';
    const API_VERSION = 'v2';
    
    // API Endpoints - VTU.ng WordPress JSON API endpoints
    const ENDPOINTS = [
        'balance' => 'wp-json/api/v2/balance',
        'airtime' => 'wp-json/api/v2/airtime',
        'login' => 'wp-json/jwt-auth/v1/token'
    ];
    
    // Network Provider Codes - VTU.ng uses string codes
    const NETWORK_CODES = [
        'mtn' => 'mtn',
        'airtel' => 'airtel',
        'glo' => 'glo',
        '9mobile' => '9mobile'
    ];
}

/**
 * VTU API Handler Class
 */
class VTUAPIHandler {
    private $authToken = null;
    private $tokenExpiry = null;
    
    /**
     * Authenticate with VTU.ng API
     */
    private function authenticate() {
        try {
            // Check session for cached token
            if (isset($_SESSION['vtu_token']) && isset($_SESSION['vtu_token_expiry'])) {
                if (time() < $_SESSION['vtu_token_expiry']) {
                    $this->authToken = $_SESSION['vtu_token'];
                    $this->tokenExpiry = $_SESSION['vtu_token_expiry'];
                    error_log('Using cached VTU.ng token from session');
                    return $this->authToken;
                }
            }
            
            // Check if we have a valid cached token in instance
            if ($this->authToken && $this->tokenExpiry && time() < $this->tokenExpiry) {
                return $this->authToken;
            }
            
            // VTU.ng JWT authentication uses URL parameters
            $username = urlencode(VTUConfig::MERCHANT_USERNAME);
            $password = urlencode(VTUConfig::MERCHANT_PASSWORD);
            
            try {
                $response = $this->makeJWTRequest($username, $password);
            } catch (Exception $e) {
                error_log('JWT login failed: ' . $e->getMessage());
                throw $e;
            }
            
            error_log('VTU.ng login response: ' . json_encode($response));
            
            // VTU.ng JWT authentication returns token directly
            $token = null;
            if (isset($response['token'])) {
                $token = $response['token'];
            } elseif (isset($response['data']['token'])) {
                $token = $response['data']['token'];
            }
            
            if ($token) {
                $this->authToken = $token;
                $this->tokenExpiry = time() + (12 * 60 * 60); // 12 hours
                
                // Store in session
                $_SESSION['vtu_token'] = $token;
                $_SESSION['vtu_token_expiry'] = $this->tokenExpiry;
                
                $userEmail = $response['user_email'] ?? 'unknown';
                $userName = $response['user_display_name'] ?? 'unknown';
                
                error_log("VTU.ng authentication successful for user: $userName ($userEmail)");
                error_log('Token: ' . substr($token, 0, 30) . '...');
                return $this->authToken;
            } else {
                error_log('VTU.ng authentication response structure: ' . json_encode($response));
                error_log('Warning: No token found in response, proceeding without authentication');
                
                // Some VTU.ng implementations might not require token for certain operations
                // or might use session-based auth
                $this->authToken = 'no_token_required';
                return $this->authToken;
            }
        } catch (Exception $e) {
            error_log('VTU.ng authentication error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Make JWT authentication request to VTU.ng
     */
    private function makeJWTRequest($username, $password) {
        $url = VTUConfig::BASE_URL . '/' . VTUConfig::ENDPOINTS['login'] . "?username={$username}&password={$password}";
        
        error_log("VTU.ng JWT Request [POST]: $url");
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_FOLLOWLOCATION => true
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("cURL error for JWT request to $url: $error");
            throw new Exception('cURL error: ' . $error);
        }
        
        error_log("VTU.ng JWT Response [$httpCode]: " . substr($response, 0, 1000));
        
        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JWT JSON decode error: " . json_last_error_msg());
            throw new Exception('Invalid response from VTU.ng JWT request');
        }
        
        if ($httpCode >= 400) {
            throw new Exception("JWT auth error ($httpCode): " . $response);
        }
        
        return $decodedResponse;
    }
    
    /**
     * Make form-encoded HTTP request to VTU.ng API
     */
    private function makeFormRequest($endpoint, $data = null) {
        $url = VTUConfig::BASE_URL . '/' . VTUConfig::ENDPOINTS[$endpoint];
        
        error_log("VTU.ng Form Request [POST]: $url");
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_FOLLOWLOCATION => true
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("cURL error for form request to $url: $error");
            throw new Exception('cURL error: ' . $error);
        }
        
        error_log("VTU.ng Form Response [$httpCode]: " . substr($response, 0, 1000));
        
        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Check if it's a successful non-JSON response
            if ($httpCode == 200 && strpos($response, 'success') !== false) {
                return ['success' => true, 'raw_response' => $response];
            }
            throw new Exception('Invalid response from VTU.ng form request');
        }
        
        return $decodedResponse;
    }
    
    /**
     * Make HTTP request to VTU.ng API
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null, $requireAuth = true) {
        $url = VTUConfig::BASE_URL . '/' . VTUConfig::ENDPOINTS[$endpoint];
        
        error_log("VTU.ng API Request [$method]: $url");
        if ($data) {
            error_log("Request data: " . json_encode($data));
        }
        
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];
        
        // Add authentication header if required
        if ($requireAuth && $endpoint !== 'login') {
            $token = $this->authenticate();
            $headers[] = 'Authorization: Bearer ' . $token;
            error_log("Using auth token: " . substr($token, 0, 20) . "...");
        }
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_SSL_VERIFYPEER => false, // Only for development
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_VERBOSE => true // Enable verbose output for debugging
        ]);
        
        if ($data && $method !== 'GET') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("cURL error for $url: $error");
            throw new Exception('cURL error: ' . $error);
        }
        
        error_log("VTU.ng API Response [$httpCode] from $endpoint: " . substr($response, 0, 1000));
        
        // Check if response is JSON
        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg());
            error_log("Raw response (first 2000 chars): " . substr($response, 0, 2000));
            
            // Check if it's an HTML error page
            if (strpos($response, '<html') !== false || strpos($response, '<!DOCTYPE') !== false) {
                // Try to extract any useful information from HTML
                if (strpos($response, '404') !== false) {
                    throw new Exception('VTU.ng API endpoint not found (404) - check endpoint: ' . $url);
                }
                if (strpos($response, 'login') !== false || strpos($response, 'Login') !== false) {
                    throw new Exception('VTU.ng API requires authentication - may need to login first');
                }
                throw new Exception('VTU.ng API returned HTML instead of JSON - endpoint may be incorrect for: ' . $url);
            }
            
            throw new Exception('Invalid JSON response from VTU.ng');
        }
        
        if ($httpCode >= 400) {
            error_log("HTTP error $httpCode from $endpoint");
            throw new Exception("API error ($httpCode): " . $response);
        }
        
        return $decodedResponse;
    }
    
    /**
     * Get merchant wallet balance
     */
    public function getBalance() {
        try {
            // Test mode - return mock balance
            if (VTUConfig::TEST_MODE) {
                error_log('TEST MODE: Returning mock balance');
                return [
                    'success' => true,
                    'balance' => 50000.00,
                    'currency' => 'NGN',
                    'message' => '✅ Service operational (Test Mode)',
                    'status' => 'available'
                ];
            }
            $response = $this->makeRequest('balance', 'GET');
            
            // Handle different response formats
            $balance = 0;
            if (isset($response['data']['balance'])) {
                $balance = floatval($response['data']['balance']);
            } elseif (isset($response['balance'])) {
                $balance = floatval($response['balance']);
            } elseif (isset($response['data']['wallet'])) {
                $balance = floatval($response['data']['wallet']);
            }
            
            return [
                'success' => true,
                'balance' => $balance,
                'currency' => 'NGN',
                'message' => 'Service operational',
                'status' => 'available'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => '⚠️ Service temporarily unavailable',
                'balance' => 0,
                'status' => 'maintenance'
            ];
        }
    }
    
    /**
     * Purchase airtime
     */
    public function purchaseAirtime($data) {
        try {
            // Test mode - return mock success
            if (VTUConfig::TEST_MODE) {
                error_log('TEST MODE: Simulating airtime purchase');
                
                // Validate required fields
                $required = ['phone', 'amount', 'network'];
                foreach ($required as $field) {
                    if (!isset($data[$field]) || empty($data[$field])) {
                        throw new Exception("Missing required field: $field");
                    }
                }
                
                $phone = preg_replace('/[^0-9]/', '', $data['phone']);
                $amount = floatval($data['amount']);
                $reference = $data['reference'] ?? 'WC_TEST_' . time() . '_' . mt_rand(1000, 9999);
                
                return [
                    'success' => true,
                    'message' => '🎉 Airtime recharge successful! (Test Mode)',
                    'transactionId' => 'TEST_' . uniqid(),
                    'reference' => $reference,
                    'amount' => $amount,
                    'amount_charged' => $amount * 0.975, // Simulate VTU.ng discount
                    'discount' => '0.25',
                    'phone' => $phone,
                    'network' => strtoupper($data['network']),
                    'product_name' => 'Airtime',
                    'initial_balance' => '50000.00',
                    'final_balance' => '49990.25',
                    'status' => 'completed-api',
                    'timestamp' => date('Y-m-d H:i:s')
                ];
            }
            // Validate required fields
            $required = ['phone', 'amount', 'network'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }
            
            // Format phone number
            $phone = preg_replace('/[^0-9]/', '', $data['phone']);
            if (substr($phone, 0, 3) === '234') {
                $phone = '0' . substr($phone, 3);
            } elseif (substr($phone, 0, 4) === '+234') {
                $phone = '0' . substr($phone, 4);
            }
            
            // Validate network
            $network = strtolower($data['network']);
            if (!isset(VTUConfig::NETWORK_CODES[$network])) {
                throw new Exception('Invalid network provider');
            }
            
            // Check merchant balance first (internal check)
            $balanceCheck = $this->getBalance();
            if (!$balanceCheck['success']) {
                throw new Exception('Service temporarily unavailable. Please try again later.');
            }
            
            $amount = floatval($data['amount']);
            if ($balanceCheck['balance'] < $amount) {
                // Don't expose merchant balance details to app users
                throw new Exception('Service temporarily unavailable due to maintenance. Please try again later or contact support.');
            }
            
            // Prepare purchase request - VTU.ng API v2 format
            $requestData = [
                'request_id' => $data['reference'] ?? 'WC_' . time() . '_' . mt_rand(1000, 9999),
                'phone' => $phone,
                'service_id' => VTUConfig::NETWORK_CODES[$network],
                'amount' => $amount
            ];
            
            error_log('VTU.ng purchase request: ' . json_encode($requestData));
            
            $response = $this->makeRequest('airtime', 'POST', $requestData);
            
            // Check for success based on VTU.ng API v2 response format
            $isSuccess = 
                (isset($response['code']) && $response['code'] === 'success') ||
                (isset($response['data']['status']) && strpos($response['data']['status'], 'completed') !== false) ||
                (isset($response['message']) && $response['message'] === 'ORDER COMPLETED');
            
            if ($isSuccess) {
                $responseData = $response['data'] ?? $response;
                
                return [
                    'success' => true,
                    'message' => '🎉 Airtime recharge successful! Your transaction has been completed.',
                    'transactionId' => $responseData['order_id'] ?? $responseData['transaction_id'] ?? $requestData['request_id'],
                    'reference' => $responseData['request_id'] ?? $requestData['request_id'],
                    'amount' => $responseData['amount'] ?? $amount,
                    'amount_charged' => $responseData['amount_charged'] ?? $amount,
                    'discount' => $responseData['discount'] ?? '0',
                    'phone' => $responseData['phone'] ?? $phone,
                    'network' => strtoupper($responseData['service_name'] ?? $network),
                    'product_name' => $responseData['product_name'] ?? 'Airtime',
                    'initial_balance' => $responseData['initial_balance'] ?? null,
                    'final_balance' => $responseData['final_balance'] ?? null,
                    'status' => $responseData['status'] ?? 'completed',
                    'timestamp' => date('Y-m-d H:i:s')
                ];
            } else {
                throw new Exception($response['message'] ?? 'Airtime purchase failed');
            }
            
        } catch (Exception $e) {
            $errorMessage = $e->getMessage();
            
            // Provide user-friendly error messages
            if (strpos($errorMessage, 'network') !== false || strpos($errorMessage, 'connection') !== false) {
                $userMessage = '📶 Network connection issue. Please check your internet and try again.';
            } elseif (strpos($errorMessage, 'phone') !== false || strpos($errorMessage, 'number') !== false) {
                $userMessage = '📱 Invalid phone number. Please check and try again.';
            } elseif (strpos($errorMessage, 'amount') !== false) {
                $userMessage = '💰 Invalid amount. Please enter an amount between ₦50 and ₦50,000.';
            } elseif (strpos($errorMessage, 'maintenance') !== false || strpos($errorMessage, 'unavailable') !== false) {
                $userMessage = '⚠️ Service temporarily unavailable. Please try again in a few minutes.';
            } else {
                $userMessage = '❌ Transaction failed. Please try again or contact support if the issue persists.';
            }
            
            return [
                'success' => false,
                'message' => $userMessage,
                'error_code' => 'TRANSACTION_FAILED',
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
}

/**
 * API Request Router
 */
function handleRequest() {
    try {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_GET['endpoint'] ?? '';
        
        // Initialize VTU handler
        $vtuHandler = new VTUAPIHandler();
        
        switch ($path) {
            case 'balance':
                if ($method !== 'GET') {
                    throw new Exception('Method not allowed');
                }
                return $vtuHandler->getBalance();
                
            case 'airtime':
                if ($method !== 'POST') {
                    throw new Exception('Method not allowed');
                }
                
                $input = json_decode(file_get_contents('php://input'), true);
                if (!$input) {
                    throw new Exception('Invalid JSON input');
                }
                
                return $vtuHandler->purchaseAirtime($input);
                
            case 'health':
                return [
                    'success' => true,
                    'message' => '✅ Airtime service is operational',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'version' => '1.0.0',
                    'status' => 'healthy',
                    'services' => [
                        'airtime' => 'available',
                        'balance_check' => 'available',
                        'authentication' => 'operational'
                    ]
                ];
                
            default:
                throw new Exception('Endpoint not found');
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// Main execution
try {
    $result = handleRequest();
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>