// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://waocard.co/app/api';
const SERVER_KEY = '105b1bb6bb635934dc758a8831a201ac';

// Common headers for all requests
const getHeaders = async () => {
  // Get auth token if available
  const token = await AsyncStorage.getItem('waocard_token');
  
  const headers = new Headers();
  headers.append("Cookie", "_us=1744552840; ad-con=%7B%26quot%3Bdate%26quot%3B%3A%26quot%3B2025-04-12%26quot%3B%2C%26quot%3Bads%26quot%3B%3A%5B%5D%7D; PHPSESSID=1pjujq451m8ol33eelm0is4ck9; mode=day");
  
  // Add auth token if available
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
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
      redirect: "follow"
    };
    
    if (data) {
      const formdata = new FormData();
      
      // Always append server key
      formdata.append("server_key", SERVER_KEY);
      
      // Append all other data
      Object.keys(data).forEach(key => {
        formdata.append(key, data[key]);
      });
      
      options.body = formdata;
    }
    
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
    const result = await response.json();
    
    // Check for API errors
    if (result.api_status !== 200) {
      throw new Error(result.errors?.error_text || 'An unknown error occurred');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};