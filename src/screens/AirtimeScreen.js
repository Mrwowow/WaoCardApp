// src/screens/AirtimeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, borderRadius, commonStyles } from '../styles/theme';
import { getNetworkProviders, buyAirtime } from '../services/airtimeService';
import { getUserWalletBalance } from '../services/walletService';
import NetInfo from '@react-native-community/netinfo';
import OfflineNotice from '../components/OfflineNotice';
import FormInput from '../components/auth/FormInput';
import FormInputWithCustomIcon from '../components/auth/FormInputWithCustomIcon';
import GradientButton from '../components/auth/GradientButton';
import NetworkProviderSelector from '../components/airtime/NetworkProviderSelector';
import { getProviderIcon } from '../components/icons/NetworkProviderIcons';
import CustomAlert from '../components/CustomAlert';

const AirtimeScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'recent'
  
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
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [recentNumbers, setRecentNumbers] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  // Custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });
  
  // Helper function to show custom alert
  const showAlert = (type, title, message, buttons = []) => {
    setAlertConfig({
      type,
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default' }]
    });
    setAlertVisible(true);
  };
  
  // Function to fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!userData) return;
    
    try {
      setLoadingBalance(true);
      const result = await getUserWalletBalance(userData);
      if (result.success) {
        setWalletBalance(result.balance);
      } else {
        // Fallback to userData wallet
        setWalletBalance(parseFloat(userData?.wallet || 0));
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      // Fallback to userData wallet
      setWalletBalance(parseFloat(userData?.wallet || 0));
    } finally {
      setLoadingBalance(false);
    }
  };

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
        
        // Fetch wallet balance
        await fetchWalletBalance();
      } catch (error) {
        showAlert('error', 'Error', 'Failed to load network providers. Please try again.');
        console.error('Failed to load providers:', error);
      } finally {
        setLoadingProviders(false);
      }
    };
    
    loadInitialData();
  }, [userData]);
  
  // Auto-detect network provider based on phone number prefix
  useEffect(() => {
    if (phoneNumber && phoneNumber.length >= 4) {
      detectNetworkProvider(phoneNumber);
    }
  }, [phoneNumber]);
  
  const detectNetworkProvider = (number) => {
    // Don't auto-detect if user has manually selected a provider
    if (selectedProvider && phoneNumber.length >= 11) {
      return;
    }
    
    // Nigerian network provider prefixes
    const prefixMap = {
      MTN: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916', '07025', '07026', '0704'],
      Airtel: ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912', '0911'],
      Glo: ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
      '9mobile': ['0809', '0818', '0817', '0909', '0908']
    };
    
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const prefix = cleanNumber.substring(0, 4);
    const prefix5 = cleanNumber.substring(0, 5);
    
    // Clear previous auto-detection if number changed significantly
    if (cleanNumber.length < 4 && selectedProvider) {
      setSelectedProvider(null);
      return;
    }
    
    for (const [providerName, prefixes] of Object.entries(prefixMap)) {
      if (prefixes.includes(prefix) || prefixes.includes(prefix5)) {
        const provider = providers.find(p => p.name === providerName);
        if (provider && provider !== selectedProvider) {
          setSelectedProvider(provider);
        }
        return; // Found a match, exit early
      }
    }
    
    // If we reach here and have a long enough number, no provider was detected
    // Clear any previous auto-detected provider
    if (cleanNumber.length >= 7 && selectedProvider) {
      setSelectedProvider(null);
    }
  };
  
  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };
  
  const useRecentNumber = (item) => {
    setPhoneNumber(item.phone);
    // Provider will be auto-detected
    // Switch to buy tab when a recent number is selected
    setActiveTab('buy');
  };
  
  const pickContact = async () => {
    try {
      // Request permission if not granted
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        showAlert('warning', 'Permission Denied', 'Please allow access to contacts to use this feature.');
        return;
      }
      
      // Open contact picker
      const { data } = await Contacts.presentContactPickerAsync();
      
      if (data && data.phoneNumbers && data.phoneNumbers.length > 0) {
        // Get the first phone number and clean it
        let phoneNum = data.phoneNumbers[0].number;
        // Remove spaces, dashes, and country code if present
        phoneNum = phoneNum.replace(/[\s-]/g, '');
        if (phoneNum.startsWith('+234')) {
          phoneNum = '0' + phoneNum.substring(4);
        } else if (phoneNum.startsWith('234')) {
          phoneNum = '0' + phoneNum.substring(3);
        }
        
        setPhoneNumber(phoneNum);
        // Provider will be auto-detected
      }
    } catch (error) {
      console.error('Error picking contact:', error);
      showAlert('error', 'Error', 'Failed to pick contact. Please try again.');
    }
  };
  
  
  const handleBuyAirtime = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 11) {
      showAlert('warning', 'Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }
    
    if (!selectedProvider) {
      showAlert('warning', 'Network Provider Required', 'Please select a network provider or enter a valid phone number to auto-detect');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      showAlert('warning', 'Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      const result = await buyAirtime({
        providerId: selectedProvider.id,
        phoneNumber: phoneNumber,
        amount: parseFloat(amount),
        userId: userData?.user_id,
        userData: userData
      });
      
      if (result.success) {
        // Success message with details
        let successMessage = result.message || 'Your airtime purchase was processed successfully';
        
        // Add transaction details if available
        const details = [];
        
        // Always show the amount
        if (result.amount) {
          details.push(`Amount: ₦${parseFloat(result.amount).toFixed(2)}`);
        }
        
        // Show charged amount if different (due to discount)
        if (result.amount_charged && parseFloat(result.amount_charged) !== parseFloat(result.amount)) {
          details.push(`Charged: ₦${parseFloat(result.amount_charged).toFixed(2)}`);
          
          if (result.discount && parseFloat(result.discount) > 0) {
            details.push(`Discount: ₦${parseFloat(result.discount).toFixed(2)}`);
          }
        }
        
        // Show network and phone
        if (result.network) {
          details.push(`Network: ${result.network}`);
        }
        if (phoneNumber) {
          details.push(`Phone: ${phoneNumber}`);
        }
        
        // Show transaction reference
        if (result.transactionId) {
          details.push(`Transaction ID: ${result.transactionId}`);
        }
        
        // Show status for VTU.ng transactions
        if (result.status && result.api === 'vtu.ng') {
          details.push(`Status: ${result.status}`);
        }
        
        if (details.length > 0) {
          successMessage += '\n\n' + details.join('\n');
        }
        
        showAlert('success', 'Purchase Successful', successMessage, [
          { 
            text: 'OK', 
            style: 'default',
            onPress: () => {
              // Clear form
              setPhoneNumber('');
              setAmount('');
              setSelectedProvider(null);
              // Refresh wallet balance
              fetchWalletBalance();
              // Optionally navigate back
              navigation.navigate('Home');
            }
          }
        ]);
      } else {
        // Handle different types of failures
        if (result.insufficientBalance) {
          const currentBal = result.currentBalance || 0;
          const requiredAmt = result.required || amount;
          const shortfallAmt = result.shortfall || amount;
          
          showAlert(
            'warning',
            'Insufficient Balance', 
            `Your wallet balance (₦${currentBal.toFixed(2)}) is insufficient for this purchase.\n\nRequired: ₦${requiredAmt.toFixed(2)}\nShortfall: ₦${shortfallAmt.toFixed(2)}\n\nPlease fund your wallet to continue.`,
            [
              { text: 'OK', style: 'cancel' },
              { text: 'Fund Wallet', style: 'default', onPress: () => {
                // Navigate to wallet funding screen if available
                // navigation.navigate('FundWallet');
                console.log('Navigate to fund wallet');
              }}
            ]
          );
        } else if (result.refunded) {
          showAlert(
            'warning',
            'Purchase Failed', 
            `${result.message}\n\nYour wallet has been refunded automatically.`
          );
        } else {
          showAlert('error', 'Purchase Failed', result.message || 'Failed to process airtime purchase');
        }
      }
    } catch (error) {
      showAlert('error', 'Error', 'An error occurred while processing your airtime purchase. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderTabSwitcher = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
        onPress={() => setActiveTab('buy')}
      >
        <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
          Buy Airtime
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
        onPress={() => setActiveTab('recent')}
      >
        <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
          Recent Numbers
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBuyAirtimeTab = () => (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.compactProviderContainer}>
        <Text style={styles.compactSectionTitle}>Network Provider</Text>
        <NetworkProviderSelector
          providers={providers}
          selectedProvider={selectedProvider}
          onSelectProvider={handleProviderSelect}
          compact={true}
        />
        {phoneNumber && !selectedProvider && (
          <View style={styles.compactWarningContainer}>
            <Ionicons name="warning-outline" size={12} color={colors.warning} />
            <Text style={styles.compactWarningText}>Auto-detect failed. Select manually.</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Phone Number</Text>
      <View style={styles.formContainer}>
        <View style={styles.phoneInputContainer}>
          <View style={styles.phoneInputWrapper}>
            <FormInputWithCustomIcon
              customIcon={selectedProvider ? getProviderIcon(selectedProvider.name, 22, styles.providerInputIcon) : null}
              icon={selectedProvider ? null : "call-outline"}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter or select phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={pickContact}
          >
            <Ionicons name="person-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Amount</Text>
      <View style={styles.formContainer}>
        {/* Wallet Balance Display */}
        <View style={styles.walletBalanceContainer}>
          <View style={styles.walletBalanceHeader}>
            <Ionicons name="wallet-outline" size={16} color={colors.primary} />
            <Text style={styles.walletBalanceLabel}>Wallet Balance</Text>
            <TouchableOpacity onPress={fetchWalletBalance} disabled={loadingBalance}>
              <Ionicons 
                name={loadingBalance ? "sync" : "refresh"} 
                size={16} 
                color={colors.primary}
                style={loadingBalance ? styles.rotating : null} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.walletBalanceAmount}>
            {walletBalance !== null ? `₦${walletBalance.toFixed(2)}` : '₦---.--'}
          </Text>
        </View>
        
        <FormInput
          icon="cash-outline"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount (₦)"
          keyboardType="decimal-pad"
        />
        
        <View style={styles.quickAmountsContainer}>
          <Text style={styles.quickAmountsTitle}>Quick Amounts</Text>
          <View style={styles.quickAmountsRow}>
            {['100', '200', '500', '1000', '2000', '5000'].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount)}
              >
                <Text style={styles.quickAmountText}>₦{quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <GradientButton
          title="Buy Airtime"
          onPress={handleBuyAirtime}
          loading={loading}
          style={styles.buyButton}
          disabled={!phoneNumber || !selectedProvider || !amount}
        />
      </View>
    </ScrollView>
  );

  const renderRecentNumbersTab = () => (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {recentNumbers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No recent numbers</Text>
          <Text style={styles.emptySubtext}>Your recent airtime purchases will appear here</Text>
        </View>
      ) : (
        <View style={styles.recentNumbersList}>
          {recentNumbers.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.recentNumberCard}
              onPress={() => useRecentNumber(item)}
            >
              <View style={styles.recentNumberDetails}>
                <Text style={styles.recentNumberPhone}>{item.phone}</Text>
                <Text style={styles.recentNumberProvider}>{item.provider}</Text>
              </View>
              <View style={styles.recentNumberRight}>
                <Text style={styles.recentNumberDate}>{item.date}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

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
        {renderTabSwitcher()}
        {activeTab === 'buy' ? renderBuyAirtimeTab() : renderRecentNumbersTab()}
      </KeyboardAvoidingView>
    );
  };
  
  return (
    <View style={styles.rootContainer}>
      {!isConnected && <OfflineNotice />}
      {renderContent()}
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.l,
    marginTop: spacing.m,
    marginBottom: spacing.s,
    borderRadius: borderRadius.large,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderRadius: borderRadius.medium,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFF',
    fontFamily: fonts.semiBold,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.m,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  providerInputIcon: {
    marginRight: 12,
  },
  contactButton: {
    width: 60,
    height: 60,
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
    padding: spacing.s,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    color: colors.warning,
    fontFamily: fonts.medium,
    marginLeft: spacing.s,
    fontSize: fonts.sizes.small,
    flex: 1,
  },
  compactProviderContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  compactSectionTitle: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.small,
    color: colors.white,
    marginBottom: spacing.s,
  },
  compactWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
    padding: spacing.xs,
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderRadius: borderRadius.small,
  },
  compactWarningText: {
    color: colors.warning,
    fontFamily: fonts.regular,
    marginLeft: spacing.xs,
    fontSize: fonts.sizes.xs,
    flex: 1,
  },
  manualProviderContainer: {
    marginTop: spacing.m,
  },
  quickAmountsContainer: {
    marginTop: spacing.m,
  },
  quickAmountsTitle: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.small,
    marginBottom: spacing.s,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  quickAmountButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.small,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    minWidth: 60,
    alignItems: 'center',
  },
  quickAmountText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.small,
  },
  recentNumbersList: {
    marginTop: spacing.m,
  },
  recentNumberCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  recentNumberRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentNumberDate: {
    color: colors.textTertiary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.xs,
    marginRight: spacing.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    marginTop: spacing.l,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.medium,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  walletBalanceContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  walletBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  walletBalanceLabel: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  walletBalanceAmount: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.large,
    color: colors.primary,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
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
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
});

export default AirtimeScreen;