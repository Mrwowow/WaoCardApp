// Wallet Service for user balance management
import { apiRequest } from './api';

/**
 * Get user wallet balance
 * Since there's no API endpoint, we'll use the userData from context
 * @param {Object} userData - The user data object with wallet property
 * @returns {Promise<Object>} Wallet balance result
 */
export const getUserWalletBalance = async (userData) => {
  try {
    // Use wallet balance from userData directly
    const balance = parseFloat(userData?.wallet || 0);
    
    return {
      success: true,
      balance: balance,
      currency: 'NGN'
    };
  } catch (error) {
    console.error('Error getting user wallet balance:', error);
    return {
      success: false,
      balance: 0,
      message: error.message || 'Failed to get wallet balance'
    };
  }
};

/**
 * Check if user has sufficient balance for a transaction
 * @param {Object} userData - The user data object with wallet property
 * @param {number} amount - The amount to check
 * @returns {Promise<Object>} Balance check result
 */
export const checkSufficientBalance = async (userData, amount) => {
  try {
    const balance = parseFloat(userData?.wallet || 0);
    const sufficient = balance >= amount;
    
    return {
      sufficient,
      balance: balance,
      required: amount,
      shortfall: sufficient ? 0 : amount - balance,
      message: sufficient 
        ? 'Sufficient balance available' 
        : `Insufficient balance. You need ₦${(amount - balance).toFixed(2)} more.`
    };
  } catch (error) {
    console.error('Error checking sufficient balance:', error);
    return {
      sufficient: false,
      balance: 0,
      required: amount,
      message: error.message || 'Failed to check balance'
    };
  }
};

/**
 * Deduct amount from user wallet (local simulation)
 * Since there's no API endpoint, this will just return success
 * In a real app, the backend would handle this
 * @param {Object} userData - Current user data
 * @param {number} amount - The amount to deduct
 * @param {string} description - Transaction description
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Deduction result
 */
export const deductFromWallet = async (userData, amount, description, reference) => {
  try {
    const currentBalance = parseFloat(userData?.wallet || 0);
    const newBalance = currentBalance - amount;
    
    // In a real app, this would update the backend
    // For now, just return success with new balance
    console.log(`Wallet deduction: ${description} - ₦${amount}`);
    
    return {
      success: true,
      newBalance: newBalance,
      transactionId: `TXN_${Date.now()}`,
      message: 'Amount deducted successfully'
    };
  } catch (error) {
    console.error('Error deducting from wallet:', error);
    return {
      success: false,
      message: error.message || 'Failed to deduct from wallet'
    };
  }
};

/**
 * Add amount to user wallet (for refunds - local simulation)
 * @param {Object} userData - Current user data
 * @param {number} amount - The amount to add
 * @param {string} description - Transaction description
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Addition result
 */
export const addToWallet = async (userData, amount, description, reference) => {
  try {
    const currentBalance = parseFloat(userData?.wallet || 0);
    const newBalance = currentBalance + amount;
    
    // In a real app, this would update the backend
    console.log(`Wallet refund: ${description} + ₦${amount}`);
    
    return {
      success: true,
      newBalance: newBalance,
      transactionId: `TXN_${Date.now()}`,
      message: 'Amount added successfully'
    };
  } catch (error) {
    console.error('Error adding to wallet:', error);
    return {
      success: false,
      message: error.message || 'Failed to add to wallet'
    };
  }
};

/**
 * Get wallet transaction history
 * @param {string} userId - The user ID
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Object>} Transaction history result
 */
export const getWalletTransactions = async (userId, limit = 20) => {
  try {
    const response = await apiRequest('get_wallet_transactions', 'POST', {
      user_id: userId,
      limit: limit
    });
    
    return {
      success: true,
      transactions: response.transactions || [],
      pagination: response.pagination || {}
    };
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return {
      success: false,
      transactions: [],
      message: error.message || 'Failed to fetch wallet transactions'
    };
  }
};