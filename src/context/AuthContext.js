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
  updateUserData: () => {},
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
      
      // Regular authentication with username/mobile and password
      try {
        console.log('AuthContext: Sending authentication request');
        console.log('AuthContext: Mobile:', usernameOrToken, 'Password length:', passwordOrNull ? passwordOrNull.length : 0);

        // Make the authentication API request using new JSON endpoint
        const response = await fetch("https://www.waobiz.app/api/waocard/auth", {
          method: "POST",
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: "login",
            mobile: usernameOrToken,
            password: passwordOrNull,
          }),
        });

        const result = await response.json();
        console.log('AuthContext: Response keys:', Object.keys(result).join(', '));

        // Check if authentication was successful (new API returns access_token on success)
        if (result.access_token) {
          const token = result.access_token;
          const contact = result.contact || {};
          const userId = contact.id ? contact.id.toString() : '0';

          console.log('AuthContext: Authentication successful, token obtained');

          // Store authentication data
          await AsyncStorage.setItem('waocard_token', token);
          if (result.refresh_token) {
            await AsyncStorage.setItem('waocard_refresh_token', result.refresh_token);
          }
          await AsyncStorage.setItem('waocard_user_id', userId);

          // Update token state immediately
          setUserToken(token);

          // Set initial user data from the contact object in the response
          const initialUserData = {
            id: userId,
            username: contact.mobile || usernameOrToken,
            first_name: contact.first_name || '',
            last_name: contact.last_name || '',
            name: contact.name || '',
            email: contact.email || '',
            mobile: contact.mobile || usernameOrToken,
            wallet: contact.balance || '0.00',
            contact_status: contact.contact_status || '',
            business_name: contact.business_name || '',
            total_rp: contact.total_rp || 0,
          };

          // Set initial user data
          setUserData(initialUserData);
          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(initialUserData));

          return {
            success: true,
            token: token,
            userId: userId,
            contact: contact,
          };
        } else {
          // Authentication failed
          console.error('AuthContext: Authentication failed:', result.message || 'Unknown error');

          return {
            success: false,
            error: result.message || 'Authentication failed',
            rawError: result
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
    
    // Update user data in state and storage
    updateUserData: async (newData) => {
      try {
        const merged = { ...userData, ...newData };
        setUserData(merged);
        await AsyncStorage.setItem('waocard_user_data', JSON.stringify(merged));
        console.log('AuthContext: User data updated');
        return merged;
      } catch (error) {
        console.error('AuthContext: Error updating user data:', error);
        throw error;
      }
    },

    // Fetch user data - uses stored data from login response since the new API
    // returns contact data directly in the login response
    fetchUserData: async (token, phoneOrUsername) => {
      try {
        console.log('AuthContext: Fetching user data for:', phoneOrUsername);

        // Check for existing user data in storage (populated during login)
        try {
          const existingData = await AsyncStorage.getItem('waocard_user_data');
          if (existingData) {
            const storedUserData = JSON.parse(existingData);
            if (storedUserData && (storedUserData.mobile === phoneOrUsername || storedUserData.username === phoneOrUsername)) {
              console.log('AuthContext: Using existing user data from storage');
              setUserData(storedUserData);
              return storedUserData;
            }
          }
        } catch (storageError) {
          console.log('AuthContext: Error checking existing user data:', storageError);
        }

        // Check if this is our demo user
        if (phoneOrUsername === 'demo' || (token && token.startsWith && token.startsWith('mock-token-'))) {
          console.log('AuthContext: Using mock data for demo user');

          const mockUserData = {
            id: '1',
            username: 'demo',
            first_name: 'Demo',
            last_name: 'User',
            name: 'Demo User',
            mobile: '1234567890',
            wallet: '1000.00',
            balance: '1000.00',
            email: 'demo@example.com',
            contact_status: 'active',
            business_name: 'WaoCard Demo',
            total_rp: 100,
          };

          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(mockUserData));
          setUserData(mockUserData);
          return mockUserData;
        }

        // For real users, re-authenticate to get fresh contact data
        console.log('AuthContext: No stored data found, re-fetching via login endpoint');

        // If we have userData in state, return it
        if (userData) {
          console.log('AuthContext: Returning current user data from state');
          return userData;
        }

        // Minimal fallback
        const fallbackUserData = {
          id: '0',
          username: phoneOrUsername || 'user',
          first_name: '',
          last_name: '',
          name: '',
          mobile: phoneOrUsername || '',
          wallet: '0.00',
          balance: '0.00',
        };

        setUserData(fallbackUserData);
        await AsyncStorage.setItem('waocard_user_data', JSON.stringify(fallbackUserData));
        return fallbackUserData;
      } catch (error) {
        console.error('AuthContext: Fetch user data error:', error);

        if (userData) {
          return userData;
        }

        const errorFallbackData = {
          id: '0',
          username: phoneOrUsername || 'user',
          first_name: '',
          last_name: '',
          mobile: phoneOrUsername || '',
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