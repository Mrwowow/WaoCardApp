// src/services/billsService.js
import { apiRequest } from './api';
import vtuService, { VTU_SERVICE_PROVIDERS } from './vtuService';

/**
 * Get available bill categories
 * @returns {Promise<Array>} Array of bill categories
 */
export const getBillCategories = async () => {
  try {
    const response = await apiRequest('get_bill_categories', 'POST');
    return response.categories || [];
  } catch (error) {
    console.error('Error fetching bill categories:', error);
    
    // Return fallback data when API fails
    return [
      {
        id: 'tv',
        name: 'TV Subscription',
        icon: 'tv',
        color: '#FF6B35'
      },
      {
        id: 'electricity',
        name: 'Electricity',
        icon: 'flash',
        color: '#F7931E'
      },
      {
        id: 'internet',
        name: 'Internet',
        icon: 'wifi',
        color: '#4ECDC4'
      },
      {
        id: 'water',
        name: 'Water',
        icon: 'water',
        color: '#45B7D1'
      },
      {
        id: 'education',
        name: 'Education',
        icon: 'school',
        color: '#96CEB4'
      }
    ];
  }
};

/**
 * Get providers for a specific bill category
 * @param {string} categoryId - The ID of the bill category
 * @returns {Promise<Array>} Array of providers for the category
 */
export const getBillProviders = async (categoryId) => {
  try {
    const response = await apiRequest('get_bill_providers', 'POST', {
      category_id: categoryId
    });
    
    return response.providers || [];
  } catch (error) {
    console.error('Error fetching bill providers:', error);
    
    // Return fallback data based on category
    const fallbackProviders = {
      tv: [
        { id: 'dstv', name: 'DSTV', color: '#1B4F72' },
        { id: 'gotv', name: 'GOtv', color: '#D35400' },
        { id: 'startimes', name: 'StarTimes', color: '#8E44AD' }
      ],
      electricity: [
        { id: 'ekedc', name: 'Eko (EKEDC)', color: '#E74C3C' },
        { id: 'ikedc', name: 'Ikeja (IKEDC)', color: '#3498DB' },
        { id: 'aedc', name: 'Abuja (AEDC)', color: '#F39C12' },
        { id: 'kedc', name: 'Kaduna (KEDC)', color: '#27AE60' }
      ],
      internet: [
        { id: 'mtn-data', name: 'MTN Data', color: '#FFCC00' },
        { id: 'airtel-data', name: 'Airtel Data', color: '#FF0000' },
        { id: 'glo-data', name: 'Glo Data', color: '#00AA00' },
        { id: '9mobile-data', name: '9mobile Data', color: '#006600' }
      ],
      water: [
        { id: 'lagos-water', name: 'Lagos Water Corporation', color: '#45B7D1' },
        { id: 'abuja-water', name: 'FCT Water Board', color: '#2980B9' }
      ],
      education: [
        { id: 'waec', name: 'WAEC', color: '#96CEB4' },
        { id: 'jamb', name: 'JAMB', color: '#58D68D' }
      ]
    };
    
    return fallbackProviders[categoryId] || [];
  }
};

/**
 * Validate bill information
 * @param {string} categoryId - The ID of the bill category
 * @param {string} providerId - The ID of the bill provider
 * @param {string} referenceNumber - The reference number to validate
 * @returns {Promise<Object>} Validation result
 */
export const validateBillInfo = async (categoryId, providerId, referenceNumber) => {
  try {
    const response = await apiRequest('validate_bill', 'POST', {
      category_id: categoryId,
      provider_id: providerId,
      reference: referenceNumber
    });
    
    return {
      valid: response.valid,
      message: response.message,
      customerName: response.customer_name,
      billDetails: response.bill_details
    };
  } catch (error) {
    console.error('Error validating bill info:', error);
    throw error;
  }
};

/**
 * Pay a bill
 * @param {Object} data - The bill payment data
 * @param {string} data.categoryId - The ID of the bill category
 * @param {string} data.providerId - The ID of the bill provider
 * @param {string} data.reference - The bill reference number
 * @param {number} data.amount - The amount to pay
 * @param {string} data.userId - The ID of the user making the payment
 * @returns {Promise<Object>} Payment result
 */
export const payBill = async (data) => {
  try {
    const response = await apiRequest('pay_bill', 'POST', {
      category_id: data.categoryId,
      provider_id: data.providerId,
      reference: data.reference,
      amount: data.amount,
      user_id: data.userId
    });
    
    return {
      success: response.success,
      message: response.message,
      transactionId: response.transaction_id,
      date: response.date
    };
  } catch (error) {
    console.error('Error paying bill:', error);
    throw error;
  }
};

/**
 * Get user's bill payment history
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of transaction history items
 */
export const getBillHistory = async (userId) => {
  try {
    const response = await apiRequest('get_bill_history', 'POST', {
      user_id: userId
    });
    
    return response.history || [];
  } catch (error) {
    console.error('Error fetching bill history:', error);
    throw error;
  }
};

// VTU.ng Enhanced Methods

/**
 * Get electricity providers with VTU support
 * @returns {Promise<Array>} Array of electricity providers
 */
export const getVTUElectricityProviders = async () => {
  try {
    const variations = await vtuService.getElectricityVariations();
    
    // Map VTU providers to our format
    const providers = Object.entries(VTU_SERVICE_PROVIDERS.electricity).map(([id, name]) => ({
      id,
      name,
      vtuServiceId: id,
      available: true,
      minimumAmount: 1000,
      supportsPrepaid: true,
      supportsPostpaid: true
    }));
    
    return providers;
  } catch (error) {
    console.error('Error fetching VTU electricity providers:', error);
    return [];
  }
};

/**
 * Verify electricity meter number using VTU
 * @param {string} meterNumber - The meter number to verify
 * @param {string} providerId - The provider ID
 * @param {string} meterType - 'prepaid' or 'postpaid'
 * @returns {Promise<Object>} Customer information
 */
export const verifyElectricityMeter = async (meterNumber, providerId, meterType = 'prepaid') => {
  try {
    const variationId = meterType === 'prepaid' ? 'prepaid' : 'postpaid';
    const result = await vtuService.verifyCustomer(meterNumber, providerId, variationId);
    
    return {
      success: true,
      customerName: result.data.customer_name,
      address: result.data.customer_address,
      minimumAmount: result.data.min_purchase_amount,
      meterNumber: meterNumber,
      meterType: meterType
    };
  } catch (error) {
    console.error('Error verifying meter:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify meter number'
    };
  }
};

/**
 * Pay electricity bill using VTU
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Payment result
 */
export const payElectricityBillVTU = async (data) => {
  try {
    const variationId = data.meterType === 'prepaid' ? 'prepaid' : 'postpaid';
    
    const result = await vtuService.purchaseElectricity(
      data.meterNumber,
      data.providerId,
      variationId,
      data.amount
    );
    
    return {
      success: true,
      message: 'Electricity payment successful',
      transactionId: result.data.order_id,
      token: result.data.token || null,
      units: result.data.units || null,
      amount: result.data.amount_charged,
      date: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error paying electricity bill:', error);
    throw error;
  }
};

/**
 * Get TV providers with VTU support
 * @returns {Promise<Array>} Array of TV providers
 */
export const getVTUTVProviders = async () => {
  try {
    const providers = Object.entries(VTU_SERVICE_PROVIDERS.tv).map(([id, name]) => ({
      id,
      name: name.toUpperCase(),
      vtuServiceId: id,
      available: true,
      hasPackages: true
    }));
    
    return providers;
  } catch (error) {
    console.error('Error fetching VTU TV providers:', error);
    return [];
  }
};

/**
 * Get TV packages for a provider
 * @param {string} providerId - The provider ID
 * @returns {Promise<Array>} Array of TV packages
 */
export const getTVPackages = async (providerId) => {
  try {
    const variations = await vtuService.getTVVariations(providerId);
    
    if (variations.data && variations.data.length > 0) {
      return variations.data
        .filter(pkg => pkg.availability === 'Available')
        .map(pkg => ({
          id: pkg.variation_id,
          name: pkg.bouquet_name,
          price: parseFloat(pkg.price),
          duration: pkg.duration || '1 month',
          available: true
        }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching TV packages:', error);
    return [];
  }
};

/**
 * Verify TV smart card number
 * @param {string} smartCardNumber - The smart card number
 * @param {string} providerId - The provider ID
 * @returns {Promise<Object>} Customer information
 */
export const verifySmartCard = async (smartCardNumber, providerId) => {
  try {
    const result = await vtuService.verifyCustomer(smartCardNumber, providerId);
    
    return {
      success: true,
      customerName: result.data.customer_name,
      status: result.data.subscription_status,
      dueDate: result.data.due_date,
      currentPackage: result.data.current_bouquet
    };
  } catch (error) {
    console.error('Error verifying smart card:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify smart card number'
    };
  }
};

/**
 * Pay TV subscription using VTU
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Payment result
 */
export const payTVSubscriptionVTU = async (data) => {
  try {
    const result = await vtuService.purchaseTV(
      data.smartCardNumber,
      data.providerId,
      data.packageId
    );
    
    return {
      success: true,
      message: 'TV subscription successful',
      transactionId: result.data.order_id,
      package: data.packageName,
      amount: result.data.amount_charged,
      date: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error paying TV subscription:', error);
    throw error;
  }
};

/**
 * Purchase data bundle
 * @param {Object} data - Purchase data
 * @returns {Promise<Object>} Purchase result
 */
export const purchaseDataBundle = async (data) => {
  try {
    const result = await vtuService.purchaseData(
      data.phoneNumber,
      data.network,
      data.planId
    );
    
    return {
      success: true,
      message: 'Data purchase successful',
      transactionId: result.data.order_id,
      amount: result.data.amount_charged,
      date: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error purchasing data:', error);
    throw error;
  }
};

/**
 * Check VTU transaction status
 * @param {string} requestId - The request ID
 * @returns {Promise<Object>} Transaction status
 */
export const checkVTUTransactionStatus = async (requestId) => {
  try {
    const result = await vtuService.requeryOrder(requestId);
    
    return {
      success: true,
      status: result.data.status,
      message: result.data.message,
      transactionId: result.data.order_id
    };
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return {
      success: false,
      error: error.message || 'Failed to check transaction status'
    };
  }
};