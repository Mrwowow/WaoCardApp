<?php
/**
 * Test script for VTU.ng proxy
 * Run this to test the VTU.ng integration
 */

// Configuration
$proxyUrl = 'https://waocard.co/api/vtu_proxy.php';

echo "🔧 VTU.ng API Configuration Updated!\n";
echo "✅ Using WordPress JSON API endpoints (wp-json/api/v2/...)\n";
echo "✅ JWT authentication via wp-json/jwt-auth/v1/token\n";
echo "✅ URL parameter authentication (username & password)\n";
echo "✅ Test mode disabled for real API testing\n";
echo "💰 Expected balance: ₦45.75\n\n";

// Test function
function testEndpoint($url, $endpoint, $method = 'GET', $data = null) {
    $fullUrl = $url . '?endpoint=' . $endpoint;
    
    echo "\n=====================================\n";
    echo "Testing: $endpoint\n";
    echo "URL: $fullUrl\n";
    echo "Method: $method\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $fullUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    if ($data && $method === 'POST') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    
    if ($error) {
        echo "cURL Error: $error\n";
        return false;
    }
    
    $decoded = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "Response (not JSON): " . substr($response, 0, 500) . "\n";
    } else {
        echo "Response: " . json_encode($decoded, JSON_PRETTY_PRINT) . "\n";
    }
    
    return $decoded;
}

// Run tests
echo "VTU.ng Proxy Test Script\n";
echo "========================\n";

// Test 1: Health check
echo "\n1. Testing Health Check...\n";
$health = testEndpoint($proxyUrl, 'health', 'GET');

// Test 2: Balance check
echo "\n2. Testing Balance Check...\n";
$balance = testEndpoint($proxyUrl, 'balance', 'GET');

// Test 3: Test airtime purchase (small amount) - VTU.ng API v2 format
echo "\n3. Testing Airtime Purchase (VTU.ng API v2 Format)...\n";
$airtimeData = [
    'phone' => '08100853150',  // Test phone number from VTU.ng example
    'amount' => 10,            // Small test amount
    'network' => 'mtn',
    'reference' => 'TEST_' . time()
];
$airtime = testEndpoint($proxyUrl, 'airtime', 'POST', $airtimeData);

// Summary
echo "\n=====================================\n";
echo "TEST SUMMARY\n";
echo "=====================================\n";

if ($health && isset($health['success']) && $health['success']) {
    echo "✅ Health Check: PASSED\n";
    echo "   Status: " . ($health['status'] ?? 'unknown') . "\n";
    echo "   Message: " . ($health['message'] ?? '') . "\n";
} else {
    echo "❌ Health Check: FAILED\n";
}

if ($balance && isset($balance['success'])) {
    if ($balance['success']) {
        echo "✅ Balance Check: PASSED\n";
        echo "   Service Status: " . ($balance['status'] ?? 'unknown') . "\n";
        echo "   Message: " . ($balance['message'] ?? '') . "\n";
    } else {
        echo "⚠️ Balance Check: FAILED\n";
        echo "   Message: " . ($balance['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ Balance Check: FAILED\n";
}

if ($airtime && isset($airtime['success'])) {
    if ($airtime['success']) {
        echo "✅ Airtime Purchase: PASSED\n";
        echo "   Transaction ID: " . ($airtime['transactionId'] ?? 'N/A') . "\n";
        echo "   Amount: ₦" . ($airtime['amount'] ?? 'N/A') . "\n";
        if (isset($airtime['amount_charged'])) {
            echo "   Amount Charged: ₦" . $airtime['amount_charged'] . "\n";
        }
        if (isset($airtime['discount']) && $airtime['discount'] > 0) {
            echo "   Discount: ₦" . $airtime['discount'] . "\n";
        }
        echo "   Network: " . ($airtime['network'] ?? 'N/A') . "\n";
        echo "   Status: " . ($airtime['status'] ?? 'unknown') . "\n";
        echo "   Message: " . ($airtime['message'] ?? '') . "\n";
    } else {
        echo "⚠️ Airtime Purchase: FAILED\n";
        echo "   Error Code: " . ($airtime['error_code'] ?? 'UNKNOWN') . "\n";
        echo "   Message: " . ($airtime['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ Airtime Purchase: FAILED\n";
}

echo "\n=====================================\n";
echo "Note: This test uses real API endpoints.\n";
echo "Check server logs for detailed error messages.\n";
?>