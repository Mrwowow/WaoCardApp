// src/screens/auth/ForgotPasswordScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

import AuthHeader from '../../components/auth/AuthHeader';
import FormInput from '../../components/auth/FormInput';
import GradientButton from '../../components/auth/GradientButton';
import { colors, fonts, spacing, borderRadius } from '../../styles/theme';
import { apiRequest } from '../../services/api';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const successFadeAnim = useRef(new Animated.Value(0)).current;
  
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
  }, []);
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call when endpoint is available
      // const result = await apiRequest('forgot-password', 'POST', { email });
      
      // For now, we'll just simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsLoading(false);
      setIsSuccess(true);
      
      // Animate success message
      Animated.timing(successFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      
      // Auto navigate back to login after delay
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
      
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'An error occurred. Please try again.');
      console.error(error);
    }
  };
  
  // Success message UI
  const renderSuccessMessage = () => {
    return (
      <Animated.View 
        style={[
          styles.successContainer,
          { opacity: successFadeAnim }
        ]}
      >
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={70} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Reset Link Sent</Text>
        <Text style={styles.successMessage}>
          If an account exists with the email {email}, we've sent instructions to reset your password.
        </Text>
        <Text style={styles.successNote}>
          Please check your email inbox and follow the instructions.
        </Text>
        
        <TouchableOpacity 
          style={styles.returnLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.returnText}>Return to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background gradient */}
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
      
      {/* Header and Back Button */}
      <AuthHeader
        title="Forgot Password"
        onBack={() => navigation.goBack()}
      />
      
      {/* Form Container */}
      {!isSuccess ? (
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
            <Text style={styles.formTitle}>Reset Your Password</Text>
            <Text style={styles.formDescription}>
              Enter the email address associated with your account and we'll send you instructions to reset your password.
            </Text>
            
            {/* Email Input */}
            <FormInput
              icon="mail-outline"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            {/* Reset Button */}
            <GradientButton
              title="Send Reset Instructions"
              onPress={handleResetPassword}
              isLoading={isLoading}
              style={styles.resetButton}
            />
            
            {/* Return to Login */}
            <TouchableOpacity 
              style={styles.returnLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.returnText}>Return to Login</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      ) : (
        renderSuccessMessage()
      )}
      
      {/* Bottom decorative element */}
      <View style={styles.decorBottom}>
        <LinearGradient
          colors={['transparent', 'rgba(255,149,0,0.2)']}
          style={styles.decorGradient}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.l,
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
  formContainer: {
    width: '100%',
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: spacing.xl,
  },
  formBlur: {
    padding: spacing.l,
  },
  formTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.m,
  },
  formDescription: {
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  resetButton: {
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  returnLink: {
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  returnText: {
    color: colors.primary,
    fontSize: fonts.sizes.medium,
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  successIconContainer: {
    marginBottom: spacing.l,
  },
  successTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    marginBottom: spacing.m,
    textAlign: 'center',
    lineHeight: 24,
  },
  successNote: {
    fontSize: fonts.sizes.small,
    color: colors.textTertiary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
