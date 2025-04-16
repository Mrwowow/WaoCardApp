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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsAvailable(compatible && enrolled);
  };
  
  const checkSavedCredentials = async () => {
    try {
      const credentials = await AsyncStorage.getItem('waocard_credentials');
      if (credentials) {
        setSavedCredentials(JSON.parse(credentials));
      }
    } catch (error) {
      console.error('Error reading saved credentials:', error);
    }
  };
  
  const handleBiometricAuth = async () => {
    if (!savedCredentials) {
      showNotification('Please login with username and password first to enable biometric login.', 'error');
      return;
    }
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login to WaoCard',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        // Use saved credentials to login
        handleLogin(savedCredentials.username, savedCredentials.password, true);
      }
    } catch (error) {
      showNotification(error.message, 'error');
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
        
        // Save credentials for biometric auth if this was a manual login
        if (!fromBiometric) {
          await AsyncStorage.setItem('waocard_credentials', JSON.stringify({
            username: user,
            password: pass
          }));
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
          // Save credentials for biometric auth if this was a manual login
          if (!fromBiometric) {
            await AsyncStorage.setItem('waocard_credentials', JSON.stringify({
              username: user,
              password: pass
            }));
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
            
            {/* Biometric Auth Button (if available) */}
            {biometricsAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
                activeOpacity={0.7}
              >
                <Ionicons name="finger-print" size={28} color={colors.primary} />
                <Text style={styles.biometricText}>Sign in with Biometrics</Text>
              </TouchableOpacity>
            )}
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
  },
  biometricText: {
    color: colors.primary,
    fontSize: fonts.sizes.medium,
    fontWeight: '500',
    marginLeft: spacing.s,
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