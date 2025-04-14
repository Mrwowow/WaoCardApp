import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import MapScreen from '../screens/MapScreen';
import MerchantDetailScreen from '../screens/MerchantDetailScreen';
import OfflineMapScreen from '../screens/OfflineMapScreen';
import MapSettingsScreen from '../screens/MapSettingsScreen';

// Import theme
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

const MapNavigator = ({ initialLocation, offlineMode }) => {
  return (
    <Stack.Navigator 
      initialRouteName={offlineMode ? "OfflineMap" : "Map"}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
        },
      }}
    >
      <Stack.Screen 
        name="Map" 
        component={MapScreen} 
        initialParams={{ initialLocation }} 
        options={{ title: 'WaoCard Map' }}
      />
      <Stack.Screen 
        name="MerchantDetail" 
        component={MerchantDetailScreen} 
        options={({ route }) => ({ title: route.params.merchant.name })}
      />
      <Stack.Screen 
        name="OfflineMap" 
        component={OfflineMapScreen} 
        options={{ title: 'Offline Map' }}
      />
      <Stack.Screen 
        name="MapSettings" 
        component={MapSettingsScreen} 
        options={{ title: 'Map Settings' }}
      />
    </Stack.Navigator>
  );
};

export default MapNavigator;