// App.js with AuthProvider, NotificationProvider and NavigationService
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import NavigationService from './src/services/NavigationService';
import NavigationDebugger from './src/utils/NavigationDebugger';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

// App content separated to access context
function AppContent() {
  const [initialLocation, setInitialLocation] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const { userToken } = useAuth();
  const navigationReadyRef = useRef(false);

  // Handle location and network initialization
  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('App: Initializing app...');
        
        // Network check
        const networkState = await NetInfo.fetch();
        setOfflineMode(!networkState.isConnected);
        console.log('App: Network state:', networkState.isConnected ? 'Connected' : 'Offline');

        // Location setup
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setInitialLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            console.log('App: Got user location');
          } else {
            console.log('App: Location permission denied, using default');
            setInitialLocation({
              latitude: 9.0820,
              longitude: 8.6753,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
        } catch (locationError) {
          console.warn('App: Location initialization error:', locationError);
          setInitialLocation({
            latitude: 9.0820,
            longitude: 8.6753,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
        
        // Check token state
        const token = await AsyncStorage.getItem('waocard_token');
        console.log('App: Initial auth token check:', token ? 'Token exists' : 'No token');
        
        setIsTokenChecked(true);
        console.log('App: App initialization complete');
      } catch (e) {
        console.warn('App: General initialization error:', e);
        // Set defaults and continue
        setInitialLocation({
          latitude: 9.0820,
          longitude: 8.6753,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setIsTokenChecked(true);
      }
    }

    initializeApp();
  }, []);

  // Handle navigation state changes for better debugging
  const onNavigationStateChange = (state) => {
    console.log('App: Navigation State Changed');
    NavigationDebugger.debugLog('Navigation State Changed:', state);
  };

  // Process any queued navigation actions when the reference is set
  const onNavigationReady = () => {
    console.log('App: Navigation container is ready');
    navigationReadyRef.current = true;
    NavigationService.processQueuedActions();
  };

  // When the auth state or navigation ready state changes
  useEffect(() => {
    if (isTokenChecked && navigationReadyRef.current) {
      const navigateBasedOnAuth = async () => {
        try {
          const token = await AsyncStorage.getItem('waocard_token');
          console.log('App: Auth state changed, token is:', token ? 'present' : 'absent');
          
          // Safer approach to navigation - avoid using NavigationService.reset directly
          if (token) {
            console.log('App: User is authenticated, should be in Main stack');
            // Let the AppNavigator handle this naturally based on the userToken state
          } else {
            console.log('App: User is not authenticated, should be in Auth stack');
            // Let the AppNavigator handle this naturally based on the userToken state
          }
        } catch (e) {
          console.error('App: Error handling auth state change:', e);
        }
      };
      
      navigateBasedOnAuth();
    }
  }, [userToken, isTokenChecked]);
  
  // Set up a periodic token check instead of using window listeners (React Native doesn't have window)
  useEffect(() => {
    console.log('App: Setting up token monitoring');
    
    // We'll use a token monitoring system specific to React Native
    let lastKnownToken = userToken;
    
    // Function to check if token has changed
    const checkTokenChange = async () => {
      try {
        const currentToken = await AsyncStorage.getItem('waocard_token');
        
        // Only log if there's a difference to avoid spamming logs
        if ((currentToken === null && lastKnownToken !== null) || 
            (currentToken !== null && lastKnownToken === null)) {
          console.log('App: Token state changed from', 
            lastKnownToken ? 'present' : 'absent', 
            'to', 
            currentToken ? 'present' : 'absent');
          
          // Update our reference
          lastKnownToken = currentToken;
        }
      } catch (e) {
        console.error('App: Error in token monitoring:', e);
      }
    };
    
    // Initial check
    checkTokenChange();
  }, [userToken]);

  if (!isTokenChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        {/* Loading state */}
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={NavigationService.navigationRef}
      onStateChange={onNavigationStateChange}
      onReady={onNavigationReady}
    >
      <AppNavigator
        initialLocation={initialLocation}
        offlineMode={offlineMode}
        isAuthenticated={!!userToken}
      />
    </NavigationContainer>
  );
}

// Main App component
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Load fonts
  useEffect(() => {
    async function prepare() {
      try {
        console.log('App: Loading fonts...');
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });
        console.log('App: Fonts loaded successfully');
      } catch (e) {
        console.warn('App: Font loading error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('App: Layout ready, hiding splash screen');
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}