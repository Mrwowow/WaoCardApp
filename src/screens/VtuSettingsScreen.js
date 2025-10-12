// VTU.ng API Settings Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, borderRadius, commonStyles } from '../styles/theme';
import FormInput from '../components/auth/FormInput';
import GradientButton from '../components/auth/GradientButton';
import { 
  setVtuApiToken, 
  getVtuApiToken, 
  clearVtuApiToken,
  getVtuWalletBalance 
} from '../services/vtuApi';

const VtuSettingsScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isTokenSaved, setIsTokenSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    loadSavedToken();
  }, []);

  const loadSavedToken = async () => {
    try {
      const savedToken = await getVtuApiToken();
      if (savedToken) {
        setApiToken(savedToken);
        setIsTokenSaved(true);
        // Check balance to verify token
        checkBalance(savedToken);
      }
    } catch (error) {
      console.error('Error loading saved token:', error);
    }
  };

  const checkBalance = async (token = apiToken) => {
    if (!token) {
      Alert.alert('Error', 'Please enter your VTU.ng API token');
      return;
    }

    setCheckingBalance(true);
    try {
      // Save token temporarily for the balance check
      if (token !== apiToken) {
        await setVtuApiToken(token);
      }

      const result = await getVtuWalletBalance();
      
      if (result.success) {
        setWalletBalance(result.balance);
        Alert.alert('Success', `Your VTU.ng wallet balance is ₦${result.balance.toFixed(2)}`);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch wallet balance');
        setWalletBalance(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to verify API token. Please check your token and try again.');
      setWalletBalance(null);
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleSaveToken = async () => {
    if (!apiToken || apiToken.trim().length < 10) {
      Alert.alert('Invalid Token', 'Please enter a valid VTU.ng API token');
      return;
    }

    setLoading(true);
    try {
      // Save the token
      await setVtuApiToken(apiToken.trim());
      
      // Verify the token by checking balance
      const result = await getVtuWalletBalance();
      
      if (result.success) {
        setIsTokenSaved(true);
        setWalletBalance(result.balance);
        Alert.alert(
          'Success', 
          `API token saved successfully!\nWallet Balance: ₦${result.balance.toFixed(2)}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Token might be invalid, clear it
        await clearVtuApiToken();
        setIsTokenSaved(false);
        Alert.alert('Invalid Token', 'The API token appears to be invalid. Please check and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save API token. Please try again.');
      console.error('Error saving token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearToken = () => {
    Alert.alert(
      'Clear API Token',
      'Are you sure you want to remove your VTU.ng API token? You will need to re-enter it to make airtime purchases.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearVtuApiToken();
            setApiToken('');
            setIsTokenSaved(false);
            setWalletBalance(null);
            Alert.alert('Success', 'API token cleared successfully');
          }
        }
      ]
    );
  };

  const openVtuWebsite = () => {
    Linking.openURL('https://vtu.ng/register');
  };

  const openApiDocs = () => {
    Linking.openURL('https://vtu.ng/api');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={48} color={colors.primary} />
        <Text style={styles.title}>VTU.ng API Configuration</Text>
        <Text style={styles.subtitle}>
          Configure your VTU.ng API token to enable airtime purchases
        </Text>
      </View>

      {!isTokenSaved && (
        <TouchableOpacity style={styles.infoCard} onPress={openVtuWebsite}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Don't have a VTU.ng account?</Text>
            <Text style={styles.infoText}>
              Tap here to register and get your API token. You'll need to complete KYC verification for higher transaction limits.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {walletBalance !== null && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>VTU.ng Wallet Balance</Text>
          <Text style={styles.balanceAmount}>₦{walletBalance.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => checkBalance()}
            disabled={checkingBalance}
          >
            {checkingBalance ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="refresh" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>API Token</Text>
        <View style={styles.tokenInputContainer}>
          <FormInput
            icon="key-outline"
            value={showToken ? apiToken : apiToken.replace(/./g, '•')}
            onChangeText={setApiToken}
            placeholder="Enter your VTU.ng API token"
            autoCapitalize="none"
            editable={!isTokenSaved}
            secureTextEntry={!showToken && apiToken.length > 0}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowToken(!showToken)}
          >
            <Ionicons 
              name={showToken ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {!isTokenSaved ? (
          <GradientButton
            title="Save API Token"
            onPress={handleSaveToken}
            loading={loading}
            style={styles.saveButton}
            disabled={!apiToken || apiToken.trim().length < 10}
          />
        ) : (
          <View style={styles.savedActions}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => checkBalance()}
              disabled={checkingBalance}
            >
              <Text style={styles.secondaryButtonText}>
                {checkingBalance ? 'Checking...' : 'Check Balance'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.secondaryButton, styles.clearButton]}
              onPress={handleClearToken}
            >
              <Text style={[styles.secondaryButtonText, styles.clearButtonText]}>
                Clear Token
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.kycInfo}>
        <Text style={styles.kycTitle}>KYC Verification Tiers</Text>
        <View style={styles.kycTier}>
          <View style={[styles.kycBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={styles.kycBadgeText}>Tier 1</Text>
          </View>
          <Text style={styles.kycDescription}>Email verified - Up to ₦500,000 daily limit</Text>
        </View>
        <View style={styles.kycTier}>
          <View style={[styles.kycBadge, { backgroundColor: colors.warning + '20' }]}>
            <Text style={styles.kycBadgeText}>Tier 2</Text>
          </View>
          <Text style={styles.kycDescription}>BVN verified - Up to ₦2,000,000 daily limit</Text>
        </View>
        <View style={styles.kycTier}>
          <View style={[styles.kycBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.kycBadgeText}>Tier 3</Text>
          </View>
          <Text style={styles.kycDescription}>Face, ID & address verified - Unlimited</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.helpLink} onPress={openApiDocs}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        <Text style={styles.helpLinkText}>View API Documentation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.l,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.xl,
    color: colors.white,
    marginTop: spacing.m,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.info + '30',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginHorizontal: spacing.m,
  },
  infoTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.medium,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
  },
  balanceCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    position: 'relative',
  },
  balanceLabel: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.xxxl,
    color: colors.primary,
  },
  refreshButton: {
    position: 'absolute',
    top: spacing.l,
    right: spacing.l,
    padding: spacing.s,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    color: colors.white,
    marginBottom: spacing.m,
  },
  tokenInputContainer: {
    position: 'relative',
  },
  toggleButton: {
    position: 'absolute',
    right: spacing.m,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  saveButton: {
    marginTop: spacing.l,
  },
  savedActions: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.l,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.medium,
    color: colors.primary,
  },
  clearButton: {
    borderColor: colors.error,
  },
  clearButtonText: {
    color: colors.error,
  },
  kycInfo: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  kycTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    color: colors.white,
    marginBottom: spacing.m,
  },
  kycTier: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  kycBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
    marginRight: spacing.m,
    minWidth: 60,
    alignItems: 'center',
  },
  kycBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.xs,
    color: colors.white,
  },
  kycDescription: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
  },
  helpLinkText: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.medium,
    color: colors.primary,
    marginLeft: spacing.s,
  },
});

export default VtuSettingsScreen;