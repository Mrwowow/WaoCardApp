// src/context/AppContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { isAuthenticated as checkAuthentication } from '../services/auth';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState('loading'); // 'loading', 'splash', 'authenticated', 'unauthenticated'
  const [initialLocation, setInitialLocation] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Initialize app
  useEffect(() => {
    async function initialize() {
      try {
        console.log("Starting app initialization");
        
        // Network check
        const isConnected = await NetInfo.fetch().then(state => state.isConnected);
        setOfflineMode(!isConnected);

        // Location setup
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setInitialLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else {
          setInitialLocation({
            latitude: 9.0820,
            longitude: 8.6753,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }

        // Auth check
        const authenticated = await checkAuthentication();
        setIsUserAuthenticated(authenticated);
        
        console.log("App initialization complete, showing splash screen");
        // Move to splash
        setAppState('splash');
      } catch (error) {
        console.error("Init error:", error);
        // Set defaults
        setInitialLocation({
          latitude: 9.0820,
          longitude: 8.6753,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setAppState('splash');
      }
    }

    initialize();
  }, []);

  // Complete splash animation
  const completeSplash = () => {
    console.log("Splash complete, setting app state");
    setAppState(isUserAuthenticated ? 'authenticated' : 'unauthenticated');
  };

  // Handle login
  const login = () => {
    setIsUserAuthenticated(true);
    setAppState('authenticated');
  };

  // Handle logout
  const logout = () => {
    setIsUserAuthenticated(false);
    setAppState('unauthenticated');
  };

  return (
    <AppContext.Provider value={{
      appState,
      initialLocation,
      offlineMode,
      isUserAuthenticated,
      completeSplash,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => useContext(AppContext);