// src/services/airtimeService.js
import { apiRequest } from './api';

/**
 * Get available network providers
 * @returns {Promise<Array>} Array of network providers
 */
export const getNetworkProviders = async () => {
  try {
    const response = await apiRequest('get_network_providers', 'POST');
    return response.providers || [];
  } catch (error) {
    console.error('Error fetching network providers:', error);
    
    // Return fallback data when API fails
    return [
      {
        id: 'mtn',
        name: 'MTN',
        color: '#FFCC00',
        icon: 'cellular',
        minimumAmount: 50,
        maximumAmount: 50000
      },
      {
        id: 'airtel',
        name: 'Airtel',
        color: '#FF0000',
        icon: 'cellular',
        minimumAmount: 50,
        maximumAmount: 50000
      },
      {
        id: 'glo',
        name: 'Glo',
        color: '#00AA00',
        icon: 'cellular',
        minimumAmount: 50,
        maximumAmount: 50000
      },
      {
        id: '9mobile',
        name: '9mobile',
        color: '#006600',
        icon: 'cellular',
        minimumAmount: 50,
        maximumAmount: 50000
      }
    ];
  }
};

/**
 * Validate a phone number for a specific network provider
 * @param {string} providerId - The ID of the network provider
 * @param {string} phoneNumber - The phone number to validate
 * @returns {Promise<Object>} Validation result
 */
export const validatePhoneNumber = async (providerId, phoneNumber) => {
  try {
    const response = await apiRequest('validate_phone', 'POST', {
      provider_id: providerId,
      phone: phoneNumber
    });
    
    return {
      valid: response.valid,
      message: response.message
    };
  } catch (error) {
    console.error('Error validating phone number:', error);
    throw error;
  }
};

/**
 * Buy airtime for a phone number
 * @param {Object} data - The airtime purchase data
 * @param {string} data.providerId - The ID of the network provider
 * @param {string} data.phoneNumber - The recipient phone number
 * @param {number} data.amount - The amount of airtime to purchase
 * @param {string} data.userId - The ID of the user making the purchase
 * @returns {Promise<Object>} Purchase result
 */
export const buyAirtime = async (data) => {
  try {
    const response = await apiRequest('buy_airtime', 'POST', {
      provider_id: data.providerId,
      phone: data.phoneNumber,
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
    console.error('Error purchasing airtime:', error);
    throw error;
  }
};

/**
 * Get user's airtime purchase history
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of transaction history items
 */
export const getAirtimeHistory = async (userId) => {
  try {
    const response = await apiRequest('get_airtime_history', 'POST', {
      user_id: userId
    });
    
    return response.history || [];
  } catch (error) {
    console.error('Error fetching airtime history:', error);
    throw error;
  }
};