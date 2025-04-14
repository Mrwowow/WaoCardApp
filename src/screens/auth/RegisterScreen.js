// src/screens/auth/RegisterScreen.js
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
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

import AuthHeader from '../../components/auth/AuthHeader';
import FormInput from '../../components/auth/FormInput';
import GradientButton from '../../components/auth/GradientButton';
import { colors, fonts, spacing, borderRadius } from '../../styles/theme';
import { register } from '../../services/auth';
import { validateRegistrationData } from '../../utils/validations';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    phone_num: '',
    gender: '',
    first_name: '',
    last_name: '',
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [genderSelection, setGenderSelection] = useState(null);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Animate the form on mount and step change
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);
  
  const handleInputChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };
  
  const validateStep1 = () => {
    const { first_name, last_name, email, phone_num } = formData;
    
    if (!first_name.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    
    if (!last_name.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!phone_num.trim() || phone_num.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    const { username, password, confirm_password } = formData;
    
    if (!username.trim() || username.length < 4) {
      Alert.alert('Error', 'Username must be at least 4 characters');
      return false;
    }
    
    if (!password.trim() || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirm_password) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    if (!genderSelection) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    
    // Set gender in formData when selection changes
    formData.gender = genderSelection;
    
    return true;
  };
  
  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      
      // Reset animation values and trigger new animation
      fadeAnim.setValue(0);
      translateYAnim.setValue(30);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(1);
    
    // Reset animation values and trigger new animation
    fadeAnim.setValue(0);
    translateYAnim.setValue(30);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleRegister = async () => {
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(formData);
      
      setIsLoading(false);
      
      // Show success message and navigate to login
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [
          {
            text: 'Sign In Now',
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Failed', error.message || 'An error occurred');
      console.error(error);
    }
  };
  
  // Step 1 Form - Personal Information
  const renderStepOne = () => {
    return (
      <Animated.View 
        style={[
          styles.formContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }]
          }
        ]}
      >
        <Text style={styles.stepIndicator}>Step 1 of 2</Text>
        <Text style={styles.stepTitle}>Personal Information</Text>
        
        {/* First Name Input */}
        <FormInput
          icon="person-outline"
          placeholder="First Name"
          value={formData.first_name}
          onChangeText={(text) => handleInputChange('first_name', text)}
          autoCapitalize="words"
        />
        
        {/* Last Name Input */}
        <FormInput
          icon="person-outline"
          placeholder="Last Name"
          value={formData.last_name}
          onChangeText={(text) => handleInputChange('last_name', text)}
          autoCapitalize="words"
        />
        
        {/* Email Input */}
        <FormInput
          icon="mail-outline"
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
        />
        
        {/* Phone Number Input */}
        <FormInput
          icon="call-outline"
          placeholder="Phone Number"
          value={formData.phone_num}
          onChangeText={(text) => handleInputChange('phone_num', text)}
          keyboardType="phone-pad"
        />
        
        {/* Next Button */}
        <GradientButton
          title="Next"
          onPress={handleNextStep}
          icon="arrow-forward"
          style={styles.actionButton}
        />
      </Animated.View>
    );
  };
  
  // Step 2 Form - Account Information
  const renderStepTwo = () => {
    return (
      <Animated.View 
        style={[
          styles.formContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }]
          }
        ]}
      >
        <Text style={styles.stepIndicator}>Step 2 of 2</Text>
        <Text style={styles.stepTitle}>Account Information</Text>
        
        {/* Username Input */}
        <FormInput
          icon="at-outline"
          placeholder="Username"
          value={formData.username}
          onChangeText={(text) => handleInputChange('username', text)}
        />
        
        {/* Password Input */}
        <FormInput
          icon="lock-closed-outline"
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          secureTextEntry={!showPassword}
          toggleSecureEntry={() => setShowPassword(!showPassword)}
        />
        
        {/* Confirm Password Input */}
        <FormInput
          icon="lock-closed-outline"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChangeText={(text) => handleInputChange('confirm_password', text)}
          secureTextEntry={!showConfirmPassword}
          toggleSecureEntry={() => setShowConfirmPassword(!showConfirmPassword)}
        />
        
        {/* Gender Selection */}
        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              genderSelection === 'male' && styles.genderOptionSelected
            ]}
            onPress={() => setGenderSelection('male')}
          >
            <Ionicons 
              name="male" 
              size={22} 
              color={genderSelection === 'male' ? colors.primary : 'rgba(255,255,255,0.6)'} 
            />
            <Text style={[
              styles.genderText,
              genderSelection === 'male' && styles.genderTextSelected
            ]}>Male</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.genderOption,
              genderSelection === 'female' && styles.genderOptionSelected
            ]}
            onPress={() => setGenderSelection('female')}
          >
            <Ionicons 
              name="female" 
              size={22} 
              color={genderSelection === 'female' ? colors.primary : 'rgba(255,255,255,0.6)'} 
            />
            <Text style={[
              styles.genderText,
              genderSelection === 'female' && styles.genderTextSelected
            ]}>Female</Text>
          </TouchableOpacity>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePrevStep}
          >
            <View style={styles.secondaryButtonInner}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </View>
          </TouchableOpacity>
          
          <GradientButton
            title="Register"
            onPress={handleRegister}
            isLoading={isLoading}
            icon="checkmark"
            style={styles.registerButton}
          />
        </View>
      </Animated.View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" />
      
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
          title="Create Account"
          onBack={() => navigation.goBack()}
        />
        
        {/* Form Container */}
        <View style={styles.formContainer}>
          <BlurView intensity={20} tint="dark" style={styles.formBlur}>
            {currentStep === 1 ? renderStepOne() : renderStepTwo()}
          </BlurView>
        </View>
        
        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Sign In</Text>
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
    padding: 20,
  },
  formContainer: {
    width: '100%',
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  formBlur: {
    padding: spacing.l,
  },
  formContent: {
    width: '100%',
  },
  stepIndicator: {
    color: colors.primary,
    fontSize: fonts.sizes.small,
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.l,
  },
  sectionLabel: {
    fontSize: fonts.sizes.medium,
    fontWeight: '500',
    color: colors.white,
    marginTop: spacing.s,
    marginBottom: spacing.m,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    width: '48%',
    justifyContent: 'center',
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,149,0,0.1)',
  },
  genderText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.medium,
    marginLeft: spacing.xs,
  },
  genderTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: spacing.s,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  secondaryButton: {
    width: '30%',
    height: 56,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: spacing.s,
  },
  secondaryButtonInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fonts.sizes.medium,
    fontWeight: '500',
    marginLeft: 5,
  },
  registerButton: {
    flex: 1,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  signInText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.medium,
  },
  signInLink: {
    color: colors.primary,
    fontSize: fonts.sizes.medium,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
});

export default RegisterScreen;