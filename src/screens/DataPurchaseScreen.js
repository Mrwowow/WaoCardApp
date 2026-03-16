// src/screens/DataPurchaseScreen.js
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
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import vtuService, { VTU_SERVICE_PROVIDERS } from '../services/vtuService';
import NetworkProviderSelector from '../components/airtime/NetworkProviderSelector';
import { colors, spacing, borderRadius, fonts } from '../styles/theme';

const DataPurchaseScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const notification = useNotification();
  
  // State management
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dataPlans, setDataPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Network providers
  const networks = [
    { id: 'mtn', name: 'MTN', color: '#FFCC00', icon: 'cellular' },
    { id: 'airtel', name: 'Airtel', color: '#FF0000', icon: 'cellular' },
    { id: 'glo', name: 'Glo', color: '#00AA00', icon: 'cellular' },
    { id: '9mobile', name: '9mobile', color: '#006600', icon: 'cellular' },
  ];

  // Load data plans when network changes
  useEffect(() => {
    if (selectedNetwork) {
      loadDataPlans();
    }
  }, [selectedNetwork]);

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    if (!phone) {
      setValidationError('');
      return false;
    }

    // Basic phone number validation
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    if (cleanedPhone.length !== 11 && cleanedPhone.length !== 14) {
      setValidationError('Phone number must be 11 digits');
      return false;
    }

    // Validate network prefix if network is selected
    if (selectedNetwork) {
      try {
        vtuService.validatePhone(cleanedPhone, selectedNetwork.id);
        setValidationError('');
        return true;
      } catch (error) {
        setValidationError(error.message);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  // Load data plans for selected network
  const loadDataPlans = async () => {
    setIsLoadingPlans(true);
    setDataPlans([]);
    setSelectedPlan(null);

    try {
      const response = await vtuService.getDataVariations(selectedNetwork.id);
      
      if (response.data && response.data.length > 0) {
        // Filter and sort available plans
        const availablePlans = response.data
          .filter(plan => plan.availability === 'Available')
          .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        
        setDataPlans(availablePlans);
      } else {
        // Fallback demo data
        setDataPlans([
          { variation_id: '1', data_plan: '1GB - 30 days', price: '500', availability: 'Available' },
          { variation_id: '2', data_plan: '2GB - 30 days', price: '1000', availability: 'Available' },
          { variation_id: '3', data_plan: '5GB - 30 days', price: '2000', availability: 'Available' },
          { variation_id: '4', data_plan: '10GB - 30 days', price: '3000', availability: 'Available' },
        ]);
      }
    } catch (error) {
      console.error('Error loading data plans:', error);
      notification.error('Failed to load data plans. Please try again.');
      
      // Use demo data as fallback
      setDataPlans([
        { variation_id: '1', data_plan: '1GB - 30 days', price: '500', availability: 'Available' },
        { variation_id: '2', data_plan: '2GB - 30 days', price: '1000', availability: 'Available' },
        { variation_id: '3', data_plan: '5GB - 30 days', price: '2000', availability: 'Available' },
        { variation_id: '4', data_plan: '10GB - 30 days', price: '3000', availability: 'Available' },
      ]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Handle data purchase
  const handlePurchase = async () => {
    if (!selectedNetwork) {
      notification.error('Please select a network provider');
      return;
    }

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      notification.error('Please enter a valid phone number');
      return;
    }

    if (!selectedPlan) {
      notification.error('Please select a data plan');
      return;
    }

    // Confirm purchase
    Alert.alert(
      'Confirm Purchase',
      `Buy ${selectedPlan.data_plan} for ₦${selectedPlan.price} on ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: processPurchase }
      ]
    );
  };

  // Process the data purchase
  const processPurchase = async () => {
    setIsLoading(true);

    try {
      // For demo purposes, simulate success
      if (phoneNumber === '08012345678') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        notification.success(`Successfully purchased ${selectedPlan.data_plan} for ${phoneNumber}`);
        
        // Reset form
        setPhoneNumber('');
        setSelectedPlan(null);
        
        // Navigate back or to success screen
        navigation.goBack();
        return;
      }

      // Actual VTU API call
      const response = await vtuService.purchaseData(
        phoneNumber,
        selectedNetwork.id,
        selectedPlan.variation_id
      );

      if (response.status === 'success' || response.data?.status === 'completed') {
        notification.success(`Successfully purchased ${selectedPlan.data_plan} for ${phoneNumber}`);
        
        // Reset form
        setPhoneNumber('');
        setSelectedPlan(null);
        
        // Navigate back
        navigation.goBack();
      } else {
        throw new Error(response.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Data purchase error:', error);
      notification.error(error.message || 'Failed to purchase data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render data plan item
  const renderDataPlan = ({ item }) => {
    const isSelected = selectedPlan?.variation_id === item.variation_id;
    
    return (
      <TouchableOpacity
        style={[styles.planItem, isSelected && styles.planItemSelected]}
        onPress={() => setSelectedPlan(item)}
        activeOpacity={0.7}
      >
        <View style={styles.planInfo}>
          <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
            {item.data_plan}
          </Text>
          <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
            ₦{parseFloat(item.price).toLocaleString()}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Data</Text>
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
          {/* Network Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Network</Text>
            <NetworkProviderSelector
              providers={networks}
              selectedProvider={selectedNetwork}
              onSelectProvider={setSelectedNetwork}
            />
          </View>

          {/* Phone Number Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  validatePhoneNumber(text);
                }}
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>
            {validationError ? (
              <Text style={styles.errorText}>{validationError}</Text>
            ) : null}
          </View>

          {/* Data Plans */}
          {selectedNetwork && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Data Plan</Text>
              {isLoadingPlans ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading data plans...</Text>
                </View>
              ) : dataPlans.length > 0 ? (
                <FlatList
                  data={dataPlans}
                  renderItem={renderDataPlan}
                  keyExtractor={(item) => item.variation_id.toString()}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.planSeparator} />}
                />
              ) : (
                <Text style={styles.noPlansText}>No data plans available</Text>
              )}
            </View>
          )}

          {/* Purchase Summary */}
          {selectedPlan && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Purchase Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Network:</Text>
                <Text style={styles.summaryValue}>{selectedNetwork?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phone:</Text>
                <Text style={styles.summaryValue}>{phoneNumber}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Data Plan:</Text>
                <Text style={styles.summaryValue}>{selectedPlan.data_plan}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total:</Text>
                <Text style={styles.summaryTotalValue}>
                  ₦{parseFloat(selectedPlan.price).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Purchase Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              (!selectedNetwork || !phoneNumber || !selectedPlan || isLoading) && styles.purchaseButtonDisabled
            ]}
            onPress={handlePurchase}
            disabled={!selectedNetwork || !phoneNumber || !selectedPlan || isLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.purchaseButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={20} color="#FFF" />
                  <Text style={styles.purchaseButtonText}>Purchase Data</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  inputContainer: {
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
  errorText: {
    color: colors.error,
    fontSize: fonts.sizes.small,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.s,
    color: colors.textSecondary,
    fontSize: fonts.sizes.small,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: fonts.sizes.medium,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  planNameSelected: {
    fontWeight: '600',
  },
  planPrice: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
  },
  planPriceSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  planSeparator: {
    height: spacing.s,
  },
  noPlansText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fonts.sizes.medium,
    padding: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.m,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.small,
  },
  summaryValue: {
    color: colors.white,
    fontSize: fonts.sizes.small,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    marginTop: spacing.s,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
    color: colors.white,
  },
  summaryTotalValue: {
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
    color: colors.primary,
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
  purchaseButton: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
};

export default DataPurchaseScreen;