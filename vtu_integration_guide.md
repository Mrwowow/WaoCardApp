# VTU.ng API Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the VTU.ng API into your application. The VTU.ng API enables virtual top-up (VTU) services including airtime, data bundles, electricity bill payments, cable TV subscriptions, betting account funding, and recharge card printing.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Core Implementation Pattern](#core-implementation-pattern)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Webhook Implementation](#webhook-implementation)
7. [Best Practices](#best-practices)
8. [Sample Code Templates](#sample-code-templates)

## Getting Started

### Prerequisites

- VTU.ng account with **Reseller** role
- Completed KYC verification (recommended for higher limits)
- Server IP whitelisting (optional but recommended)
- HTTPS webhook endpoint (for real-time notifications)

### Account Limits by KYC Tier

| Tier | Verification | Daily Limit |
|------|-------------|-------------|
| Tier 1 | Email verified | ₦500,000 |
| Tier 2 | BVN verified | ₦2,000,000 |
| Tier 3 | Face, ID, Address verified | Unlimited |

### Base Configuration

```javascript
const CONFIG = {
  BASE_URL: 'https://vtu.ng/wp-json',
  AUTH_ENDPOINT: '/jwt-auth/v1/token',
  API_VERSION: '/api/v2',
  USERNAME: process.env.VTU_USERNAME,
  PASSWORD: process.env.VTU_PASSWORD,
  USER_PIN: process.env.VTU_USER_PIN // For webhook verification
};
```

## Authentication

### JWT Token Management

The API uses JWT tokens that expire after 7 days. Implement token refresh logic:

```javascript
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
    
    // Refresh token
    await this.refreshToken();
    return this.token;
  }

  async refreshToken() {
    const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.AUTH_ENDPOINT}`, {
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
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
}
```

## Core Implementation Pattern

### 1. Service Class Structure

```javascript
class VTUService {
  constructor() {
    this.auth = new VTUAuth(CONFIG.USERNAME, CONFIG.PASSWORD);
    this.baseURL = `${CONFIG.BASE_URL}${CONFIG.API_VERSION}`;
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

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new VTUError(error.code, error.message, response.status);
    }

    return response.json();
  }
}
```

### 2. Custom Error Handling

```javascript
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
```

## API Endpoints

### 1. Wallet Balance

```javascript
async checkBalance() {
  return await this.makeRequest('/balance');
}
```

### 2. Airtime Purchase

```javascript
async purchaseAirtime(phone, serviceId, amount, requestId = null) {
  // Validate inputs
  this.validatePhone(phone, serviceId);
  this.validateAmount(amount, serviceId, 'airtime');
  
  const data = {
    request_id: requestId || this.generateRequestId('airtime'),
    phone: this.normalizePhone(phone),
    service_id: serviceId,
    amount: amount
  };

  return await this.makeRequest('/airtime', 'POST', data);
}

validatePhone(phone, serviceId) {
  const prefixes = {
    'mtn': ['0803', '0806', '0703', '0706', '0813', '0810', '0814', '0816', '0903', '0906', '0913', '0916'],
    'airtel': ['0802', '0808', '0701', '0708', '0812', '0901', '0902', '0904', '0907', '0912'],
    'glo': ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
    '9mobile': ['0809', '0817', '0818', '0909', '0908']
  };

  const normalizedPhone = this.normalizePhone(phone);
  const phonePrefix = normalizedPhone.substring(0, 4);
  
  if (!prefixes[serviceId]?.includes(phonePrefix)) {
    throw new Error(`Phone number ${phone} does not match service provider ${serviceId}`);
  }
}

normalizePhone(phone) {
  // Convert +234xxxxxxxxx to 0xxxxxxxxx
  return phone.replace(/^\+234/, '0');
}
```

### 3. Data Purchase (with Variations)

```javascript
async getDataVariations(serviceId = null) {
  const endpoint = serviceId ? `/variations/data?service_id=${serviceId}` : '/variations/data';
  return await this.makeRequest(endpoint, 'GET', null, false); // Public endpoint
}

async purchaseData(phone, serviceId, variationId, requestId = null) {
  // Validate variation exists
  const variations = await this.getDataVariations(serviceId);
  const variation = variations.data.find(v => v.variation_id.toString() === variationId.toString());
  
  if (!variation || variation.availability !== 'Available') {
    throw new Error(`Data variation ${variationId} is not available`);
  }

  const data = {
    request_id: requestId || this.generateRequestId('data'),
    phone: this.normalizePhone(phone),
    service_id: serviceId,
    variation_id: variationId.toString()
  };

  return await this.makeRequest('/data', 'POST', data);
}
```

### 4. Customer Verification (Electricity/TV/Betting)

```javascript
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
```

### 5. Electricity Bill Payment

```javascript
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

  return await this.makeRequest('/electricity', 'POST', data);
}
```

### 6. Order Status Check

```javascript
async requeryOrder(requestId) {
  return await this.makeRequest('/requery', 'POST', { request_id: requestId });
}
```

## Error Handling

### Retry Logic Implementation

```javascript
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
      await this.sleep(delay);
    }
  }
}

sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Error Response Mapping

```javascript
const ERROR_CODES = {
  // Client Errors (400)
  'missing_fields': 'Required parameters are missing',
  'invalid_service': 'Invalid service provider or phone number',
  'below_minimum_amount': 'Amount is below minimum required',
  'above_maximum_amount': 'Amount exceeds maximum allowed',
  
  // Payment Errors (402)
  'insufficient_funds': 'Insufficient wallet balance',
  
  // Authentication Errors (403)
  'rest_forbidden': 'Unauthorized access - check token or IP whitelist',
  
  // Conflict Errors (409)
  'duplicate_request_id': 'Request ID already exists',
  'duplicate_order': 'Duplicate order within 3 minutes',
  
  // Rate Limiting (429)
  'rate_limit_exceeded': 'Too many requests - please wait',
  'wallet_busy': 'Wallet transaction in progress - retry shortly',
  
  // Server Errors (500)
  'wallet_error': 'Unable to retrieve wallet balance'
};
```

## Webhook Implementation

### Webhook Verification

```javascript
const crypto = require('crypto');

class WebhookHandler {
  constructor(userPin) {
    this.userPin = userPin;
  }

  verifySignature(payload, signature) {
    const computedSignature = crypto
      .createHmac('sha256', this.userPin)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature)
    );
  }

  handleWebhook(req, res) {
    const signature = req.headers['x-signature'] || '';
    const payload = req.rawBody || req.body;
    
    if (!this.verifySignature(payload, signature)) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid signature'
      });
    }

    const data = JSON.parse(payload);
    this.processWebhook(data);
    
    res.status(200).json({ status: 'success' });
  }

  processWebhook(data) {
    const { order_id, status, product_name, request_id } = data;
    
    switch (status) {
      case 'completed-api':
        this.handleOrderCompleted(data);
        break;
      case 'refunded':
        this.handleOrderRefunded(data);
        break;
      default:
        console.log(`Unknown webhook status: ${status}`);
    }
  }

  handleOrderCompleted(data) {
    // Update order status in your database
    // Send notification to user
    // Update user balance if needed
    console.log(`Order ${data.order_id} completed successfully`);
  }

  handleOrderRefunded(data) {
    // Update order status in your database
    // Refund user account
    // Send notification to user
    console.log(`Order ${data.order_id} was refunded`);
  }
}
```

### Express.js Webhook Route

```javascript
const express = require('express');
const app = express();

// Middleware to capture raw body
app.use('/webhook', express.raw({ type: 'application/json' }));

const webhookHandler = new WebhookHandler(CONFIG.USER_PIN);

app.post('/webhook', (req, res) => {
  webhookHandler.handleWebhook(req, res);
});
```

## Best Practices

### 1. Request ID Generation

```javascript
generateRequestId(type) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${timestamp}_${random}`;
}
```

### 2. Database Schema Recommendations

```sql
-- Orders table
CREATE TABLE vtu_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  order_id BIGINT,
  user_id BIGINT NOT NULL,
  product_name VARCHAR(50) NOT NULL,
  service_name VARCHAR(50),
  phone VARCHAR(20),
  customer_id VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  amount_charged DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_request_id (request_id),
  INDEX idx_user_status (user_id, status)
);

-- Variations cache table
CREATE TABLE vtu_variations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  variation_id VARCHAR(20) NOT NULL,
  service_id VARCHAR(20) NOT NULL,
  service_name VARCHAR(50) NOT NULL,
  product_type ENUM('data', 'tv') NOT NULL,
  plan_name VARCHAR(200),
  price DECIMAL(10,2) NOT NULL,
  availability ENUM('Available', 'Unavailable') NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_service_type (service_id, product_type)
);
```

### 3. Caching Strategy

```javascript
class VariationCache {
  constructor(redis) {
    this.redis = redis;
    this.CACHE_TTL = 3600; // 1 hour
  }

  async getVariations(type, serviceId = null) {
    const cacheKey = `variations:${type}:${serviceId || 'all'}`;
    
    let variations = await this.redis.get(cacheKey);
    if (variations) {
      return JSON.parse(variations);
    }

    // Fetch from API
    const vtuService = new VTUService();
    variations = await vtuService.makeRequest(
      `/variations/${type}${serviceId ? `?service_id=${serviceId}` : ''}`,
      'GET',
      null,
      false
    );

    // Cache for 1 hour
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(variations));
    
    return variations;
  }
}
```

### 4. Rate Limiting

```javascript
class RateLimiter {
  constructor(redis) {
    this.redis = redis;
  }

  async checkLimit(userId, endpoint, maxRequests = 10, windowMs = 60000) {
    const key = `rate_limit:${userId}:${endpoint}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
    }
    
    if (current > maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    return current;
  }
}
```

## Sample Code Templates

### Complete Service Implementation

```javascript
const VTU_SERVICE_PROVIDERS = {
  mtn: 'MTN',
  airtel: 'Airtel',
  glo: 'Glo',
  '9mobile': '9mobile'
};

const ELECTRICITY_PROVIDERS = {
  'ikeja-electric': 'Ikeja (IKEDC)',
  'eko-electric': 'Eko (EKEDC)',
  'abuja-electric': 'Abuja (AEDC)',
  // ... other providers
};

class ComprehensiveVTUService extends VTUService {
  // Airtime methods
  async buyAirtime(userId, phone, network, amount) {
    await this.rateLimiter.checkLimit(userId, 'airtime');
    
    const order = await this.createOrder(userId, {
      type: 'airtime',
      phone,
      network,
      amount
    });

    try {
      const result = await this.executeWithRetry(() =>
        this.purchaseAirtime(phone, network, amount, order.request_id)
      );

      await this.updateOrder(order.id, {
        order_id: result.data.order_id,
        status: result.data.status,
        amount_charged: result.data.amount_charged,
        discount: result.data.discount
      });

      return result;
    } catch (error) {
      await this.handleOrderError(order.id, error);
      throw error;
    }
  }

  // Data methods
  async buyData(userId, phone, network, planId) {
    const variations = await this.variationCache.getVariations('data', network);
    const plan = variations.data.find(v => v.variation_id.toString() === planId.toString());
    
    if (!plan || plan.availability !== 'Available') {
      throw new Error('Selected data plan is not available');
    }

    const order = await this.createOrder(userId, {
      type: 'data',
      phone,
      network,
      plan_id: planId,
      plan_name: plan.data_plan,
      amount: plan.price
    });

    try {
      const result = await this.executeWithRetry(() =>
        this.purchaseData(phone, network, planId, order.request_id)
      );

      await this.updateOrder(order.id, {
        order_id: result.data.order_id,
        status: result.data.status,
        amount_charged: result.data.amount_charged
      });

      return result;
    } catch (error) {
      await this.handleOrderError(order.id, error);
      throw error;
    }
  }

  // Utility methods
  async createOrder(userId, orderData) {
    const requestId = this.generateRequestId(orderData.type);
    
    return await this.db.orders.create({
      user_id: userId,
      request_id: requestId,
      product_name: orderData.type,
      service_name: VTU_SERVICE_PROVIDERS[orderData.network],
      phone: orderData.phone,
      amount: orderData.amount,
      status: 'initiated'
    });
  }

  async updateOrder(orderId, updates) {
    return await this.db.orders.update(orderId, {
      ...updates,
      updated_at: new Date()
    });
  }

  async handleOrderError(orderId, error) {
    await this.updateOrder(orderId, {
      status: 'failed',
      error_message: error.message
    });
  }
}
```

### Frontend Integration (React Hook)

```javascript
import { useState, useCallback } from 'react';

export const useVTUService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buyAirtime = useCallback(async (phone, network, amount) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/vtu/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, network, amount })
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDataPlans = useCallback(async (network) => {
    try {
      const response = await fetch(`/api/vtu/data-plans?network=${network}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    buyAirtime,
    getDataPlans
  };
};
```

### Environment Variables Template

```bash
# .env file
VTU_USERNAME=your_vtu_username
VTU_PASSWORD=your_vtu_password
VTU_USER_PIN=your_user_pin
VTU_WEBHOOK_URL=https://yourdomain.com/webhook
VTU_BASE_URL=https://vtu.ng/wp-json

# Database
DATABASE_URL=your_database_url

# Redis (for caching)
REDIS_URL=your_redis_url

# Security
JWT_SECRET=your_jwt_secret
```

## Testing Checklist

- [ ] Authentication flow works correctly
- [ ] All service providers are properly mapped
- [ ] Phone number validation for each network
- [ ] Error handling for all scenarios
- [ ] Webhook signature verification
- [ ] Database transactions are atomic
- [ ] Rate limiting is implemented
- [ ] Caching works for variations
- [ ] Retry logic handles transient failures
- [ ] Duplicate request prevention

## Production Deployment

1. **Security**: Store credentials in environment variables
2. **Monitoring**: Log all API requests and responses
3. **Alerting**: Set up alerts for failed transactions
4. **Backup**: Regular database backups
5. **SSL**: Ensure HTTPS for webhook endpoints
6. **Load Balancing**: Handle high traffic appropriately

---

## Support

For API issues, contact VTU.ng support:
- Email: support@vtu.ng
- Documentation: Latest VTU API documentation

Remember to test thoroughly with small amounts before production deployment!