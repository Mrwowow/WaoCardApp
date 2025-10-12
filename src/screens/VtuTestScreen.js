// VTU.ng API Test Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../styles/theme';
import GradientButton from '../components/auth/GradientButton';
import { 
  testVtuConnection,
  getVtuWalletBalance,
  purchaseAirtimeVtu,
  validateVtuPhoneNumber
} from '../services/vtuApi';

const VtuTestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, success, message) => {
    const result = {
      id: Date.now(),
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [result, ...prev]);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await testVtuConnection();
      addResult('Connection Test', result.success, result.message);
      
      if (result.success) {
        Alert.alert('Success!', result.message);
      } else {
        Alert.alert('Test Failed', result.message);
      }
    } catch (error) {
      addResult('Connection Test', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testBalance = async () => {
    setLoading(true);
    try {
      const result = await getVtuWalletBalance();
      addResult('Balance Check', result.success, 
        result.success ? `Balance: ₦${result.balance}` : result.message);
    } catch (error) {
      addResult('Balance Check', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testValidation = async () => {
    setLoading(true);
    try {
      const result = await validateVtuPhoneNumber('08012345678', 'mtn');
      addResult('Phone Validation', result.success, 
        result.success ? `Valid: ${result.valid}` : result.message);
    } catch (error) {
      addResult('Phone Validation', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSmallPurchase = async () => {
    Alert.alert(
      'Test Purchase',
      'This will attempt to purchase ₦50 airtime to 08012345678. Only proceed if this is a valid test number.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await purchaseAirtimeVtu({
                phone: '08012345678',
                amount: 50,
                network: 'mtn'
              });
              addResult('Test Purchase', result.success, result.message);
              
              if (result.success) {
                Alert.alert('Purchase Success!', `Transaction ID: ${result.transactionId}`);
              }
            } catch (error) {
              addResult('Test Purchase', false, error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Ionicons name="flask-outline" size={48} color={colors.primary} />
        <Text style={styles.title}>VTU.ng API Test</Text>
        <Text style={styles.subtitle}>
          Test your VTU.ng API integration
        </Text>
      </View>

      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>API Tests</Text>
        
        <GradientButton
          title="Test Connection & Balance"
          onPress={testConnection}
          loading={loading}
          style={styles.testButton}
          icon="wifi-outline"
        />

        <GradientButton
          title="Test Balance Only"
          onPress={testBalance}
          loading={loading}
          style={styles.testButton}
          icon="wallet-outline"
        />

        <GradientButton
          title="Test Phone Validation"
          onPress={testValidation}
          loading={loading}
          style={styles.testButton}
          icon="checkmark-circle-outline"
        />

        <GradientButton
          title="Test Small Purchase (₦50)"
          onPress={testSmallPurchase}
          loading={loading}
          style={[styles.testButton, styles.dangerButton]}
          icon="card-outline"
        />
      </View>

      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {results.length > 0 && (
            <TouchableOpacity onPress={clearResults}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {results.length === 0 ? (
          <View style={styles.emptyResults}>
            <Ionicons name="document-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No test results yet</Text>
            <Text style={styles.emptySubtext}>Run a test to see results here</Text>
          </View>
        ) : (
          results.map((result) => (
            <View key={result.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultInfo}>
                  <Ionicons 
                    name={result.success ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={result.success ? colors.success : colors.error} 
                  />
                  <Text style={styles.resultTest}>{result.test}</Text>
                </View>
                <Text style={styles.resultTime}>{result.timestamp}</Text>
              </View>
              <Text style={[
                styles.resultMessage,
                { color: result.success ? colors.success : colors.error }
              ]}>
                {result.message}
              </Text>
            </View>
          ))
        )}
      </View>
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
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  testSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    color: colors.white,
    marginBottom: spacing.m,
  },
  testButton: {
    marginBottom: spacing.m,
  },
  dangerButton: {
    // Could add warning styling here
  },
  resultsSection: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  clearButton: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.medium,
  },
  emptyResults: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    color: colors.white,
    marginTop: spacing.m,
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    marginTop: spacing.s,
  },
  resultCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTest: {
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.medium,
    color: colors.white,
    marginLeft: spacing.s,
  },
  resultTime: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.small,
    color: colors.textTertiary,
  },
  resultMessage: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.small,
    lineHeight: 18,
  },
});

export default VtuTestScreen;