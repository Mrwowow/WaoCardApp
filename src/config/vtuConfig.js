// VTU.ng Merchant Configuration
// IMPORTANT: In production, use environment variables or secure vault service

export const VTU_MERCHANT_CONFIG = {
  // Enable/Disable VTU.ng Integration
  enabled: true, // VTU.ng API is now enabled
  
  // Use backend proxy instead of direct VTU.ng API
  useProxy: true,
  
  // Backend proxy configuration
  proxyConfig: {
    baseUrl: 'https://waocard.co/api/vtu_proxy.php', // Direct endpoint URL
    proxyEndpoint: '', // No additional endpoint needed
    endpoints: {
      balance: 'balance',
      airtime: 'airtime',
      health: 'health'
    }
  },
  
  // Direct VTU.ng API configuration (fallback)
  directConfig: {
    baseUrl: 'https://vtu.ng',
    apiVersion: 'v2',
  },
  
  // Public endpoints (no auth required)
  publicEndpoints: [
    'variations/data',
    'variations/tv',
    'variations/electricity',
    'verify/meter',
    'verify/iuc',
    'verify/smartcard'
  ],
  
  // Token refresh interval (12 hours in milliseconds)
  tokenRefreshInterval: 12 * 60 * 60 * 1000,
  
  // Request timeout (30 seconds)
  requestTimeout: 30000,
  
  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  
  // Transaction limits
  minAirtimeAmount: 50,
  maxAirtimeAmount: 50000,
  
  // Enable debug logging
  debug: true
};

// Network provider configuration
export const NETWORK_CONFIG = {
  providers: {
    mtn: {
      name: 'MTN',
      code: 'mtn',
      color: '#FFCC00',
      prefixes: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916', '07025', '07026', '0704']
    },
    airtel: {
      name: 'Airtel',
      code: 'airtel',
      color: '#FF0000',
      prefixes: ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912', '0911']
    },
    glo: {
      name: 'Glo',
      code: 'glo',
      color: '#00AA00',
      prefixes: ['0805', '0807', '0705', '0815', '0811', '0905', '0915']
    },
    '9mobile': {
      name: '9mobile',
      code: '9mobile',
      color: '#006600',
      prefixes: ['0809', '0818', '0817', '0909', '0908']
    }
  }
};

// Error messages
export const VTU_ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance. Please contact support to fund the merchant wallet.',
  INVALID_PHONE: 'The phone number provided is invalid. Please check and try again.',
  INVALID_AMOUNT: 'Invalid amount. Amount must be between ₦50 and ₦50,000.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please contact support.',
  DUPLICATE_TRANSACTION: 'This transaction appears to be a duplicate. Please wait a moment and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.'
};

// Success messages
export const VTU_SUCCESS_MESSAGES = {
  PURCHASE_SUCCESS: 'Airtime purchase successful!',
  BALANCE_FETCHED: 'Wallet balance retrieved successfully.',
  AUTH_SUCCESS: 'Authentication successful.',
  VALIDATION_SUCCESS: 'Phone number validated successfully.'
};