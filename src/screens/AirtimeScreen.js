// src/screens/AirtimeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, borderRadius, commonStyles } from '../styles/theme';
import { getNetworkProviders, validatePhoneNumber, buyAirtime } from '../services/airtimeService';
import NetInfo from '@react-native-community/netinfo';
import OfflineNotice from '../components/OfflineNotice';
import FormInput from '../components/auth/FormInput';
import GradientButton from '../components/auth/GradientButton';
import NetworkProviderSelector from '../components/airtime/NetworkProviderSelector';

const AirtimeScreen = ({ navigation }) => {
  const { userToken, userData } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  
  // Handle network status directly
  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    
    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [recentNumbers, setRecentNumbers] = useState([]);
  
  useEffect(() => {
    // Load network providers and recent numbers
    const loadInitialData = async () => {
      try {
        setLoadingProviders(true);
        const providersData = await getNetworkProviders();
        setProviders(providersData);
        
        // Load recent numbers from user history if available
        // This would typically come from your backend or local storage
        // For demo, we'll use dummy data
        setRecentNumbers([
          { phone: '08012345678', provider: 'MTN', date: '2 days ago' },
          { phone: '09087654321', provider: 'Airtel', date: '1 week ago' },
          { phone: '07023456789', provider: 'Glo', date: '2 weeks ago' },
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to load network providers. Please try again.');
        console.error('Failed to load providers:', error);
      } finally {
        setLoadingProviders(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Reset validation when phone or provider changes
  useEffect(() => {
    setValidated(false);
  }, [phoneNumber, selectedProvider]);
  
  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };
  
  const useRecentNumber = (item) => {
    setPhoneNumber(item.phone);
    // Find and set the provider
    const provider = providers.find(p => p.name === item.provider);
    if (provider) {
      setSelectedProvider(provider);
    }
  };
  
  const validatePhone = async () => {
    if (!selectedProvider || !phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Please select a network provider and enter a valid phone number');
      return;
    }
    
    try {
      setValidating(true);
      const result = await validatePhoneNumber(selectedProvider.id, phoneNumber);
      
      if (result.valid) {
        setValidated(true);
        Alert.alert('Validation Successful', 'The phone number is valid');
      } else {
        Alert.alert('Validation Failed', result.message || 'The phone number is invalid for the selected network');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate phone number. Please try again.');
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };
  
  const handleBuyAirtime = async () => {
    if (!validated) {
      Alert.alert('Validation Required', 'Please validate the phone number first');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      const result = await buyAirtime({
        providerId: selectedProvider.id,
        phoneNumber: phoneNumber,
        amount: parseFloat(amount),
        userId: userData?.user_id
      });
      
      if (result.success) {
        Alert.alert('Purchase Successful', 'Your airtime purchase was processed successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Purchase Failed', result.message || 'Failed to process airtime purchase');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while processing your airtime purchase. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderRecentNumbers = () => {
    if (recentNumbers.length === 0) return null;
    
    return (
      <View style={styles.recentNumbersContainer}>
        <Text style={styles.recentNumbersTitle}>Recent Numbers</Text>
        {recentNumbers.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.recentNumberItem}
            onPress={() => useRecentNumber(item)}
          >
            <View style={styles.recentNumberDetails}>
              <Text style={styles.recentNumberPhone}>{item.phone}</Text>
              <Text style={styles.recentNumberProvider}>{item.provider}</Text>
            </View>
            <Text style={styles.recentNumberDate}>{item.date}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderContent = () => {
    if (loadingProviders) {
      return (
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading network providers...</Text>
        </View>
      );
    }
    
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderRecentNumbers()}
          
          <Text style={styles.sectionTitle}>Select Network Provider</Text>
          <NetworkProviderSelector
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={handleProviderSelect}
          />
          
          {selectedProvider && (
            <>
              <Text style={styles.sectionTitle}>Airtime Information</Text>
              <View style={styles.formContainer}>
                <FormInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                
                {!validated ? (
                  <GradientButton
                    title="Validate Number"
                    onPress={validatePhone}
                    loading={validating}
                    style={styles.validateButton}
                  />
                ) : (
                  <View style={styles.validatedContainer}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <Text style={styles.validatedText}>Number Validated</Text>
                  </View>
                )}
                
                {validated && (
                  <>
                    <FormInput
                      label="Amount"
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Enter amount"
                      keyboardType="decimal-pad"
                    />
                    
                    <GradientButton
                      title="Buy Airtime"
                      onPress={handleBuyAirtime}
                      loading={loading}
                      style={styles.buyButton}
                    />
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };
  
  return (
    <View style={styles.rootContainer}>
      {!isConnected && <OfflineNotice />}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.l,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    color: colors.white,
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.m,
    fontFamily: fonts.medium,
  },
  validateButton: {
    marginTop: spacing.m,
  },
  buyButton: {
    marginTop: spacing.l,
  },
  validatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.m,
  },
  validatedText: {
    color: colors.success,
    fontFamily: fonts.medium,
    marginLeft: spacing.s,
  },
  recentNumbersContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  recentNumbersTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.medium,
    color: colors.white,
    marginBottom: spacing.m,
  },
  recentNumberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  recentNumberDetails: {
    flex: 1,
  },
  recentNumberPhone: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.medium,
  },
  recentNumberProvider: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.small,
    marginTop: spacing.xs,
  },
  recentNumberDate: {
    color: colors.textTertiary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.xs,
    marginRight: spacing.s,
  },
});

export default AirtimeScreen;