// src/screens/BillsPaymentScreen.js
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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, borderRadius, commonStyles } from '../styles/theme';
import { getBillCategories, validateBillInfo, payBill } from '../services/billsService';
import NetInfo from '@react-native-community/netinfo';
import OfflineNotice from '../components/OfflineNotice';
import FormInput from '../components/auth/FormInput';
import GradientButton from '../components/auth/GradientButton';
import BillCategorySelector from '../components/bills/BillCategorySelector';
import BillProviderSelector from '../components/bills/BillProviderSelector';

const BillsPaymentScreen = ({ navigation }) => {
  const { userToken, userData, isLoading } = useAuth();
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
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [billReference, setBillReference] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [billDetails, setBillDetails] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  useEffect(() => {
    // Load bill categories
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getBillCategories();
        setCategories(categoriesData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load bill categories. Please try again.');
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Reset provider when category changes
  useEffect(() => {
    setSelectedProvider(null);
    setValidated(false);
    setBillDetails(null);
    setCustomerName('');
  }, [selectedCategory]);
  
  // Reset validation when reference changes
  useEffect(() => {
    setValidated(false);
    setBillDetails(null);
    setCustomerName('');
  }, [billReference, selectedProvider]);
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };
  
  const validateBillReference = async () => {
    if (!selectedCategory || !selectedProvider || !billReference.trim()) {
      Alert.alert('Validation Error', 'Please select a category, provider and enter a valid reference number');
      return;
    }
    
    try {
      setValidating(true);
      const result = await validateBillInfo(selectedCategory.id, selectedProvider.id, billReference);
      
      if (result.valid) {
        setValidated(true);
        setCustomerName(result.customerName);
        setBillDetails(result.billDetails);
        
        // If bill has fixed amount, set it
        if (result.billDetails?.fixedAmount) {
          setAmount(result.billDetails.fixedAmount.toString());
        }
      } else {
        Alert.alert('Validation Failed', result.message || 'The bill reference could not be validated');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate bill reference. Please try again.');
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };
  
  const handlePayment = async () => {
    if (!validated) {
      Alert.alert('Validation Required', 'Please validate the bill reference first');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      const result = await payBill({
        categoryId: selectedCategory.id,
        providerId: selectedProvider.id,
        reference: billReference,
        amount: parseFloat(amount),
        userId: userData?.user_id
      });
      
      if (result.success) {
        Alert.alert('Payment Successful', 'Your bill payment was processed successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Payment Failed', result.message || 'Failed to process payment');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while processing your payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderContent = () => {
    if (loadingCategories) {
      return (
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bill categories...</Text>
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
          <Text style={styles.sectionTitle}>Select Bill Category</Text>
          <BillCategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          
          {selectedCategory && (
            <>
              <Text style={styles.sectionTitle}>Select Provider</Text>
              <BillProviderSelector
                categoryId={selectedCategory.id}
                selectedProvider={selectedProvider}
                onSelectProvider={handleProviderSelect}
              />
            </>
          )}
          
          {selectedProvider && (
            <>
              <Text style={styles.sectionTitle}>Bill Information</Text>
              <View style={styles.formContainer}>
                <FormInput
                  label={`Enter ${selectedProvider.referenceLabel || 'Reference Number'}`}
                  value={billReference}
                  onChangeText={setBillReference}
                  placeholder={selectedProvider.referencePlaceholder || 'Enter reference number'}
                  keyboardType={selectedProvider.referenceType === 'numeric' ? 'number-pad' : 'default'}
                  autoCapitalize="none"
                />
                
                {!validated ? (
                  <GradientButton
                    title="Validate"
                    onPress={validateBillReference}
                    loading={validating}
                    style={styles.validateButton}
                  />
                ) : (
                  <View style={styles.validatedContainer}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <Text style={styles.validatedText}>Validated</Text>
                  </View>
                )}
                
                {validated && (
                  <>
                    <View style={styles.customerInfoContainer}>
                      <Text style={styles.customerInfoLabel}>Customer Name:</Text>
                      <Text style={styles.customerInfoValue}>{customerName}</Text>
                    </View>
                    
                    {billDetails?.description && (
                      <View style={styles.customerInfoContainer}>
                        <Text style={styles.customerInfoLabel}>Description:</Text>
                        <Text style={styles.customerInfoValue}>{billDetails.description}</Text>
                      </View>
                    )}
                    
                    <FormInput
                      label="Amount"
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Enter amount"
                      keyboardType="decimal-pad"
                      editable={!billDetails?.fixedAmount}
                    />
                    
                    {billDetails?.fixedAmount && (
                      <Text style={styles.fixedAmountNote}>This bill has a fixed amount</Text>
                    )}
                    
                    <GradientButton
                      title="Pay Now"
                      onPress={handlePayment}
                      loading={loading}
                      style={styles.payButton}
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
  payButton: {
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
  customerInfoContainer: {
    marginTop: spacing.m,
    marginBottom: spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: spacing.m,
    borderRadius: borderRadius.small,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  customerInfoLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.small,
    marginBottom: spacing.xs,
  },
  customerInfoValue: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.medium,
  },
  fixedAmountNote: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.xs,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});

export default BillsPaymentScreen;