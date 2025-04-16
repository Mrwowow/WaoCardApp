// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../styles/theme';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationService from '../services/NavigationService';
import NavigationDebugger from '../utils/NavigationDebugger';

const Stack = createStackNavigator();

export default function AppNavigator({ initialLocation, offlineMode, isAuthenticated, onAuthenticated }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  
  // Check for authentication token in AsyncStorage
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      
      try {
        // Try to get the token from storage
        token = await AsyncStorage.getItem('waocard_token');
        console.log('AppNavigator: Token from storage:', token ? 'Found token' : 'No token found');
        NavigationDebugger.debugLog('Token from storage:', token ? 'Found token' : 'No token found');
      } catch (e) {
        console.error('AppNavigator: Failed to get token from storage:', e);
        NavigationDebugger.debugLog('Failed to get token from storage:', e);
      }
      
      // Update state with the result
      console.log('AppNavigator: Setting userToken to:', token);
      setUserToken(token);
      setIsLoading(false);
    };
    
    bootstrapAsync();
  }, []);  // Remove isAuthenticated dependency to avoid circular issues
  
  // Add a separate effect specifically for handling auth changes
  useEffect(() => {
    console.log('AppNavigator: isAuthenticated prop changed:', isAuthenticated);
    
    // Only check token if not already loading
    if (!isLoading) {
      const checkToken = async () => {
        try {
          const token = await AsyncStorage.getItem('waocard_token');
          console.log('AppNavigator: Token after auth state change:', token ? 'Token found' : 'No token found');
          
          // Update state only if it changed
          if ((token === null && userToken !== null) || (token !== null && userToken === null)) {
            console.log('AppNavigator: Token state changed, updating userToken');
            setUserToken(token);
          }
        } catch (e) {
          console.error('AppNavigator: Error checking token after auth state change:', e);
        }
      };
      
      checkToken();
    }
  }, [isAuthenticated, isLoading, userToken]);
  
  // Listen for authentication state changes from context
  useEffect(() => {
    if (isAuthenticated) {
      NavigationDebugger.debugLog('isAuthenticated prop changed, rechecking token');
      const checkToken = async () => {
        try {
          const token = await AsyncStorage.getItem('waocard_token');
          NavigationDebugger.debugLog('Updated token status:', token ? 'Token found' : 'No token found');
          setUserToken(token);
        } catch (e) {
          NavigationDebugger.debugLog('Error checking token after auth state change:', e);
        }
      };
      
      checkToken();
    }
  }, [isAuthenticated]);
  
  // Function to pass to child navigators for authentication handling
  const handleAuthentication = () => {
    console.log('AppNavigator: handleAuthentication called');
    NavigationDebugger.debugLog('handleAuthentication called');
    
    // Re-check the token
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('waocard_token');
        console.log('AppNavigator: Token after authentication:', token ? 'Token found' : 'No token found');
        NavigationDebugger.debugLog('Token after authentication:', token ? 'Token found' : 'No token found');
        
        // Explicitly update the user token state
        setUserToken(token);
        
        // Call parent callback if provided
        if (onAuthenticated) {
          onAuthenticated();
        }
        
        // Force navigation update
        if (token) {
          console.log('AppNavigator: Token is present, forcing navigation to Main');
          setTimeout(() => {
            try {
              // Try to use NavigationService directly
              NavigationService.reset([{ name: 'Main' }]);
              console.log('AppNavigator: Direct navigation to Main completed');
            } catch (navError) {
              console.error('AppNavigator: Error during navigation reset:', navError);
            }
          }, 100);
        } else {
          console.log('AppNavigator: No token present, forcing navigation to Auth');
          setTimeout(() => {
            try {
              // Try to use NavigationService directly
              NavigationService.reset([{ name: 'Auth' }]);
              console.log('AppNavigator: Direct navigation to Auth completed');
            } catch (navError) {
              console.error('AppNavigator: Error during navigation reset:', navError);
            }
          }, 100);
        }
      } catch (e) {
        console.error('AppNavigator: Error in handleAuthentication:', e);
        NavigationDebugger.debugLog('Error in handleAuthentication:', e);
      }
    };
    
    checkToken();
  };
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  console.log('AppNavigator: Rendering with userToken:', userToken ? 'Has token' : 'No token');
  NavigationDebugger.debugLog('Rendering AppNavigator with userToken:', userToken ? 'Has token' : 'No token');
  
  // Determine which stack to show
  const showAuthStack = userToken == null;
  console.log('AppNavigator: Will display:', showAuthStack ? 'Auth Stack' : 'Main Stack');
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showAuthStack ? (
        <Stack.Screen name="Auth" key="auth-screen">
          {(props) => {
            console.log('AppNavigator: Rendering AuthNavigator');
            return <AuthNavigator {...props} onAuthenticated={handleAuthentication} />;
          }}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main" key="main-screen">
          {(props) => {
            console.log('AppNavigator: Rendering MainNavigator');
            return (
              <MainNavigator 
                {...props} 
                initialLocation={initialLocation} 
                offlineMode={offlineMode} 
              />
            );
          }}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}