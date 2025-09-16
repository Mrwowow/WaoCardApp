// src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CardsScreen from '../screens/CardsScreen';
import AddCardScreen from '../screens/AddCardScreen';
import MapScreen from '../screens/MapScreen';
import MerchantDetailScreen from '../screens/MerchantDetailScreen';
import OfflineMapScreen from '../screens/OfflineMapScreen';
import MapSettingsScreen from '../screens/MapSettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import AirtimeScreen from '../screens/AirtimeScreen';
import BillsPaymentScreen from '../screens/BillsPaymentScreen';
import MyEstateScreen from '../screens/MyEstateScreen';
import DataPurchaseScreen from '../screens/DataPurchaseScreen';

import { colors, fonts } from '../styles/theme';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// CardsNavigator - Now only contains the main Cards screen
const CardsNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="CardsList" component={CardsScreen} />
    </Stack.Navigator>
  );
};

// MapNavigator - Handles all map-related screens
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
          fontFamily: fonts.semiBold,
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
        options={({ route }) => ({ title: route.params?.merchant?.name || 'Merchant Details' })}
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

// Center Button Component for Tab Navigator
const CenterButton = (props) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const centerTabStyle = {
    ...styles.centerTab,
    bottom: 35 + insets.bottom, // Push button higher above the tab bar
  };
  
  return (
    <View style={styles.centerTabContainer}>
      <TouchableOpacity
        style={centerTabStyle}
        onPress={() => navigation.navigate('MapStack')}
        activeOpacity={0.7}
      >
        <Ionicons name="scan" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// Placeholder components for other screens
const NetworkScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Network Screen</Text>
  </View>
);

const AnalyticsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Analytics Screen</Text>
  </View>
);

// Main Tab Navigator
const TabNavigator = ({ initialLocation, offlineMode }) => {
  const insets = useSafeAreaInsets();
  
  const tabBarStyle = {
    ...styles.tabBarStyle,
    paddingBottom: insets.bottom + 5, // Add safe area bottom inset
    height: 75 + insets.bottom, // Adjust height to accommodate safe area
  };
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: tabBarStyle,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabItem}>
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
              <Text style={[styles.tabLabel, { color: color }]}>Home</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="CardsTab"
        component={CardsNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
             <View style={styles.tabItem}>
                <Ionicons name={focused ? "card" : "card-outline"} size={size} color={color} />
                <Text style={[styles.tabLabel, { color: color }]}>Cards</Text>
             </View>
          ),
        }}
      />
      <Tab.Screen
        name="MapTab"
        options={{
          tabBarButton: (props) => <CenterButton {...props} />,
        }}
      >
        {() => <View />}
      </Tab.Screen>
      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabItem}>
              <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
              <Text style={[styles.tabLabel, { color: color }]}>Network</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
             <View style={styles.tabItem}>
                <Ionicons name={focused ? "pie-chart" : "pie-chart-outline"} size={size} color={color} />
                <Text style={[styles.tabLabel, { color: color }]}>Analytics</Text>
             </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator that combines Tab Navigator and Map Navigator
// Now AddCardScreen is at the root level for easier access
const MainNavigator = ({ initialLocation, offlineMode }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs">
        {() => <TabNavigator initialLocation={initialLocation} offlineMode={offlineMode} />}
      </Stack.Screen>
      <Stack.Screen
        name="MapStack"
        options={{ presentation: 'fullScreenModal' }}
      >
        {() => <MapNavigator initialLocation={initialLocation} offlineMode={offlineMode} />}
      </Stack.Screen>
      
      {/* Move AddCard to root level for easier access */}
      <Stack.Screen 
        name="AddCard" 
        component={AddCardScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }}
      />
      
      {/* ProfileScreen at root level */}
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      
      {/* Payments screens */}
      <Stack.Screen 
        name="PaymentsScreen" 
        component={PaymentsScreen}
        options={{ 
          headerShown: true,
          headerTitle: "Airtime & Bills",
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: fonts.semiBold,
          },
        }}
      />
      
      <Stack.Screen 
        name="AirtimeScreen" 
        component={AirtimeScreen}
        options={{ 
          headerShown: true,
          headerTitle: "Buy Airtime",
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: fonts.semiBold,
          },
        }}
      />
      
      <Stack.Screen 
        name="BillsPaymentScreen" 
        component={BillsPaymentScreen}
        options={{ 
          headerShown: true,
          headerTitle: "Pay Bills",
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: fonts.semiBold,
          },
        }}
      />
      
      <Stack.Screen 
        name="DataPurchaseScreen" 
        component={DataPurchaseScreen}
        options={{ 
          headerShown: false
        }}
      />
      
      {/* My Estate Screen */}
      <Stack.Screen 
        name="MyEstateScreen" 
        component={MyEstateScreen}
        options={{ 
          headerShown: false, // MyEstateScreen has its own header
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: colors.background,
    borderTopWidth: 0,
    borderTopColor: 'rgba(255, 149, 0, 0.2)',
    elevation: 0,
    height: 75, // Base height, will be adjusted with safe area
    paddingTop: 10,
    left: 0,
    right: 0,
    bottom: 0,
    // paddingBottom will be calculated dynamically with safe area insets
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 8,
    marginTop: 4,
    fontWeight: '600',
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    position: 'absolute',
    // bottom will be calculated dynamically with safe area insets
    width: 65,
    height: 65,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 8,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  screenText: {
    color: colors.white,
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
  },
});

export default MainNavigator;