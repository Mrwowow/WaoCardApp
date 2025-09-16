// src/screens/ElectricityPaymentScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getVTUElectricityProviders, verifyElectricityMeter, payElectricityBillVTU } from '../services/billsService';
import OfflineNotice from '../components/OfflineNotice';
import { colors, spacing, borderRadius, fonts } from '../styles/theme';

const ElectricityPaymentScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const notification = useNotification();
  
  // State management
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('prepaid');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const vtuProviders = await getVTUElectricityProviders();
      setProviders(vtuProviders);
      
      // If no providers from API, use demo data
      if (vtuProviders.length === 0) {
        setProviders([
          { id: 'eko-electric', name: 'Eko (EKEDC)', minimumAmount: 1000 },
          { id: 'ikeja-electric', name: 'Ikeja (IKEDC)', minimumAmount: 1000 },
          { id: 'abuja-electric', name: 'Abuja (AEDC)', minimumAmount: 1000 },
          { id: 'kaduna-electric', name: 'Kaduna (KEDC)', minimumAmount: 1000 },
        ]);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      notification.error('Failed to load electricity providers');
      
      // Use demo data as fallback
      setProviders([
        { id: 'eko-electric', name: 'Eko (EKEDC)', minimumAmount: 1000 },
        { id: 'ikeja-electric', name: 'Ikeja (IKEDC)', minimumAmount: 1000 },
        { id: 'abuja-electric', name: 'Abuja (AEDC)', minimumAmount: 1000 },
        { id: 'kaduna-electric', name: 'Kaduna (KEDC)', minimumAmount: 1000 },
      ]);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const handleVerifyMeter = async () => {
    if (!selectedProvider) {
      notification.error('Please select a provider');
      return;
    }

    if (!meterNumber || meterNumber.length < 10) {
      notification.error('Please enter a valid meter number');
      return;
    }

    setIsVerifying(true);
    setCustomerInfo(null);

    try {
      // For demo purposes
      if (meterNumber === '1234567890') {
        setCustomerInfo({
          customerName: 'John Doe',
          address: '123 Demo Street, Lagos',
          minimumAmount: 1000,
          meterNumber: meterNumber,
          meterType: meterType
        });
        notification.success('Meter verified successfully');
        setIsVerifying(false);
        return;
      }

      const result = await verifyElectricityMeter(meterNumber, selectedProvider.id, meterType);
      
      if (result.success) {
        setCustomerInfo(result);
        notification.success('Meter verified successfully');
      } else {
        notification.error(result.error || 'Failed to verify meter');
      }
    } catch (error) {
      console.error('Meter verification error:', error);
      notification.error('Failed to verify meter. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePayment = async () => {
    if (!customerInfo) {
      notification.error('Please verify meter first');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount < customerInfo.minimumAmount) {
      notification.error(`Minimum amount is ₦${customerInfo.minimumAmount}`);
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay ₦${paymentAmount.toLocaleString()} for ${customerInfo.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: processPayment }
      ]
    );
  };

  const processPayment = async () => {
    setIsLoading(true);

    try {
      // For demo purposes
      if (meterNumber === '1234567890') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockToken = '12345-67890-12345-67890';
        const mockUnits = (parseFloat(amount) / 50).toFixed(1);
        
        Alert.alert(
          'Payment Successful',
          `Token: ${mockToken}\nUnits: ${mockUnits} kWh\nAmount: ₦${amount}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        
        notification.success('Electricity payment successful');
        setIsLoading(false);
        return;
      }

      const result = await payElectricityBillVTU({
        meterNumber: meterNumber,
        providerId: selectedProvider.id,
        meterType: meterType,
        amount: parseFloat(amount)
      });

      if (result.success) {
        let message = `Payment successful!\nAmount: ₦${result.amount}`;
        
        if (result.token) {
          message += `\nToken: ${result.token}`;
        }
        if (result.units) {
          message += `\nUnits: ${result.units} kWh`;
        }
        
        Alert.alert('Payment Successful', message, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        
        notification.success('Electricity payment successful');
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      notification.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProvider = (provider) => {
    const isSelected = selectedProvider?.id === provider.id;
    
    return (
      <TouchableOpacity
        key={provider.id}
        style={[styles.providerItem, isSelected && styles.providerItemSelected]}
        onPress={() => {
          setSelectedProvider(provider);
          setCustomerInfo(null);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.providerName, isSelected && styles.providerNameSelected]}>
          {provider.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <OfflineNotice />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Electricity Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Provider</Text>
            {isLoadingProviders ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              providers.map(renderProvider)
            )}
          </View>

          {/* Meter Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Type</Text>
            <View style={styles.meterTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.meterTypeOption,
                  meterType === 'prepaid' && styles.meterTypeSelected
                ]}
                onPress={() => {
                  setMeterType('prepaid');
                  setCustomerInfo(null);
                }}
              >
                <Text style={[
                  styles.meterTypeText,
                  meterType === 'prepaid' && styles.meterTypeTextSelected
                ]}>
                  Prepaid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.meterTypeOption,
                  meterType === 'postpaid' && styles.meterTypeSelected
                ]}
                onPress={() => {
                  setMeterType('postpaid');
                  setCustomerInfo(null);
                }}
              >
                <Text style={[
                  styles.meterTypeText,
                  meterType === 'postpaid' && styles.meterTypeTextSelected
                ]}>
                  Postpaid
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Meter Number */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Number</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Ionicons name="speedometer-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter meter number"
                  placeholderTextColor={colors.textSecondary}
                  value={meterNumber}
                  onChangeText={setMeterNumber}
                  keyboardType="numeric"
                  maxLength={20}
                />
              </View>
              <TouchableOpacity
                style={[styles.verifyButton, (!selectedProvider || !meterNumber) && styles.verifyButtonDisabled]}
                onPress={handleVerifyMeter}
                disabled={!selectedProvider || !meterNumber || isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Customer Info */}
          {customerInfo && (
            <View style={styles.customerInfoCard}>
              <Text style={styles.customerInfoTitle}>Customer Information</Text>
              <View style={styles.customerInfoRow}>
                <Text style={styles.customerInfoLabel}>Name:</Text>
                <Text style={styles.customerInfoValue}>{customerInfo.customerName}</Text>
              </View>
              <View style={styles.customerInfoRow}>
                <Text style={styles.customerInfoLabel}>Address:</Text>
                <Text style={styles.customerInfoValue}>{customerInfo.address}</Text>
              </View>
              <View style={styles.customerInfoRow}>
                <Text style={styles.customerInfoLabel}>Meter Type:</Text>
                <Text style={styles.customerInfoValue}>{meterType.charAt(0).toUpperCase() + meterType.slice(1)}</Text>
              </View>
              <View style={styles.customerInfoRow}>
                <Text style={styles.customerInfoLabel}>Min. Amount:</Text>
                <Text style={styles.customerInfoValue}>₦{customerInfo.minimumAmount}</Text>
              </View>
            </View>
          )}

          {/* Amount Input */}
          {customerInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount to Pay</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={`Min. ₦${customerInfo.minimumAmount}`}
                  placeholderTextColor={colors.textSecondary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              
              {/* Quick amounts */}
              <View style={styles.quickAmounts}>
                {[1000, 2000, 5000, 10000].map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={styles.quickAmountButton}
                    onPress={() => setAmount(quickAmount.toString())}
                  >
                    <Text style={styles.quickAmountText}>₦{quickAmount.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Pay Button */}
        {customerInfo && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.payButton,
                (!amount || isLoading) && styles.payButtonDisabled
              ]}
              onPress={handlePayment}
              disabled={!amount || isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.payButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color={colors.white} />
                    <Text style={styles.payButtonText}>Pay Electricity Bill</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes.l,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.s,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  providerName: {
    fontSize: fonts.sizes.medium,
    color: colors.white,
  },
  providerNameSelected: {
    fontWeight: '600',
  },
  meterTypeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
  },
  meterTypeOption: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderRadius: borderRadius.small,
  },
  meterTypeSelected: {
    backgroundColor: colors.primary,
  },
  meterTypeText: {
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
  },
  meterTypeTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    fontSize: fonts.sizes.medium,
    color: colors.white,
  },
  verifyButton: {
    marginLeft: spacing.s,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: borderRadius.medium,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
  },
  customerInfoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerInfoTitle: {
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.m,
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  customerInfoLabel: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.small,
  },
  customerInfoValue: {
    color: colors.white,
    fontSize: fonts.sizes.small,
    flex: 1,
    textAlign: 'right',
  },
  currencySymbol: {
    fontSize: fonts.sizes.l,
    color: colors.textSecondary,
    marginRight: spacing.s,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.m,
    fontSize: fonts.sizes.l,
    color: colors.white,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
  },
  quickAmountButton: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    color: colors.white,
    fontSize: fonts.sizes.small,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payButton: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  payButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
};

export default ElectricityPaymentScreen;