import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store data in AsyncStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON.stringified)
 * @returns {Promise}
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<any>} - Parsed data or null if not found
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise}
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns {Promise}
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Storage keys used across the app
export const STORAGE_KEYS = {
  MERCHANTS: 'cachedMerchants',
  MAP_DATA: 'cachedMapData',
  USER_PREFERENCES: 'userMapPreferences',
  LAST_LOCATION: 'lastKnownLocation',
  FAVORITE_MERCHANTS: 'favoriteMerchants'
};