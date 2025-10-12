// src/services/airtimeService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';
import { 
  purchaseAirtimeVtu, 
  validateVtuPhoneNumber, 
  getAirtimeVariations,
  getVtuTransactionHistory,
  requeryVtuTransaction,
  VTU_NETWORK_CODES 
} from './vtuApi';
import { 
  checkSufficientBalance, 
  deductFromWallet, 
  addToWallet 
} from './walletService';
import { VTU_MERCHANT_CONFIG } from '../config/vtuConfig';

/**
 * Get available network providers
 * @returns {Promise<Array>} Array of network providers
 */
export const getNetworkProviders = async () => {
  // Return static providers list - no API endpoint needed for airtime providers
  return [
    {
      id: 'mtn',
      name: 'MTN',
      color: '#FFCC00',
      icon: 'cellular',
      minimumAmount: 50,
      maximumAmount: 50000,
      vtuCode: VTU_NETWORK_CODES['MTN']
    },
    {
      id: 'airtel',
      name: 'Airtel',
      color: '#FF0000',
      icon: 'cellular',
      minimumAmount: 50,
      maximumAmount: 50000,
      vtuCode: VTU_NETWORK_CODES['Airtel']
    },
    {
      id: 'glo',
      name: 'Glo',
      color: '#00AA00',
      icon: 'cellular',
      minimumAmount: 50,
      maximumAmount: 50000,
      vtuCode: VTU_NETWORK_CODES['Glo']
    },
    {
      id: '9mobile',
      name: '9mobile',
      color: '#006600',
      icon: 'cellular',
      minimumAmount: 50,
      maximumAmount: 50000,
      vtuCode: VTU_NETWORK_CODES['9mobile']
    }
  ];
};

/**
 * Validate a phone number for a specific network provider
 * @param {string} providerId - The ID of the network provider
 * @param {string} phoneNumber - The phone number to validate
 * @returns {Promise<Object>} Validation result
 */
export const validatePhoneNumber = async (providerId, phoneNumber) => {
  try {
    // Try main API first
    try {
      const response = await apiRequest('validate_phone', 'POST', {
        provider_id: providerId,
        phone: phoneNumber
      });
      
      if (response.valid !== undefined) {
        return {
          valid: response.valid,
          message: response.message
        };
      }
    } catch (mainApiError) {
      console.log('Main API validation failed, trying VTU.ng:', mainApiError);
    }
    
    // Fallback to VTU.ng validation
    const vtuResponse = await validateVtuPhoneNumber(phoneNumber, providerId);
    return {
      valid: vtuResponse.valid,
      message: vtuResponse.message,
      customerName: vtuResponse.customerName
    };
  } catch (error) {
    console.error('Error validating phone number:', error);
    // Return a safe default when validation fails
    return {
      valid: true, // Allow proceeding even if validation fails
      message: 'Validation service unavailable, proceeding with purchase'
    };
  }
};

/**
 * Buy airtime for a phone number with wallet balance checking
 * @param {Object} data - The airtime purchase data
 * @param {string} data.providerId - The ID of the network provider
 * @param {string} data.phoneNumber - The recipient phone number
 * @param {number} data.amount - The amount of airtime to purchase
 * @param {string} data.userId - The ID of the user making the purchase
 * @param {Object} data.userData - The user data object with wallet
 * @returns {Promise<Object>} Purchase result
 */
export const buyAirtime = async (data) => {
  const { providerId, phoneNumber, amount, userId, userData } = data;
  const reference = `WC_${userId}_${Date.now()}`;
  
  console.log(`🔄 Starting airtime purchase: ₦${amount} for ${phoneNumber} (${providerId})`);
  
  try {
    // Step 1: Check user wallet balance
    console.log('💰 Checking user wallet balance...');
    const balanceCheck = await checkSufficientBalance(userData, amount);
    
    if (!balanceCheck.sufficient) {
      console.log('❌ Insufficient wallet balance');
      return {
        success: false,
        message: balanceCheck.message,
        insufficientBalance: true,
        currentBalance: balanceCheck.balance,
        required: amount,
        shortfall: balanceCheck.shortfall
      };
    }
    
    console.log(`✅ Sufficient balance: ₦${balanceCheck.balance}`);
    
    // Step 2: Try main API first
    console.log('🌐 Attempting purchase via main API...');
    try {
      const response = await apiRequest('buy_airtime', 'POST', {
        provider_id: providerId,
        phone: phoneNumber,
        amount: amount,
        user_id: userId,
        reference: reference
      });
      
      if (response.success || response.api_status === 200) {
        console.log('✅ Main API purchase successful');
        
        // Deduct from user wallet
        await deductFromWallet(userData, amount, `Airtime purchase - ${phoneNumber}`, reference);
        
        // Store transaction locally
        await storeTransactionLocally({
          ...data,
          transactionId: response.transaction_id,
          date: response.date || new Date().toISOString(),
          status: 'success',
          api: 'main',
          reference
        });
        
        return {
          success: true,
          message: response.message || 'Airtime purchase successful',
          transactionId: response.transaction_id,
          date: response.date,
          reference,
          amount: amount,
          amount_charged: response.amount_charged || amount,
          discount: response.discount || '0',
          network: providerId.toUpperCase(),
          product_name: 'Airtime',
          status: 'completed',
          api: 'main'
        };
      }
    } catch (mainApiError) {
      console.log('⚠️ Main API failed, trying VTU.ng fallback:', mainApiError.message);
    }
    
    // Step 3: Use VTU.ng API for purchase
    console.log('🔄 Attempting purchase via VTU.ng v2 API...');
    
    // Deduct from user wallet first
    const walletDeduction = await deductFromWallet(userData, amount, `Airtime purchase (pending) - ${phoneNumber}`, reference);
    
    if (!walletDeduction.success) {
      console.log('❌ Failed to deduct from wallet');
      return {
        success: false,
        message: 'Failed to process payment from wallet'
      };
    }
    
    console.log('💳 Amount deducted from user wallet');
    
    try {
      const vtuResponse = await purchaseAirtimeVtu({
        phone: phoneNumber,
        amount: amount,
        network: providerId,
        reference: reference
      });
      
      if (vtuResponse.success) {
        console.log('✅ VTU.ng v2 purchase successful');
        console.log(`💰 Transaction Details:`, {
          orderId: vtuResponse.transactionId,
          amount: vtuResponse.amount,
          charged: vtuResponse.amount_charged,
          discount: vtuResponse.discount,
          network: vtuResponse.network,
          status: vtuResponse.status
        });
        
        await storeTransactionLocally({
          ...data,
          transactionId: vtuResponse.transactionId,
          date: vtuResponse.timestamp,
          status: vtuResponse.status || 'success',
          api: 'vtu.ng',
          reference: vtuResponse.reference,
          amount: vtuResponse.amount,
          amount_charged: vtuResponse.amount_charged,
          discount: vtuResponse.discount,
          network: vtuResponse.network,
          product_name: vtuResponse.product_name
        });
        
        return {
          success: true,
          message: vtuResponse.message || 'Airtime purchase successful',
          transactionId: vtuResponse.transactionId,
          date: vtuResponse.timestamp,
          reference: vtuResponse.reference,
          amount: vtuResponse.amount,
          amount_charged: vtuResponse.amount_charged,
          discount: vtuResponse.discount,
          network: vtuResponse.network,
          product_name: vtuResponse.product_name,
          status: vtuResponse.status,
          initial_balance: vtuResponse.initial_balance,
          final_balance: vtuResponse.final_balance,
          newWalletBalance: walletDeduction.newBalance,
          api: 'vtu.ng'
        };
      } else {
        console.log('❌ VTU.ng purchase failed, refunding user wallet...');
        
        // Refund the user wallet since VTU purchase failed
        await addToWallet(userData, amount, `Refund - Failed airtime purchase ${phoneNumber}`, `${reference}_REFUND`);
        
        await storeTransactionLocally({
          ...data,
          transactionId: null,
          date: new Date().toISOString(),
          status: 'failed',
          api: 'vtu.ng',
          reference,
          errorMessage: vtuResponse.message
        });
        
        return {
          success: false,
          message: vtuResponse.message || 'Airtime purchase failed',
          refunded: true
        };
      }
    } catch (vtuError) {
      console.log('❌ VTU.ng API error, refunding user wallet...', vtuError.message);
      
      // Refund the user wallet since there was an error
      await addToWallet(userData, amount, `Refund - Error in airtime purchase ${phoneNumber}`, `${reference}_REFUND`);
      
      await storeTransactionLocally({
        ...data,
        transactionId: null,
        date: new Date().toISOString(),
        status: 'failed',
        api: 'vtu.ng',
        reference,
        errorMessage: vtuError.message
      });
      
      return {
        success: false,
        message: `Purchase failed: ${vtuError.message}`,
        refunded: true,
        error: vtuError.message
      };
    }
    
  } catch (error) {
    console.error('❌ Airtime purchase error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while processing your request'
    };
  }
};

/**
 * Store transaction locally for offline access
 * @param {Object} transaction - Transaction details to store
 */
const storeTransactionLocally = async (transaction) => {
  try {
    const storedHistory = await AsyncStorage.getItem('airtime_history');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    
    // Add new transaction at the beginning
    history.unshift({
      ...transaction,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 transactions
    const trimmedHistory = history.slice(0, 50);
    
    await AsyncStorage.setItem('airtime_history', JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error storing transaction locally:', error);
  }
};

/**
 * Get user's airtime purchase history
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of transaction history items
 */
export const getAirtimeHistory = async (userId) => {
  try {
    // Try to get from main API first
    try {
      const response = await apiRequest('get_airtime_history', 'POST', {
        user_id: userId
      });
      
      if (response.history && response.history.length > 0) {
        return response.history;
      }
    } catch (mainApiError) {
      console.log('Main API history fetch failed:', mainApiError);
    }
    
    // Try VTU.ng transaction history
    const vtuHistory = await getVtuTransactionHistory({ type: 'airtime' });
    if (vtuHistory.success && vtuHistory.transactions.length > 0) {
      // Map VTU.ng format to expected format
      return vtuHistory.transactions.map(tx => ({
        phone: tx.phone,
        provider: tx.network || tx.service_name,
        amount: tx.amount,
        amount_charged: tx.amount_charged,
        discount: tx.discount,
        product_name: tx.product_name,
        date: tx.created_at || tx.timestamp,
        status: tx.status,
        reference: tx.reference || tx.request_id,
        transactionId: tx.id || tx.transaction_id || tx.order_id
      }));
    }
    
    // Fallback to local storage
    const localHistory = await AsyncStorage.getItem('airtime_history');
    if (localHistory) {
      const history = JSON.parse(localHistory);
      // Filter by userId if needed
      return history.filter(tx => !userId || tx.userId === userId);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching airtime history:', error);
    // Return empty array instead of throwing
    return [];
  }
};

/**
 * Check transaction status
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Transaction status
 */
export const checkTransactionStatus = async (reference) => {
  try {
    const result = await requeryVtuTransaction(reference);
    return {
      success: result.success,
      status: result.status,
      message: result.message,
      transaction: result.transaction
    };
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return {
      success: false,
      message: 'Unable to check transaction status'
    };
  }
};