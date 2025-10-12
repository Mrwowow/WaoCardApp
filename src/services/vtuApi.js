// VTU.ng API Integration Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VTU_MERCHANT_CONFIG, VTU_ERROR_MESSAGES } from '../config/vtuConfig';

// API Configuration - Use proxy or direct
const API_CONFIG = VTU_MERCHANT_CONFIG.useProxy 
  ? VTU_MERCHANT_CONFIG.proxyConfig 
  : VTU_MERCHANT_CONFIG.directConfig;

// VTU.ng Network Provider Codes
export const VTU_NETWORK_CODES = {
  'MTN': 'mtn',
  'Airtel': 'airtel', 
  'Glo': 'glo',
  '9mobile': '9mobile',
  'mtn': 'mtn',
  'airtel': 'airtel',
  'glo': 'glo',
  '9mobile': '9mobile'
};

// VTU.ng Response Status Codes
export const VTU_STATUS_CODES = {
  SUCCESS: '000',
  INSUFFICIENT_BALANCE: '001',
  INVALID_REQUEST: '002',
  INVALID_PHONE: '003',
  INVALID_AMOUNT: '004',
  NETWORK_ERROR: '005',
  SERVICE_UNAVAILABLE: '006',
  DUPLICATE_TRANSACTION: '007',
  UNAUTHORIZED: '401'
};

let cachedToken = null;
let tokenExpiry = null;

/**
 * Authentication not needed for proxy mode
 * Backend proxy handles all VTU.ng authentication securely
 */
const authenticateMerchant = async () => {
  if (VTU_MERCHANT_CONFIG.useProxy) {
    console.log('✅ Using backend proxy - no frontend authentication needed');
    return 'proxy_auth';
  }
  
  throw new Error('Direct VTU.ng authentication disabled - use backend proxy');
};

/**
 * Get or refresh merchant token (proxy mode)
 */
const getMerchantToken = async () => {
  if (VTU_MERCHANT_CONFIG.useProxy) {
    return 'proxy_auth'; // No token needed in proxy mode
  }
  
  throw new Error('Direct VTU.ng authentication disabled - use backend proxy');
};

/**
 * Get VTU.ng API headers (proxy mode - no auth needed)
 */
const getVtuHeaders = async (endpoint = '') => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

/**
 * Make a request to VTU.ng API (via proxy or direct)
 */
const vtuRequest = async (endpoint, method = 'POST', data = null, retryCount = 0) => {
  try {
    let url;
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (VTU_MERCHANT_CONFIG.useProxy) {
      // Use backend proxy - construct URL based on configuration
      if (API_CONFIG.proxyEndpoint) {
        url = `${API_CONFIG.baseUrl}/${API_CONFIG.proxyEndpoint}?endpoint=${endpoint}`;
      } else {
        url = `${API_CONFIG.baseUrl}?endpoint=${endpoint}`;
      }
      console.log(`VTU Proxy Request [${method}]:`, url);
    } else {
      // Use direct VTU.ng API
      headers = await getVtuHeaders(endpoint);
      url = `${API_CONFIG.baseUrl}/${endpoint}`;
      console.log(`VTU.ng Direct Request [${method}]:`, url);
    }
    
    const options = {
      method,
      headers
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    if (data && VTU_MERCHANT_CONFIG.debug) {
      console.log('Request data:', data);
    }
    
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    console.log(`VTU.ng Raw Response [${response.status}]:`, responseText.substring(0, 500));
    
    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.log('VTU.ng response is not JSON, checking if HTML error page...');
      
      // Check for common HTML error indicators
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.log('Received HTML response - likely an error page or wrong endpoint');
        
        // Check for common error patterns in HTML
        if (responseText.includes('404') || responseText.includes('Not Found')) {
          throw new Error('VTU.ng API endpoint not found (404)');
        }
        if (responseText.includes('401') || responseText.includes('Unauthorized')) {
          throw new Error('VTU.ng API authentication failed (401)');
        }
        if (responseText.includes('500') || responseText.includes('Internal Server Error')) {
          throw new Error('VTU.ng API server error (500)');
        }
        
        throw new Error('VTU.ng API returned HTML instead of JSON - check endpoint URL');
      }
      
      // If it's plain text, wrap it in a result object
      if (response.ok) {
        return { 
          success: true, 
          data: responseText,
          message: 'Response received as plain text'
        };
      }
      
      throw new Error(`Invalid response format from VTU.ng API: ${responseText.substring(0, 100)}`);
    }
    
    console.log('VTU.ng API Parsed Response:', JSON.stringify(result).substring(0, 300));
    
    // Handle VTU.ng specific error responses
    if (!response.ok) {
      if (response.status === 401 && retryCount === 0) {
        // Token might be expired, try to refresh
        console.log('Token expired, refreshing...');
        cachedToken = null;
        tokenExpiry = null;
        await AsyncStorage.removeItem('vtu_merchant_token');
        await AsyncStorage.removeItem('vtu_token_expiry');
        
        // Retry the request with new token
        return vtuRequest(endpoint, method, data, retryCount + 1);
      }
      throw new Error(result.message || result.error || `API request failed with status ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error(`VTU.ng API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

/**
 * Get merchant wallet balance via proxy or direct API
 */
export const getVtuWalletBalance = async () => {
  try {
    console.log('💰 Checking VTU.ng merchant balance via', VTU_MERCHANT_CONFIG.useProxy ? 'proxy' : 'direct API');
    
    const endpoint = VTU_MERCHANT_CONFIG.useProxy ? 'balance' : 'api/v2/balance';
    const response = await vtuRequest(endpoint, 'GET');
    
    console.log('VTU.ng balance response:', response);
    
    if (response.success === false) {
      throw new Error(response.message || 'Balance check failed');
    }
    
    // Handle response from proxy vs direct API
    let balance = 0;
    if (VTU_MERCHANT_CONFIG.useProxy) {
      // Proxy returns standardized format
      balance = parseFloat(response.balance || 0);
    } else {
      // Direct API response format
      if (response.data && typeof response.data.balance !== 'undefined') {
        balance = parseFloat(response.data.balance);
      } else if (typeof response.balance !== 'undefined') {
        balance = parseFloat(response.balance);
      }
    }
    
    return {
      success: true,
      balance: balance,
      currency: 'NGN',
      message: response.message || 'Merchant balance retrieved successfully'
    };
  } catch (error) {
    console.error('VTU.ng balance check failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to check merchant balance',
      balance: 0
    };
  }
};

/**
 * Get airtime variations/denominations from VTU.ng
 */
export const getAirtimeVariations = async (network) => {
  try {
    const networkCode = VTU_NETWORK_CODES[network] || network.toLowerCase();
    const response = await vtuRequest(`airtime/variations/${networkCode}`, 'GET');
    
    return {
      success: true,
      variations: response.data || [],
      minAmount: response.min_amount || 50,
      maxAmount: response.max_amount || 50000
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      variations: []
    };
  }
};

/**
 * Validate phone number with VTU.ng
 */
export const validateVtuPhoneNumber = async (phone, network) => {
  try {
    const networkCode = VTU_NETWORK_CODES[network] || network.toLowerCase();
    
    const response = await vtuRequest('validate/phone', 'POST', {
      phone: phone,
      network: networkCode
    });
    
    return {
      success: true,
      valid: response.status === VTU_STATUS_CODES.SUCCESS,
      customerName: response.data?.customer_name || null,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      valid: false,
      message: error.message
    };
  }
};

/**
 * Purchase airtime via VTU.ng v2 API
 */
export const purchaseAirtimeVtu = async (data) => {
  try {
    const { phone, amount, network, reference } = data;
    const networkCode = VTU_NETWORK_CODES[network] || network.toLowerCase();
    
    console.log(`📱 Preparing VTU.ng v2 airtime purchase:`, { network: networkCode, phone, amount });
    
    // Step 1: Check merchant balance first
    console.log('💰 Checking VTU.ng merchant balance before purchase...');
    const balanceCheck = await getVtuWalletBalance();
    
    if (!balanceCheck.success) {
      throw new Error(`Cannot check merchant balance: ${balanceCheck.message}`);
    }
    
    if (balanceCheck.balance < amount) {
      throw new Error(`Insufficient merchant balance. Available: ₦${balanceCheck.balance}, Required: ₦${amount}`);
    }
    
    console.log(`✅ Merchant balance sufficient: ₦${balanceCheck.balance}`);
    
    // Format phone number (ensure it's in the right format)
    let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    
    // Convert international format to local if needed
    if (formattedPhone.startsWith('+234')) {
      formattedPhone = '0' + formattedPhone.substring(4);
    } else if (formattedPhone.startsWith('234')) {
      formattedPhone = '0' + formattedPhone.substring(3);
    }
    
    // VTU.ng v2 API request format
    const requestData = {
      network: networkCode,
      phone: formattedPhone,
      amount: parseFloat(amount),
      reference: reference || `WC_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
    
    console.log('📤 VTU.ng v2 purchase request:', requestData);
    
    // Use appropriate endpoint based on proxy mode
    let response;
    
    if (VTU_MERCHANT_CONFIG.useProxy) {
      console.log(`🔍 Using backend proxy for airtime purchase`);
      response = await vtuRequest('airtime', 'POST', requestData);
    } else {
      throw new Error('Direct VTU.ng access disabled - use backend proxy');
    }
    
    console.log('📥 VTU.ng purchase response type:', typeof response);
    console.log('📥 VTU.ng purchase response keys:', Object.keys(response || {}));
    
    // Handle different response formats
    // Check for success in various ways VTU.ng might indicate it
    const isSuccess = 
      response.status === VTU_STATUS_CODES.SUCCESS ||
      response.status === 'success' ||
      response.status === '000' ||
      response.code === '000' ||
      response.code === 200 ||
      response.success === true ||
      response.successful === true ||
      (response.data && response.data.status === 'success');
    
    if (isSuccess) {
      // Extract data from various possible response structures
      const responseData = response.data || response.result || response;
      
      return {
        success: true,
        message: response.message || responseData.message || 'Airtime purchase successful',
        transactionId: responseData.transaction_id || 
                      responseData.transactionId || 
                      responseData.reference ||
                      responseData.id ||
                      response.transaction_id,
        reference: responseData.reference || reference,
        amount: responseData.amount || amount,
        phone: responseData.phone || formattedPhone,
        network: responseData.network || networkCode,
        balance: responseData.new_balance || responseData.balance,
        timestamp: responseData.timestamp || responseData.created_at || new Date().toISOString()
      };
    } else {
      // Handle specific error codes
      let errorMessage = response.message || 'Airtime purchase failed';
      
      switch(response.status) {
        case VTU_STATUS_CODES.INSUFFICIENT_BALANCE:
          errorMessage = VTU_ERROR_MESSAGES.INSUFFICIENT_BALANCE;
          break;
        case VTU_STATUS_CODES.INVALID_PHONE:
          errorMessage = VTU_ERROR_MESSAGES.INVALID_PHONE;
          break;
        case VTU_STATUS_CODES.INVALID_AMOUNT:
          errorMessage = VTU_ERROR_MESSAGES.INVALID_AMOUNT;
          break;
        case VTU_STATUS_CODES.DUPLICATE_TRANSACTION:
          errorMessage = VTU_ERROR_MESSAGES.DUPLICATE_TRANSACTION;
          break;
        case VTU_STATUS_CODES.SERVICE_UNAVAILABLE:
          errorMessage = VTU_ERROR_MESSAGES.SERVICE_UNAVAILABLE;
          break;
      }
      
      return {
        success: false,
        message: errorMessage,
        status: response.status
      };
    }
  } catch (error) {
    console.error('VTU.ng Airtime Purchase Error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to purchase airtime. ';
    
    if (error.message.includes('HTML')) {
      errorMessage += 'VTU.ng API endpoint not accessible. Service may be down.';
    } else if (error.message.includes('404')) {
      errorMessage += 'VTU.ng API endpoint not found.';
    } else if (error.message.includes('401')) {
      errorMessage += 'VTU.ng authentication failed. Please check credentials.';
    } else if (error.message.includes('All VTU.ng endpoints failed')) {
      errorMessage += 'Unable to connect to VTU.ng service.';
    } else {
      errorMessage += error.message;
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message
    };
  }
};

/**
 * Requery transaction status on VTU.ng
 */
export const requeryVtuTransaction = async (reference) => {
  try {
    const response = await vtuRequest(`transaction/requery/${reference}`, 'GET');
    
    return {
      success: true,
      status: response.data?.status,
      message: response.message,
      transaction: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Get transaction history from VTU.ng
 */
export const getVtuTransactionHistory = async (params = {}) => {
  try {
    const { page = 1, limit = 20, type = 'airtime' } = params;
    
    const response = await vtuRequest(`transactions?page=${page}&limit=${limit}&type=${type}`, 'GET');
    
    return {
      success: true,
      transactions: response.data?.transactions || [],
      pagination: response.data?.pagination || {
        page: page,
        limit: limit,
        total: 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      transactions: []
    };
  }
};

/**
 * Update merchant credentials - Not needed in proxy mode
 * Backend proxy handles all authentication
 */
export const updateMerchantCredentials = async (username, password) => {
  console.log('Merchant credentials are managed on the backend server');
  return false; // Not supported in proxy mode
};

/**
 * Initialize VTU.ng service
 * Should be called on app startup
 */
export const initializeVtuService = async () => {
  try {
    console.log('🚀 Initializing VTU.ng service...');
    
    if (VTU_MERCHANT_CONFIG.useProxy) {
      console.log('✅ VTU.ng service configured to use backend proxy');
      console.log('🔐 Merchant credentials are securely managed on the server');
      console.log('📍 Backend URL:', VTU_MERCHANT_CONFIG.proxyConfig.baseUrl);
      return true;
    } else {
      console.log('⚠️  Direct VTU.ng access is disabled');
      console.log('📱 Please ensure backend proxy is properly configured');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize VTU.ng service:', error);
    return false;
  }
};

/**
 * Load merchant credentials - Not needed in proxy mode
 * Backend proxy handles all authentication
 */
export const loadMerchantCredentials = async () => {
  console.log('Merchant credentials are managed on the backend server');
  return true; // Always return true in proxy mode
};

/**
 * Check if merchant is authenticated - Always true in proxy mode
 */
export const isMerchantAuthenticated = async () => {
  if (VTU_MERCHANT_CONFIG.useProxy) {
    return true; // Backend proxy handles authentication
  }
  return false;
};

/**
 * Clear merchant session - Not needed in proxy mode
 */
export const clearMerchantSession = async () => {
  console.log('Session management handled by backend proxy');
  return true; // Always return true in proxy mode
};

/**
 * Test VTU.ng API connection via backend proxy
 */
export const testVtuConnection = async () => {
  try {
    console.log('🔍 Testing VTU.ng API connection via backend proxy...');
    
    if (!VTU_MERCHANT_CONFIG.useProxy) {
      return {
        success: false,
        message: 'Direct VTU.ng access disabled - only proxy mode supported'
      };
    }
    
    // Test health endpoint first
    try {
      console.log('🔍 Testing proxy health endpoint...');
      const healthResult = await vtuRequest('health', 'GET');
      console.log('✅ Proxy health check successful:', healthResult);
    } catch (healthError) {
      console.log('⚠️ Proxy health check failed:', healthError.message);
      return {
        success: false,
        message: `Backend proxy not accessible: ${healthError.message}`
      };
    }
    
    // Test balance endpoint via proxy
    try {
      console.log('💰 Testing merchant balance via proxy...');
      const balanceResult = await getVtuWalletBalance();
      
      if (balanceResult.success) {
        console.log('✅ VTU.ng proxy API connection successful!');
        console.log('💰 Merchant wallet balance:', balanceResult.balance);
        return {
          success: true,
          message: `Proxy API connection successful. Merchant balance: ₦${balanceResult.balance}`,
          balance: balanceResult.balance,
          proxy: true
        };
      } else {
        console.log('❌ VTU.ng proxy balance check failed:', balanceResult.message);
        return {
          success: false,
          message: `Proxy balance check failed: ${balanceResult.message}`
        };
      }
    } catch (authError) {
      console.log('⚠️ Proxy balance endpoint test failed:', authError.message);
      return {
        success: false,
        message: `Proxy authentication failed: ${authError.message}`
      };
    }
    
  } catch (error) {
    console.error('❌ VTU.ng proxy test completely failed:', error);
    return {
      success: false,
      message: error.message || 'Proxy connection test failed'
    };
  }
};