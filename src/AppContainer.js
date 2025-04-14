// src/AppContainer.js
import React from 'react';
import { ActivityIndicator, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useApp } from './context/AppContext';
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import { colors } from './styles/theme';

const AppContainer = () => {
  const { appState, initialLocation, offlineMode, login } = useApp();

  // Show loading
  if (appState === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

 

  // Show main app with navigation
  return (
    <NavigationContainer>
      {appState === 'authenticated' ? (
        <MainNavigator initialLocation={initialLocation} offlineMode={offlineMode} />
      ) : (
        <AuthNavigator onAuthenticated={login} />
      )}
    </NavigationContainer>
  );
};

export default AppContainer;