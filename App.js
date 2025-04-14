import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/styles/theme';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialLocation, setInitialLocation] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });

        // Network check
        const networkState = await NetInfo.fetch();
        setOfflineMode(!networkState.isConnected);

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
          // Default location (Nigeria)
          setInitialLocation({
            latitude: 9.0820,
            longitude: 8.6753,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (e) {
        console.warn('Initialization error:', e);
        // Set defaults if there's an error
        setInitialLocation({
          latitude: 9.0820,
          longitude: 8.6753,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <NotificationProvider>
          <NavigationContainer>
            <AppNavigator 
              initialLocation={initialLocation}
              offlineMode={offlineMode}
            />
          </NavigationContainer>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}