// src/services/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise} - Resolves to user data or rejects with error
 */
export const login = async (username, password) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Cookie", "_us=1744552840; ad-con=%7B%26quot%3Bdate%26quot%3B%3A%26quot%3B2025-04-12%26quot%3B%2C%26quot%3Bads%26quot%3B%3A%5B%5D%7D; PHPSESSID=1pjujq451m8ol33eelm0is4ck9; mode=day");
      
      const formdata = new FormData();
      formdata.append("server_key", "105b1bb6bb635934dc758a8831a201ac");
      formdata.append("username", username);
      formdata.append("password", password);
      formdata.append("device_type", "phone");
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
      };
      
      const response = await fetch("https://waocard.co/app/api/auth", requestOptions);
      const result = await response.json();
      
      if (result.api_status === 200) {
        // Store the access token securely
        await AsyncStorage.setItem('waocard_token', result.access_token);
        await AsyncStorage.setItem('waocard_user_id', result.user_id);
        
        return {
          success: true,
          token: result.access_token,
          userId: result.user_id,
          platform: result.user_platform,
          membership: result.membership
        };
      } else {
        // Handle API errors
        throw new Error(result.errors?.error_text || 'Login failed');
      }
    } catch (error) {
      // Handle network or other errors
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