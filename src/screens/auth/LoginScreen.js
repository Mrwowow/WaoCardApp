// src/screens/auth/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BiometricAuth from '../../services/biometricAuth';

import AuthHeader from '../../components/auth/AuthHeader';
import FormInput from '../../components/auth/FormInput';
import GradientButton from '../../components/auth/GradientButton';
import { colors, fonts, spacing, borderRadius } from '../../styles/theme';

const { width, height } = Dimensions.get('window');

// Custom Toast Notification component
const NotificationToast = ({ message, type, visible, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        // Slide in
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        // Wait
        Animated.delay(3000),
        // Slide out
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        if (onHide) onHide();
      });
    }
  }, [visible]);
  
  const backgroundColor = type === 'error' 
    ? 'rgba(255, 59, 48, 0.9)' 
    : type === 'success' 
      ? 'rgba(48, 209, 88, 0.9)' 
      : 'rgba(255, 149, 0, 0.9)';
  
  const iconName = type === 'error' 
    ? 'alert-circle' 
    : type === 'success' 
      ? 'checkmark-circle' 
      : 'information-circle';
  
  return visible ? (
    <Animated.View 
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 20,
        right: 20,
        backgroundColor,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 1000,
        transform: [{ translateY }]
      }}
    >
      <Ionicons name={iconName} size={24} color="#FFF" />
      <Text 
        style={{ 
          color: '#FFF', 
          marginLeft: 12, 
          flex: 1, 
          fontSize: 16,
          fontWeight: '500'  
        }}
      >
        {message}
      </Text>
    </Animated.View>
  ) : null;
};

const LoginScreen = ({ navigation, onAuthenticated }) => {
  // State
  const { signIn, fetchUserData } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info' // 'info', 'success', or 'error'
  });
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Animate the form on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Check for biometric authentication availability
    checkBiometrics();
    
    // Check for saved credentials
    checkSavedCredentials();
  }, []);
  
  // Show notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({
      visible: true,
      message,
      type
    });
  };
  
  // Hide notification helper
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      visible: false
    }));
  };
  
  const checkBiometrics = async () => {
    console.log('LoginScreen: Checking biometric availability');
    try {
      // Use our new biometric service to check availability
      const { available, biometryType, enrolledTypes } = await BiometricAuth.checkBiometricAvailability();
      
      // Store biometric availability state
      console.log('LoginScreen: Setting biometricsAvailable to:', available);
      setBiometricsAvailable(available);

      // Log biometric details for debugging
      if (available) {
        console.log(`LoginScreen: Biometric auth available. Type: ${biometryType}, Enrolled types: ${enrolledTypes ? enrolledTypes.join(', ') : 'none'}`);
      } else {
        console.log('LoginScreen: Biometric authentication is not available on this device');
      }
      
      // For testing purposes, force biometrics to be available
      // Remove this in production code
      console.log('LoginScreen: Setting biometricsAvailable to true for testing');
      setBiometricsAvailable(true);
    } catch (error) {
      console.error('Error checking biometrics:', error);
      setBiometricsAvailable(false);
    }
  };
  
  const checkSavedCredentials = async () => {
    try {
      console.log('LoginScreen: Checking for saved credentials');
      
      // Check if biometric auth is enabled
      const isEnabled = await BiometricAuth.isBiometricAuthEnabled();
      console.log('LoginScreen: Biometric auth enabled:', isEnabled);
      
      if (isEnabled) {
        // Check if we have stored credentials
        const hasCredentials = await BiometricAuth.hasStoredCredentials();
        console.log('LoginScreen: Has stored credentials:', hasCredentials);
        
        if (hasCredentials) {
          // Don't actually load the credentials yet - we'll get them during authentication
          console.log('LoginScreen: Biometric authentication is enabled and credentials are stored');
          setSavedCredentials(true); // Just set to true as a flag that credentials exist
        } else {
          console.log('LoginScreen: No credentials found even though biometrics is enabled');
          setSavedCredentials(null);
        }
      } else {
        console.log('LoginScreen: Biometric auth is not enabled');
        setSavedCredentials(null);
      }
      
      // For testing: Temporarily simulate having credentials
      // Remove this in production code
      console.log('LoginScreen: Setting saved credentials to true for testing');
      setSavedCredentials(true);
    } catch (error) {
      console.error('Error checking saved credentials:', error);
      setSavedCredentials(null);
    }
  };
  
  const handleBiometricAuth = async () => {
    console.log('LoginScreen: handleBiometricAuth called');
    
    if (!biometricsAvailable) {
      showNotification('Biometric authentication is not available on this device.', 'error');
      return;
    }
    
    // Check if biometric auth is enabled and we have credentials
    const isEnabled = await BiometricAuth.isBiometricAuthEnabled();
    const hasCredentials = await BiometricAuth.hasStoredCredentials();
    
    console.log('LoginScreen: Biometric enabled:', isEnabled, 'Has credentials:', hasCredentials);
    
    // If credentials are saved, authenticate with biometrics
    if (isEnabled && hasCredentials) {
      try {
        // Authenticate with biometrics and get credentials
        showNotification('Authenticating...', 'info');
        
        const credentials = await BiometricAuth.authenticateWithBiometrics();
        
        if (credentials) {
          showNotification('Biometric authentication successful', 'success');
          
          // Use retrieved credentials to login
          handleLogin(credentials.username, credentials.password, true);
        } else {
          showNotification('Biometric authentication failed or was canceled', 'error');
        }
      } catch (error) {
        showNotification(error.message || 'An error occurred during biometric authentication', 'error');
      }
    } else {
      // If not enabled, tell user to login with credentials first
      Alert.alert(
        'Set Up Biometric Login',
        'To enable biometric login, sign in with your username and password first. Then you can use your fingerprint or face for future logins.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'OK, I\'ll Sign In', 
            onPress: () => {
              showNotification('Please sign in with your credentials to continue', 'info');
            } 
          }
        ]
      );
    }
  };
  
  // Updated handleLogin function to fix navigation issues
  const handleLogin = async (user = username, pass = password, fromBiometric = false) => {
    setIsLoading(true);
    
    // Validate input
    if (!user || !pass) {
      showNotification('Please enter both username and password', 'error');
      setIsLoading(false);
      return;
    }
    
    try {
      // Special case for demo user to bypass API
      if (user === 'demo' && pass === 'password') {
        console.log('LoginScreen: Demo user detected, using mock authentication');
        
        // Create mock result
        const mockToken = 'mock-token-' + Date.now();
        const mockResult = {
          api_status: 200,
          access_token: mockToken,
          user_id: '1'
        };
        
        // If this was a manual login, check if we should offer to enable biometric auth
        if (!fromBiometric && biometricsAvailable) {
          // Check if biometric auth is already enabled
          const isEnabled = await BiometricAuth.isBiometricAuthEnabled();
          console.log('LoginScreen: After successful login - biometric auth enabled:', isEnabled);
          
          if (!isEnabled) {
            // Ask if the user wants to enable biometric login
            setTimeout(() => {
              Alert.alert(
                'Enable Biometric Login',
                `Would you like to use ${Platform.OS === 'ios' ? 'Touch ID/Face ID' : 'biometric authentication'} to login next time?`,
                [
                  {
                    text: 'Not Now',
                    style: 'cancel'
                  },
                  {
                    text: 'Enable',
                    onPress: async () => {
                      try {
                        console.log('LoginScreen: User chose to enable biometric auth');
                        const success = await BiometricAuth.enableBiometricAuth(user, pass);
                        console.log('LoginScreen: Enable biometric result:', success);
                        
                        if (success) {
                          showNotification('Biometric login enabled successfully', 'success');
                          // Update savedCredentials state to true since we just saved them
                          setSavedCredentials(true);
                        } else {
                          showNotification('Failed to enable biometric login', 'error');
                        }
                      } catch (error) {
                        console.error('LoginScreen: Error enabling biometric auth:', error);
                        showNotification('An error occurred while enabling biometric login', 'error');
                      }
                    }
                  }
                ]
              );
            }, 1000); // Show after a short delay to avoid UI congestion
          }
        }
        
        // Store token in AsyncStorage
        await AsyncStorage.setItem('waocard_token', mockToken);
        await AsyncStorage.setItem('waocard_user_id', '1');
        
        // Update auth context with username and password (special case for demo)
        await signIn(user, pass);
        
        // Show success notification
        showNotification('Demo login successful!', 'success');
        
        // Import NavigationService to handle navigation
        const NavigationService = require('../../services/NavigationService').default;
        
        // Navigate to main screen
        setTimeout(() => {
          if (onAuthenticated) {
            onAuthenticated();
          } else {
            NavigationService.reset([{ name: 'Main' }]);
          }
        }, 1000);
        
        setIsLoading(false);
        return;
      }
      
      // Regular authentication flow for non-demo users
      const myHeaders = new Headers();
      myHeaders.append("Cookie", "_us=1744552840; ad-con=%7B%26quot%3Bdate%26quot%3B%3A%26quot%3B2025-04-12%26quot%3B%2C%26quot%3Bads%26quot%3B%3A%5B%5D%7D; PHPSESSID=1pjujq451m8ol33eelm0is4ck9; mode=day");
      
      const formdata = new FormData();
      formdata.append("server_key", "105b1bb6bb635934dc758a8831a201ac");
      formdata.append("username", user);
      formdata.append("password", pass);
      formdata.append("device_type", "phone");
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
      };
      
      const response = await fetch("https://waocard.co/app/api/auth", requestOptions);
      const result = await response.json();
      
      if (result.api_status === 200) {
        try {
          // If this was a manual login, check if we should offer to enable biometric auth
          if (!fromBiometric && biometricsAvailable) {
            // Check if biometric auth is already enabled
            const isEnabled = await BiometricAuth.isBiometricAuthEnabled();
            console.log('LoginScreen: After successful API login - biometric auth enabled:', isEnabled);
            
            if (!isEnabled) {
              // Ask if the user wants to enable biometric login
              setTimeout(() => {
                Alert.alert(
                  'Enable Biometric Login',
                  `Would you like to use ${Platform.OS === 'ios' ? 'Touch ID/Face ID' : 'biometric authentication'} to login next time?`,
                  [
                    {
                      text: 'Not Now',
                      style: 'cancel'
                    },
                    {
                      text: 'Enable',
                      onPress: async () => {
                        try {
                          console.log('LoginScreen: User chose to enable biometric auth');
                          const success = await BiometricAuth.enableBiometricAuth(user, pass);
                          console.log('LoginScreen: Enable biometric result:', success);
                          
                          if (success) {
                            showNotification('Biometric login enabled successfully', 'success');
                            // Update savedCredentials state to true since we just saved them
                            setSavedCredentials(true);
                          } else {
                            showNotification('Failed to enable biometric login', 'error');
                          }
                        } catch (error) {
                          console.error('LoginScreen: Error enabling biometric auth:', error);
                          showNotification('An error occurred while enabling biometric login', 'error');
                        }
                      }
                    }
                  ]
                );
              }, 1000); // Show after a short delay to avoid UI congestion
            }
          }
          
          // First, store the token in AsyncStorage
          await AsyncStorage.setItem('waocard_token', result.access_token);
          await AsyncStorage.setItem('waocard_user_id', result.user_id.toString());
          
          // Update auth context with token
          await signIn(result.access_token);
          
          // Fetch additional user data
          await fetchUserData(result.access_token, user);
          
          // Show success notification
          showNotification('Login successful!', 'success');
          
          // Import NavigationService to handle navigation
          const NavigationService = require('../../services/NavigationService').default;
          
          // Let the notification be visible for a moment before proceeding
          setTimeout(() => {
            // Use the onAuthenticated callback if available (preferred)
            if (onAuthenticated) {
              onAuthenticated();
            } else {
              // Reset navigation state to Main stack
              NavigationService.reset([{ name: 'Main' }]);
            }
          }, 1000);
        } catch (error) {
          console.error('Authentication process error:', error);
          showNotification('Login successful, but encountered an error with your profile', 'info');
          
          // Still proceed with navigation even if there was a data fetch error
          const NavigationService = require('../../services/NavigationService').default;
          
          setTimeout(() => {
            if (onAuthenticated) {
              onAuthenticated();
            } else {
              // Reset navigation state to Main stack
              NavigationService.reset([{ name: 'Main' }]);
            }
          }, 1000);
        }
      } else {
        // Show error notification for API errors
        showNotification(result.errors?.error_text || 'Login failed', 'error');
      }
    } catch (error) {
      // Show error notification for network errors
      console.error('Network or connection error:', error);
      showNotification('Network error. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" />
      
      {/* Notification Toast */}
      <NotificationToast
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onHide={hideNotification}
      />
      
      {/* Background with blur */}
      <LinearGradient
        colors={[colors.background, colors.backgroundLight]}
        style={styles.background}
      />
      
      {/* Top decorative element */}
      <View style={styles.decorTop}>
        <LinearGradient
          colors={['rgba(255,149,0,0.3)', 'transparent']}
          style={styles.decorGradient}
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header and Back Button */}
        <AuthHeader
          title="Sign In"
          onBack={() => navigation.goBack()}
        />
        
        {/* Login Form */}
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }]
            }
          ]}
        >
          <BlurView intensity={20} tint="dark" style={styles.formBlur}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to your WaoCard account</Text>
            
            {/* Username Input */}
            <FormInput
              icon="person-outline"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            {/* Password Input */}
            <FormInput
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              toggleSecureEntry={() => setShowPassword(!showPassword)}
            />
            
            {/* Biometric Auth Button */}
            {biometricsAvailable && (
              <>
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricAuth}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="finger-print"
                    size={28} 
                    color={colors.primary} 
                  />
                  <Text style={styles.biometricText}>
                    {savedCredentials 
                      ? `Sign in with ${Platform.OS === 'ios' ? 'Touch ID/Face ID' : 'Biometrics'}`
                      : 'Set up Biometric Login'
                    }
                  </Text>
                </TouchableOpacity>
                
                {/* Divider with "or" text */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}
            
            {/* Console log to check conditions */}
            {console.log('UI Rendering - biometricsAvailable:', biometricsAvailable, 'savedCredentials:', savedCredentials)}
            
            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            {/* Sign In Button */}
            <GradientButton
              title="Sign In"
              onPress={() => handleLogin()}
              isLoading={isLoading}
              style={styles.signInButton}
            />
          </BlurView>
        </Animated.View>
        
        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom decorative element */}
      <View style={styles.decorBottom}>
        <LinearGradient
          colors={['transparent', 'rgba(255,149,0,0.2)']}
          style={styles.decorGradient}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.7,
    height: height * 0.25,
    overflow: 'hidden',
    borderBottomLeftRadius: 100,
  },
  decorBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width * 0.6,
    height: height * 0.15,
    overflow: 'hidden',
    borderTopRightRadius: 100,
  },
  decorGradient: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  formBlur: {
    padding: spacing.l,
  },
  welcomeText: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fonts.sizes.small,
  },
  signInButton: {
    marginBottom: spacing.m,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,149,0,0.1)',
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginTop: spacing.m,
  },
  biometricText: {
    color: colors.primary,
    fontSize: fonts.sizes.medium,
    fontWeight: '500',
    marginLeft: spacing.s,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: colors.textSecondary,
    marginHorizontal: spacing.m,
    fontSize: fonts.sizes.small,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  signUpText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.medium,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: fonts.sizes.medium,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
});

export default LoginScreen;