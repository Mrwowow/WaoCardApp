import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Hooks and utils
import useNetworkStatus from '../hooks/useNetworkStatus';
import { 
  storeData, 
  getData, 
  removeData, 
  clearAllData, 
  STORAGE_KEYS 
} from '../utils/storageUtils';

// Styles
import { colors, fonts, borderRadius } from '../styles/theme';

/**
 * Map settings and preferences screen
 */
const MapSettingsScreen = () => {
  // Network status
  const { isConnected } = useNetworkStatus();

  // Settings state
  const [settings, setSettings] = useState({
    showOfflineAreas: true,
    cacheMapData: true,
    nightMode: true, // Always true for WaoCard theme
    showWaoCardMerchants: true,
    showAllMerchants: true,
    highAccuracyLocation: false,
    autoRefreshData: true
  });

  // Storage info state
  const [storageInfo, setStorageInfo] = useState({
    cachedMerchantsCount: 0,
    lastUpdated: null,
    totalStorageUsed: '0 KB'
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  // Load saved settings
  const loadSettings = async () => {
    try {
      const savedSettings = await getData(STORAGE_KEYS.USER_PREFERENCES);
      if (savedSettings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...savedSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Load storage info
  const loadStorageInfo = async () => {
    try {
      // Get cached merchants
      const merchants = await getData(STORAGE_KEYS.MERCHANTS) || [];
      
      // Get last updated timestamp
      const lastUpdated = await getData('lastDataUpdate');
      
      // Calculate approximate storage size (simplified)
      const storageSize = JSON.stringify(merchants).length;
      const formattedSize = formatStorageSize(storageSize);
      
      setStorageInfo({
        cachedMerchantsCount: merchants.length,
        lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
        totalStorageUsed: formattedSize
      });
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  // Update a setting
  const updateSetting = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    storeData(STORAGE_KEYS.USER_PREFERENCES, updatedSettings);
  };

  // Clear cached data
  const clearCache = async () => {
    Alert.alert(
      'Clear Cached Data',
      'This will remove all stored merchant data. You will need an internet connection to reload data.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeData(STORAGE_KEYS.MERCHANTS);
              await removeData(STORAGE_KEYS.MAP_DATA);
              await loadStorageInfo();
              Alert.alert('Success', 'Cached data cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cached data');
            }
          }
        }
      ]
    );
  };

  // Format storage size
  const formatStorageSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map Preferences</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Use dark theme for map</Text>
          </View>
          <Switch
            value={true} // Always true for WaoCard
            disabled={true}
            trackColor={{ false: '#767577', true: 'rgba(255, 149, 0, 0.3)' }}
            thumbColor={true ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Show WaoCard Merchants</Text>
            <Text style={styles.settingDescription}>Display merchants accepting WaoCard</Text>
          </View>
          <Switch
            value={settings.showWaoCardMerchants}
            onValueChange={(value) => updateSetting('showWaoCardMerchants', value)}
            trackColor={{ false: '#767577', true: 'rgba(255, 149, 0, 0.3)' }}
            thumbColor={settings.showWaoCardMerchants ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Show All Merchants</Text>
            <Text style={styles.settingDescription}>Display merchants not accepting WaoCard</Text>
          </View>
          <Switch
            value={settings.showAllMerchants}
            onValueChange={(value) => updateSetting('showAllMerchants', value)}
            trackColor={{ false: '#767577', true: 'rgba(255, 149, 0, 0.3)' }}
            thumbColor={settings.showAllMerchants ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Settings</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>High Accuracy Location</Text>
            <Text style={styles.settingDescription}>Uses more battery but improves location accuracy</Text>
          </View>
          <Switch
            value={settings.highAccuracyLocation}
            onValueChange={(value) => updateSetting('highAccuracyLocation', value)}
            trackColor={{ false: '#767577', true: 'rgba(255, 149, 0, 0.3)' }}
            thumbColor={settings.highAccuracyLocation ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Location permission is required for this feature.');
            } else {
              Alert.alert('Permission Granted', 'Location permission has been granted.');
            }
          }}
        >
          <Ionicons name="location-outline" size={18} color="#FFF" />
          <Text style={styles.buttonText}>Request Location Permission</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Cache</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Cache Map Data</Text>
            <Text style={styles.settingDescription}>Store map data for offline use</Text>
          </View>
          <Switch
            value={settings.cacheMapData}
            onValueChange={(value) => updateSetting('cacheMapData', value)}
            trackColor={{ false: '#767577', true: 'rgba(255, 149, 0, 0.3)' }}
            thumbColor={settings.cacheMapData ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Auto-Refresh Data</Text>
            <Text style={styles.settingDescription}>Automatically update data when connected</Text>
          </View>
          <Switch
            value={settings.autoRefreshData}
            onValueChange={(value) => updateSetting('autoRefreshData', value)}
            trackColor={{ false: '#767577', true: 'rgba(255, 149, 0, 0.3)' }}
            thumbColor={settings.autoRefreshData ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cached Merchants:</Text>
            <Text style={styles.infoValue}>{storageInfo.cachedMerchantsCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(storageInfo.lastUpdated)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Storage Used:</Text>
            <Text style={styles.infoValue}>{storageInfo.totalStorageUsed}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]}
          onPress={clearCache}
        >
          <Ionicons name="trash-outline" size={18} color="#FFF" />
          <Text style={styles.buttonText}>Clear Cached Data</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About WaoCard Map</Text>
        <Text style={styles.aboutText}>
          The WaoCard Map provides location-based services to help you find merchants 
          that accept WaoCard digital wallet payments. This app is designed for African 
          markets where global digital wallet solutions have limited presence.
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.light,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    maxWidth: 250,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTransparent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.medium,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  buttonText: {
    color: colors.light,
    fontFamily: fonts.medium,
    marginLeft: 8,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.medium,
    padding: 15,
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.light,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  versionText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default MapSettingsScreen;