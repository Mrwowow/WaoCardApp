// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
export const AuthContext = createContext({
  isLoading: true,
  userToken: null,
  userData: null,
  signIn: () => {},
  signOut: () => {},
  signUp: () => {},
  fetchUserData: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  // Initialize the auth state when the component mounts
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      let user = null;
      
      try {
        // Try to get user data and token from storage
        token = await AsyncStorage.getItem('waocard_token');
        const userDataString = await AsyncStorage.getItem('waocard_user_data');
        if (userDataString) {
          user = JSON.parse(userDataString);
        }
      } catch (e) {
        console.log('Failed to load auth state from storage:', e);
      }
      
      // Update state with the results
      setUserToken(token);
      setUserData(user);
      setIsLoading(false);
    };
    
    bootstrapAsync();
  }, []);

  // Auth context value with functions
  const authContext = {
    isLoading,
    userToken,
    userData,
    
    // Sign in function with real API implementation
    signIn: async (usernameOrToken, passwordOrNull) => {
      setIsLoading(true);
      console.log('AuthContext: Attempting sign in...');
      
      // Demo user special case - complete authentication without API call
      if (usernameOrToken === 'demo' && passwordOrNull === 'password') {
        console.log('AuthContext: Direct mock authentication for demo user');
        
        // Create a mock successful response with token
        const mockToken = 'mock-token-' + Date.now();
        const mockUserId = '1';
        
        try {
          // Store authentication data
          await AsyncStorage.setItem('waocard_token', mockToken);
          await AsyncStorage.setItem('waocard_user_id', mockUserId);
          
          // Update token state immediately
          setUserToken(mockToken);
          
          // Create complete mock user data
          const mockUserData = {
            id: mockUserId,
            username: 'demo',
            first_name: 'Demo',
            last_name: 'User',
            wallet: '1000.00',
            phone_number: '1234567890',
            email: 'demo@example.com',
            avatar: 'https://waocard.co/app/upload/photos/d-avatar.jpg',
            cover: 'https://waocard.co/app/upload/photos/d-cover.jpg',
            is_verified: 1,
            admin: "1",
            gender: 'male',
            gender_text: 'Male',
            address: '123 Demo Street, Demo City',
            details: {
              post_count: 5,
              album_count: 2,
              following_count: 10,
              followers_count: 20,
              groups_count: 3,
              likes_count: 50
            },
            social: {
              facebook: 'demo.user',
              twitter: 'demouser',
              instagram: 'demouser',
              linkedin: '',
              youtube: ''
            },
            points: '100',
            is_pro: true,
            pro_type: '1',
            lastseen_time_text: 'Just now',
            url: 'https://waocard.co/app/demo'
          };
          
          // Store and set user data
          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(mockUserData));
          setUserData(mockUserData);
          
          console.log('AuthContext: Mock authentication successful');
          setIsLoading(false);
          
          return { 
            success: true, 
            token: mockToken, 
            userId: mockUserId
          };
        } catch (error) {
          console.error('AuthContext: Error in demo authentication:', error);
          setIsLoading(false);
          throw error;
        }
      }
      
      // For token-based signin (when we already have a token)
      if (!passwordOrNull) {
        console.log('AuthContext: Token-based sign in');
        setUserToken(usernameOrToken);
        setIsLoading(false);
        return { success: true, token: usernameOrToken };
      }
      
      // Regular authentication with username and password
      try {
        // Prepare headers with cookies
        const myHeaders = new Headers();
        myHeaders.append("Cookie", "_us=1744852028; ad-con=%7B%26quot%3Bdate%26quot%3B%3A%26quot%3B2025-04-16%26quot%3B%2C%26quot%3Bads%26quot%3B%3A%5B%5D%7D; PHPSESSID=l5j0lmbl8ecc5jdll6eh1fdh7r; mode=day");
        
        // Prepare form data for authentication
        const formdata = new FormData();
        formdata.append("server_key", "105b1bb6bb635934dc758a8831a201ac");
        formdata.append("username", usernameOrToken);
        formdata.append("password", passwordOrNull);
        formdata.append("device_type", "phone");
        
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formdata,
          redirect: "follow"
        };
        
        // Make the authentication API request
        console.log('AuthContext: Sending authentication request');
        console.log('AuthContext: Username:', usernameOrToken, 'Password length:', passwordOrNull ? passwordOrNull.length : 0);
        
        // Continue with real API call for non-demo users
        const response = await fetch("https://waocard.co/app/api/auth", requestOptions);
        
        // Get response as text first for debugging
        const responseText = await response.text();
        console.log('AuthContext: Raw response:', responseText.substring(0, 300) + '...');
        
        // Try to parse JSON
        let result;
        try {
          result = JSON.parse(responseText);
          console.log('AuthContext: Authentication response parsed, status:', 
            result.api_status === 200 ? 'Success' : 'Failed');
          
          // Additional debugging - log entire result structure
          console.log('AuthContext: Response keys:', Object.keys(result).join(', '));
        } catch (parseError) {
          console.error('AuthContext: Error parsing authentication response:', parseError);
          throw new Error('Invalid JSON response from authentication server');
        }
        
        // Check if authentication was successful
        if (result.api_status === 200 || (result.api_status && result.api_status.toString() === '200')) {
          const token = result.access_token;
          const userId = result.user_id;
          
          console.log('AuthContext: Authentication successful, token obtained');
          
          // Store authentication data
          await AsyncStorage.setItem('waocard_token', token);
          await AsyncStorage.setItem('waocard_user_id', userId.toString());
          
          // Update token state immediately
          setUserToken(token);
          
          // Placeholder user data until full fetch
          const initialUserData = {
            id: userId.toString(),
            username: username,
            first_name: '',
            last_name: '',
            wallet: '0.00'
          };
          
          // Set initial user data
          setUserData(initialUserData);
          
          // Note: Full user data will be fetched separately with fetchUserData
          
          return { 
            success: true, 
            token: token, 
            userId: userId
          };
        } else {
          // Authentication failed - handle different error formats
          console.error('AuthContext: Authentication failed, error details:');
          
          // Debug all possible error fields
          if (result.errors) console.log('- errors:', JSON.stringify(result.errors));
          if (result.error_id) console.log('- error_id:', result.error_id);
          if (result.error_text) console.log('- error_text:', result.error_text);
          
          // Extract error message from wherever it might be in the response
          const errorMessage = 
            (result.errors && result.errors.error_text) ||  // Object with error_text
            result.error_text ||                           // Direct error_text
            (typeof result.errors === 'string' && result.errors) || // String errors
            'Authentication failed';                        // Fallback
          
          return { 
            success: false, 
            error: errorMessage,
            rawError: result  // Return raw error for debugging
          };
        }
      } catch (error) {
        console.error('AuthContext: Sign in error:', error);
        return { 
          success: false, 
          error: error.message || 'An error occurred during sign in'
        };
      } finally {
        setIsLoading(false);
      }
    },
    
    // Sign out function
    signOut: async () => {
      console.log('AuthContext: signOut called');
      setIsLoading(true);
      
      try {
        // Clear all auth-related data from storage
        const keysToRemove = [
          'waocard_token',
          'waocard_user_data',
          'waocard_credentials',
          'waocard_user_id'
        ];
        
        // Remove all keys in parallel for speed
        await Promise.all(keysToRemove.map(key => {
          console.log(`AuthContext: Removing ${key} from storage`);
          return AsyncStorage.removeItem(key);
        }));
        
        // Reset state
        console.log('AuthContext: Resetting auth state');
        setUserToken(null);
        setUserData(null);
        
        // React Native doesn't need explicit event dispatch for storage changes
        // AsyncStorage changes are automatically propagated if components re-read values
        console.log('AuthContext: Auth state reset complete');
        
        console.log('AuthContext: signOut completed successfully');
        return true;
      } catch (error) {
        console.error('AuthContext: Sign out error:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    
    // Sign up function 
    signUp: async (userData) => {
      setIsLoading(true);
      
      try {
        // This is a placeholder for your actual API call
        // const response = await fetch('your-signup-api-url', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(userData),
        // });
        // const result = await response.json();
        
        // For now, just simulate a successful registration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
      } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message || 'An error occurred during sign up' };
      } finally {
        setIsLoading(false);
      }
    },
    
    // Fetch user data using the provided API endpoint
    fetchUserData: async (token, phoneOrUsername) => {
      try {
        console.log('AuthContext: Fetching user data for:', phoneOrUsername);
        
        // Check for existing user data first to avoid unnecessary API calls
        try {
          const existingData = await AsyncStorage.getItem('waocard_user_data');
          if (existingData) {
            const userData = JSON.parse(existingData);
            if (userData && userData.username === phoneOrUsername) {
              console.log('AuthContext: Using existing user data from storage');
              setUserData(userData);
              return userData;
            }
          }
        } catch (storageError) {
          console.log('AuthContext: Error checking existing user data:', storageError);
        }
        
        // Check if this is our demo user
        if (phoneOrUsername === 'demo' || (token && token.startsWith && token.startsWith('mock-token-'))) {
          console.log('AuthContext: Using mock data for demo user');
          
          // Create complete mock user data
          const mockUserData = {
            id: '1',
            username: 'demo',
            first_name: 'Demo',
            last_name: 'User',
            wallet: '1000.00',
            phone_number: '1234567890',
            email: 'demo@example.com',
            avatar: 'https://waocard.co/app/upload/photos/d-avatar.jpg',
            cover: 'https://waocard.co/app/upload/photos/d-cover.jpg',
            is_verified: 1,
            admin: "1",
            gender: 'male',
            gender_text: 'Male',
            address: '123 Demo Street, Demo City',
            details: {
              post_count: 5,
              album_count: 2,
              following_count: 10,
              followers_count: 20,
              groups_count: 3,
              likes_count: 50
            },
            social: {
              facebook: 'demo.user',
              twitter: 'demouser',
              instagram: 'demouser',
              linkedin: '',
              youtube: ''
            },
            points: '100',
            is_pro: true,
            pro_type: '1',
            lastseen_time_text: 'Just now',
            url: 'https://waocard.co/app/demo'
          };
          
          // Store updated user data in AsyncStorage
          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(mockUserData));
          
          // Update state with the new user data
          setUserData(mockUserData);
          
          return mockUserData;
        }
        
        // For real users, continue with API call
        // Create headers
        const myHeaders = new Headers();
        myHeaders.append("Cookie", "_us=1744852028; ad-con=%7B%26quot%3Bdate%26quot%3B%3A%26quot%3B2025-04-16%26quot%3B%2C%26quot%3Bads%26quot%3B%3A%5B%5D%7D; PHPSESSID=l5j0lmbl8ecc5jdll6eh1fdh7r; mode=day");
        
        // Prepare form data for the API request
        const formdata = new FormData();
        formdata.append("server_key", "105b1bb6bb635934dc758a8831a201ac");
        formdata.append("fetch", "user_data");
        formdata.append("send_notify", "1");
        
        // Determine if input is a phone number or username
        const isPhone = phoneOrUsername && 
                       (phoneOrUsername.startsWith('+') || 
                        /^\d{10,15}$/.test(phoneOrUsername));
        
        let apiUrl = '';
        
        // Add appropriate parameter and select endpoint based on input type
        if (isPhone) {
          console.log('AuthContext: Using phone number for fetch');
          formdata.append("phone", phoneOrUsername);
          apiUrl = `https://waocard.co/app/api/get-user-data-phone?access_token=${token}`;
        } else {
          console.log('AuthContext: Using username for fetch');
          formdata.append("username", phoneOrUsername);
          apiUrl = `https://waocard.co/app/api/get-user-data-username?access_token=${token}`;
        }
        
        // Set up request options with headers
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formdata,
          redirect: "follow"
        };
        
        console.log('AuthContext: Sending request to:', apiUrl);
        
        // Make the API request
        const response = await fetch(apiUrl, requestOptions);
        
        // Get response as text first so we can log it if there's a parsing error
        const responseText = await response.text();
        
        // Try to parse the JSON response
        let result;
        try {
          result = JSON.parse(responseText);
          console.log('AuthContext: API response received:', 
            result.api_status === 200 ? 'Success' : 'Failed');
            
          // Log response structure for debugging
          console.log('AuthContext: Response structure:', 
            Object.keys(result).join(', '));
        } catch (parseError) {
          console.error('AuthContext: Error parsing JSON response:', parseError);
          console.log('AuthContext: Raw response:', responseText.substring(0, 500) + '...');
          throw new Error('Invalid JSON response from server');
        }
        
        // Check if the API request was successful
        if (result.api_status === 200 && result.user_data) {
          const fetchedUserData = result.user_data;
          
          // Process and normalize user data from the API based on the sample response
          const processedUserData = {
            id: fetchedUserData.user_id,
            username: fetchedUserData.username,
            first_name: fetchedUserData.first_name || '',
            last_name: fetchedUserData.last_name || '',
            wallet: fetchedUserData.wallet || '0.00',
            phone_number: fetchedUserData.phone_number,
            email: fetchedUserData.email,
            avatar: fetchedUserData.avatar,
            cover: fetchedUserData.cover,
            is_verified: fetchedUserData.verified === "1" || fetchedUserData.is_verified === 1,
            admin: fetchedUserData.admin === "1" ? "1" : "0",
            gender: fetchedUserData.gender || 'other',
            birthday: fetchedUserData.birthday,
            address: fetchedUserData.address || '',
            country_id: fetchedUserData.country_id,
            city: fetchedUserData.city || '',
            state: fetchedUserData.state || '',
            zip: fetchedUserData.zip || '',
            lat: fetchedUserData.lat,
            lng: fetchedUserData.lng,
            active: fetchedUserData.active === "1",
            balance: fetchedUserData.balance || "0",
            website: fetchedUserData.website || '',
            social: {
              facebook: fetchedUserData.facebook || '',
              twitter: fetchedUserData.twitter || '',
              instagram: fetchedUserData.instagram || '',
              linkedin: fetchedUserData.linkedin || '',
              youtube: fetchedUserData.youtube || ''
            },
            details: fetchedUserData.details ? {
              post_count: parseInt(fetchedUserData.details.post_count || '0'),
              album_count: parseInt(fetchedUserData.details.album_count || '0'),
              following_count: parseInt(fetchedUserData.details.following_count || '0'),
              followers_count: parseInt(fetchedUserData.details.followers_count || '0'),
              groups_count: parseInt(fetchedUserData.details.groups_count || '0'),
              likes_count: parseInt(fetchedUserData.details.likes_count || '0')
            } : {
              post_count: 0,
              album_count: 0,
              following_count: 0,
              followers_count: 0,
              groups_count: 0,
              likes_count: 0
            },
            // Additional fields from the sample
            points: fetchedUserData.points || '0',
            is_pro: fetchedUserData.is_pro === '1',
            pro_type: fetchedUserData.pro_type || '',
            gender_text: fetchedUserData.gender_text || (fetchedUserData.gender === 'male' ? 'Male' : fetchedUserData.gender === 'female' ? 'Female' : 'Other'),
            lastseen_time_text: fetchedUserData.lastseen_time_text || '',
            url: fetchedUserData.url || ''
          };
          
          console.log('AuthContext: User data processed successfully');
          
          // Store updated user data in AsyncStorage
          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(processedUserData));
          
          // Update state with the new user data
          setUserData(processedUserData);
          
          return processedUserData;
        } else {
          // Handle API error
          console.error('AuthContext: API returned error:', result.errors || 'Unknown error');
          
          // If we have existing user data, return it as fallback
          if (userData) {
            console.log('AuthContext: Using existing user data as fallback');
            return userData;
          }
          
          // Create minimal fallback data
          const fallbackUserData = {
            id: '0',
            username: phoneOrUsername || 'user',
            first_name: 'Anonymous',
            last_name: 'User',
            wallet: '0.00',
            phone_number: isPhone ? phoneOrUsername : '',
          };
          
          // Store and return fallback data
          setUserData(fallbackUserData);
          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(fallbackUserData));
          
          return fallbackUserData;
        }
      } catch (error) {
        console.error('AuthContext: Fetch user data error:', error);
        
        // Return existing data if available
        if (userData) {
          return userData;
        }
        
        // Create minimal error fallback
        const errorFallbackData = {
          id: '0',
          username: phoneOrUsername || 'user',
          first_name: 'Unknown',
          last_name: 'User',
          wallet: '0.00',
        };
        
        setUserData(errorFallbackData);
        await AsyncStorage.setItem('waocard_user_data', JSON.stringify(errorFallbackData));
        
        return errorFallbackData;
      }
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;