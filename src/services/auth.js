// src/services/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise} - Resolves to user data or rejects with error
 */
export const login = async (mobile, password) => {
    try {
      const response = await fetch("https://www.waobiz.app/api/waocard/auth", {
        method: "POST",
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: "login",
          mobile,
          password,
        }),
      });

      const result = await response.json();

      if (result.access_token) {
        // Store the access token securely
        await AsyncStorage.setItem('waocard_token', result.access_token);
        if (result.contact?.id) {
          await AsyncStorage.setItem('waocard_user_id', result.contact.id.toString());
        }

        return {
          success: true,
          token: result.access_token,
          refreshToken: result.refresh_token,
          contact: result.contact,
          userId: result.contact?.id?.toString(),
        };
      } else {
        // Handle API errors
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      // Handle network or other errors
      throw error;
    }
  };

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Resolves to user data or rejects with error
 */
export const register = async (userData) => {
  try {
    const response = await fetch("https://www.waobiz.app/api/waocard/auth", {
      method: "POST",
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: "register",
        mobile: userData.phone_num || userData.mobile,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      }),
    });

    const result = await response.json();

    if (result.access_token) {
      // Store the access token
      await AsyncStorage.setItem('waocard_token', result.access_token);

      // Store user ID if provided
      if (result.contact?.id) {
        await AsyncStorage.setItem('waocard_user_id', result.contact.id.toString());
      }

      return {
        success: true,
        message: result.message || "Registration successful",
        userId: result.contact?.id?.toString(),
        token: result.access_token,
        contact: result.contact,
      };
    } else {
      // Handle API errors
      throw new Error(result.message || 'Registration failed');
    }
  } catch (error) {
    // Handle network or other errors
    console.error("Registration error:", error);
    throw error;
  }
};
  
/**
 * Check if user is authenticated based on stored token
 * @returns {Promise<boolean>} - Whether user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('waocard_token');
    return !!token; // Return true if token exists
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};