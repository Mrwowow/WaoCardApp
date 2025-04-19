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
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Resolves to user data or rejects with error
 */
export const register = async (userData) => {
  try {
    const formdata = new FormData();
    formdata.append("server_key", "105b1bb6bb635934dc758a8831a201ac");
    formdata.append("username", userData.username);
    formdata.append("password", userData.password);
    formdata.append("email", userData.email);
    formdata.append("confirm_password", userData.confirm_password);
    formdata.append("phone_num", userData.phone_num);
    formdata.append("gender", userData.gender);
    formdata.append("first_name", userData.first_name);
    formdata.append("last_name", userData.last_name);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow"
    };

    const response = await fetch("https://waocard.co/app/api/create-account", requestOptions);
    const resultText = await response.text();
    
    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", resultText);
      throw new Error("Invalid response from server");
    }

    if (result.api_status === 200) {
      // Store the access token if it's provided in the response
      if (result.access_token) {
        await AsyncStorage.setItem('waocard_token', result.access_token);
      }
      
      // Store user ID if provided
      if (result.user_id) {
        await AsyncStorage.setItem('waocard_user_id', result.user_id);
      }
      
      return {
        success: true,
        message: result.message || "Registration successful",
        userId: result.user_id,
        token: result.access_token,
        membership: result.membership
      };
    } else {
      // Handle API errors
      let errorMessage = 'Registration failed';
      
      // Extract error message from various possible response formats
      if (result.errors && result.errors.error_text) {
        errorMessage = result.errors.error_text;
      } else if (result.error_message) {
        errorMessage = result.error_message;
      } else if (result.message) {
        errorMessage = result.message;
      } else if (typeof result.errors === 'string') {
        errorMessage = result.errors;
      }
      
      throw new Error(errorMessage);
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