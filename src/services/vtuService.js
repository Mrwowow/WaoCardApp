// src/services/vtuService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// VTU Configuration
const VTU_CONFIG = {
  BASE_URL: 'https://vtu.ng/wp-json',
  AUTH_ENDPOINT: '/jwt-auth/v1/token',
  API_VERSION: '/api/v2',
  // These should be stored securely in production
  USERNAME: 'waocard@gmail.com', // Replace with actual username
  PASSWORD: 'Possible@2023', // Replace with actual password
  USER_PIN: '4777' // Replace with actual pin
};

// Service provider mappings
export const VTU_SERVICE_PROVIDERS = {
  airtime: {
    mtn: 'mtn',
    airtel: 'airtel',
    glo: 'glo',
    '9mobile': '9mobile'
  },
  data: {
    mtn: 'mtn',
    airtel: 'airtel',
    glo: 'glo',
    '9mobile': '9mobile'
  },
  electricity: {
    'ikeja-electric': 'ikeja-electric',
    'eko-electric': 'eko-electric',
    'abuja-electric': 'abuja-electric',
    'kaduna-electric': 'kaduna-electric',
    'kano-electric': 'kano-electric',
    'jos-electric': 'jos-electric',
    'ibadan-electric': 'ibadan-electric',
    'enugu-electric': 'enugu-electric',
    'port-harcourt-electric': 'port-harcourt-electric',
    'benin-electric': 'benin-electric',
    'yola-electric': 'yola-electric'
  },
  tv: {
    dstv: 'dstv',
    gotv: 'gotv',
    startimes: 'startimes'
  }
};

// Phone number prefixes for validation
const PHONE_PREFIXES = {
  mtn: ['0803', '0806', '0703', '0706', '0813', '0810', '0814', '0816', '0903', '0906', '0913', '0916'],
  airtel: ['0802', '0808', '0701', '0708', '0812', '0901', '0902', '0904', '0907', '0912'],
  glo: ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
  '9mobile': ['0809', '0817', '0818', '0909', '0908']
};

// Custom error class for VTU operations
class VTUError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = 'VTUError';
    this.code = code;
    this.statusCode = statusCode;
  }

  isRetryable() {
    const retryableCodes = ['wallet_busy', 'rate_limit_exceeded'];
    return retryableCodes.includes(this.code);
  }

  isFundingIssue() {
    return this.code === 'insufficient_funds';
  }

  isDuplicateRequest() {
    return ['duplicate_request_id', 'duplicate_order'].includes(this.code);
  }
}

// JWT Authentication handler
class VTUAuth {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken() {
    // Check if token exists and is not expired
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    
    // Try to get token from AsyncStorage
    try {
      const storedToken = await AsyncStorage.getItem('vtu_token');
      const storedExpiry = await AsyncStorage.getItem('vtu_token_expiry');
      
      if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
        this.token = storedToken;
        this.tokenExpiry = parseInt(storedExpiry);
        return this.token;
      }
    } catch (error) {
      console.error('Error reading VTU token from storage:', error);
    }
    
    // Refresh token
    await this.refreshToken();
    return this.token;
  }

  async refreshToken() {
    try {
      const response = await fetch(`${VTU_CONFIG.BASE_URL}${VTU_CONFIG.AUTH_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = Date.now() + (6 * 24 * 60 * 60 * 1000); // 6 days
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('vtu_token', this.token);
      await AsyncStorage.setItem('vtu_token_expiry', this.tokenExpiry.toString());
    } catch (error) {
      console.error('VTU authentication error:', error);
      throw error;
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
}

// Main VTU Service class
class VTUService {
  constructor() {
    this.auth = new VTUAuth(VTU_CONFIG.USERNAME, VTU_CONFIG.PASSWORD);
    this.baseURL = `${VTU_CONFIG.BASE_URL}${VTU_CONFIG.API_VERSION}`;
  }

  async makeRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${this.baseURL}${endpoint}`;
    const options = { method };

    if (requiresAuth) {
      await this.auth.getToken();
      options.headers = this.auth.getHeaders();
    }

    if (data) {
      options.body = JSON.stringify(data);
      options.headers = options.headers || {};
      options.headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new VTUError(
          responseData.code || 'unknown_error',
          responseData.message || 'An error occurred',
          response.status
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof VTUError) {
        throw error;
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Utility methods
  generateRequestId(type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${timestamp}_${random}`;
  }

  normalizePhone(phone) {
    // Convert +234xxxxxxxxx to 0xxxxxxxxx
    return phone.replace(/^\+234/, '0');
  }

  validatePhone(phone, serviceId) {
    const normalizedPhone = this.normalizePhone(phone);
    const phonePrefix = normalizedPhone.substring(0, 4);
    
    if (!PHONE_PREFIXES[serviceId]?.includes(phonePrefix)) {
      throw new Error(`Phone number ${phone} does not match service provider ${serviceId}`);
    }
    
    return normalizedPhone;
  }

  validateAmount(amount, minAmount = 50, maxAmount = 50000) {
    if (amount < minAmount) {
      throw new Error(`Amount must be at least ₦${minAmount}`);
    }
    if (amount > maxAmount) {
      throw new Error(`Amount cannot exceed ₦${maxAmount}`);
    }
  }

  // Retry logic for failed requests
  async executeWithRetry(operation, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!(error instanceof VTUError) || !error.isRetryable()) {
          throw error;
        }
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // API Methods

  // Check wallet balance
  async checkBalance() {
    return await this.makeRequest('/balance');
  }

  // Get airtime variations
  async getAirtimeVariations() {
    return await this.makeRequest('/variations/airtime', 'GET', null, false);
  }

  // Purchase airtime
  async purchaseAirtime(phone, serviceId, amount, requestId = null) {
    // Validate inputs
    const normalizedPhone = this.validatePhone(phone, serviceId);
    this.validateAmount(amount);
    
    const data = {
      request_id: requestId || this.generateRequestId('airtime'),
      phone: normalizedPhone,
      service_id: serviceId,
      amount: amount
    };

    return await this.executeWithRetry(() => 
      this.makeRequest('/airtime', 'POST', data)
    );
  }

  // Get data variations
  async getDataVariations(serviceId = null) {
    const endpoint = serviceId ? `/variations/data?service_id=${serviceId}` : '/variations/data';
    return await this.makeRequest(endpoint, 'GET', null, false);
  }

  // Purchase data
  async purchaseData(phone, serviceId, variationId, requestId = null) {
    const normalizedPhone = this.validatePhone(phone, serviceId);
    
    // Validate variation exists
    const variations = await this.getDataVariations(serviceId);
    const variation = variations.data.find(v => v.variation_id.toString() === variationId.toString());
    
    if (!variation || variation.availability !== 'Available') {
      throw new Error(`Data variation ${variationId} is not available`);
    }

    const data = {
      request_id: requestId || this.generateRequestId('data'),
      phone: normalizedPhone,
      service_id: serviceId,
      variation_id: variationId.toString()
    };

    return await this.executeWithRetry(() => 
      this.makeRequest('/data', 'POST', data)
    );
  }

  // Verify customer (for electricity, TV, betting)
  async verifyCustomer(customerId, serviceId, variationId = null) {
    const data = {
      customer_id: customerId,
      service_id: serviceId
    };

    if (variationId) {
      data.variation_id = variationId;
    }

    return await this.makeRequest('/verify-customer', 'POST', data);
  }

  // Get electricity variations
  async getElectricityVariations(serviceId = null) {
    const endpoint = serviceId ? `/variations/electricity?service_id=${serviceId}` : '/variations/electricity';
    return await this.makeRequest(endpoint, 'GET', null, false);
  }

  // Purchase electricity
  async purchaseElectricity(customerId, serviceId, variationId, amount, requestId = null) {
    // Verify customer first
    const verification = await this.verifyCustomer(customerId, serviceId, variationId);
    
    if (amount < verification.data.min_purchase_amount) {
      throw new Error(`Amount below minimum: ₦${verification.data.min_purchase_amount}`);
    }

    const data = {
      request_id: requestId || this.generateRequestId('electricity'),
      customer_id: customerId,
      service_id: serviceId,
      variation_id: variationId,
      amount: amount
    };

    return await this.executeWithRetry(() => 
      this.makeRequest('/electricity', 'POST', data)
    );
  }

  // Get TV variations
  async getTVVariations(serviceId = null) {
    const endpoint = serviceId ? `/variations/tv?service_id=${serviceId}` : '/variations/tv';
    return await this.makeRequest(endpoint, 'GET', null, false);
  }

  // Purchase TV subscription
  async purchaseTV(customerId, serviceId, variationId, requestId = null) {
    // Verify customer first
    const verification = await this.verifyCustomer(customerId, serviceId, variationId);
    
    const data = {
      request_id: requestId || this.generateRequestId('tv'),
      customer_id: customerId,
      service_id: serviceId,
      variation_id: variationId
    };

    return await this.executeWithRetry(() => 
      this.makeRequest('/tv', 'POST', data)
    );
  }

  // Check order status
  async requeryOrder(requestId) {
    return await this.makeRequest('/requery', 'POST', { request_id: requestId });
  }

  // Get transaction history
  async getTransactionHistory(page = 1, limit = 20) {
    return await this.makeRequest(`/transactions?page=${page}&limit=${limit}`);
  }
}

// Export singleton instance
const vtuService = new VTUService();
export default vtuService;

// Export error class for external use
export { VTUError };