// src/services/biometricAuth.js
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const BIOMETRIC_ENABLED_KEY = 'waocard_biometric_enabled';
const SECURE_CREDENTIALS_KEY = 'waocard_credentials';

/**
 * Check if biometric authentication is available on the device
 * @returns {Promise<Object>} Object containing availability status and authentication types
 */
export const checkBiometricAvailability = async () => {
  try {
    // Check if hardware supports biometrics
    const compatible = await LocalAuthentication.hasHardwareAsync();
    
    if (!compatible) {
      return {
        available: false,
        biometryType: null,
        enrolledTypes: [],
        reason: 'HARDWARE_NOT_SUPPORTED'
      };
    }
    
    // Check if user has enrolled biometrics
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!enrolled) {
      return {
        available: false,
        biometryType: null,
        enrolledTypes: [],
        reason: 'NOT_ENROLLED'
      };
    }
    
    // Get available authentication types
    const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    // Determine the specific biometry type (fingerprint, facial recognition, etc.)
    const biometryType = await LocalAuthentication.getEnrolledLevelAsync();
    
    // Map authentication types to readable names
    const enrolledTypes = authTypes.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'facial';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'iris';
        default:
          return 'unknown';
      }
    });
    
    return {
      available: true,
      biometryType,
      enrolledTypes,
      reason: null
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      available: false,
      biometryType: null,
      enrolledTypes: [],
      reason: 'ERROR',
      error: error.message
    };
  }
};

/**
 * Get the appropriate biometric prompt message based on device capabilities
 * @returns {String} Biometric prompt message
 */
export const getBiometricPromptMessage = async () => {
  try {
    const { available, enrolledTypes } = await checkBiometricAvailability();
    
    if (!available) {
      return 'Authenticate to continue';
    }
    
    // Determine if device has facial recognition
    const hasFacial = enrolledTypes.includes('facial');
    
    if (Platform.OS === 'ios') {
      return hasFacial ? 'Authenticate with Face ID' : 'Authenticate with Touch ID';
    } else {
      return hasFacial ? 'Authenticate with face recognition' : 'Authenticate with fingerprint';
    }
  } catch (error) {
    return 'Authenticate to continue';
  }
};

/**
 * Enable biometric authentication and save credentials
 * @param {String} username - User's username
 * @param {String} password - User's password
 * @returns {Promise<Boolean>} Whether enabling was successful
 */
export const enableBiometricAuth = async (username, password) => {
  if (!username || !password) {
    return false;
  }
  
  try {
    // Check if biometrics are available
    const { available } = await checkBiometricAvailability();
    
    if (!available) {
      return false;
    }
    
    // Authenticate to confirm user's identity before saving credentials
    const promptMessage = await getBiometricPromptMessage();
    
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to enable biometric login',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    
    if (!authResult.success) {
      return false;
    }
    
    // Save credentials
    const credentials = {
      username,
      password,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(SECURE_CREDENTIALS_KEY, JSON.stringify(credentials));
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    
    return true;
  } catch (error) {
    console.error('Error enabling biometric auth:', error);
    return false;
  }
};

/**
 * Disable biometric authentication and remove stored credentials
 * @returns {Promise<Boolean>} Whether disabling was successful
 */
export const disableBiometricAuth = async () => {
  try {
    await AsyncStorage.removeItem(SECURE_CREDENTIALS_KEY);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    return true;
  } catch (error) {
    console.error('Error disabling biometric auth:', error);
    return false;
  }
};

/**
 * Check if biometric authentication is enabled
 * @returns {Promise<Boolean>} Whether biometric auth is enabled
 */
export const isBiometricAuthEnabled = async () => {
  try {
    const { available } = await checkBiometricAvailability();
    
    if (!available) {
      return false;
    }
    
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    const hasCredentials = await AsyncStorage.getItem(SECURE_CREDENTIALS_KEY);
    
    return enabled === 'true' && !!hasCredentials;
  } catch (error) {
    console.error('Error checking if biometric auth is enabled:', error);
    return false;
  }
};

/**
 * Perform biometric authentication and return stored credentials
 * @returns {Promise<Object|null>} User credentials if authentication successful, null otherwise
 */
export const authenticateWithBiometrics = async () => {
  try {
    // Check if biometric auth is enabled and available
    const enabled = await isBiometricAuthEnabled();
    
    if (!enabled) {
      return null;
    }
    
    // Get the appropriate prompt message
    const promptMessage = await getBiometricPromptMessage();
    
    // Authenticate user with biometrics
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    
    if (!authResult.success) {
      return null;
    }
    
    // Retrieve stored credentials
    const credentialsJson = await AsyncStorage.getItem(SECURE_CREDENTIALS_KEY);
    
    if (!credentialsJson) {
      return null;
    }
    
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('Error authenticating with biometrics:', error);
    return null;
  }
};

/**
 * Check if credentials are stored for biometric auth
 * @returns {Promise<Boolean>} Whether credentials are stored
 */
export const hasStoredCredentials = async () => {
  try {
    const credentials = await AsyncStorage.getItem(SECURE_CREDENTIALS_KEY);
    return !!credentials;
  } catch (error) {
    console.error('Error checking stored credentials:', error);
    return false;
  }
};

export default {
  checkBiometricAvailability,
  getBiometricPromptMessage,
  enableBiometricAuth,
  disableBiometricAuth,
  isBiometricAuthEnabled,
  authenticateWithBiometrics,
  hasStoredCredentials
};