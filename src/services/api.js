// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://www.waobiz.app/api';

// Common headers for all requests
const getHeaders = async () => {
  // Get auth token if available
  const token = await AsyncStorage.getItem('waocard_token');

  const headers = {
    'accept': '*/*',
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Generic API request function
 */
export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const headers = await getHeaders();
    
    const options = {
      method,
      headers,
    };

    // Add JSON body if data is provided
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
    const result = await response.json();

    // Check for API errors - new API returns access_token on success
    if (!response.ok) {
      throw new Error(result.message || result.errors?.error_text || 'An unknown error occurred');
    }

    return result;
  } catch (error) {
    throw error;
  }
};