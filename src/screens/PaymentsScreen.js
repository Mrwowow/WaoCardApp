// src/screens/PaymentsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, spacing, borderRadius, commonStyles } from '../styles/theme';
import { getAirtimeHistory } from '../services/airtimeService';
import { getBillHistory } from '../services/billsService';
import NetInfo from '@react-native-community/netinfo';
import OfflineNotice from '../components/OfflineNotice';

const PaymentsScreen = () => {
  const navigation = useNavigation();
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [recentTransactions, setRecentTransactions] = useState([]);
  
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
  
  useEffect(() => {
    // Load recent transactions
    // This would normally come from your API services
    const loadTransactions = async () => {
      try {
        // In a real app, you would use the user ID from context
        const userId = 'current_user_id';
        
        // Load both airtime and bill payment history
        const airtimeHistory = await getAirtimeHistory(userId);
        const billHistory = await getBillHistory(userId);
        
        // Combine and sort by date
        const allTransactions = [...airtimeHistory, ...billHistory]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5); // Get the 5 most recent
        
        setRecentTransactions(allTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };
    
    // For demo purposes, just show dummy data
    setRecentTransactions([
      { 
        id: '1', 
        type: 'airtime', 
        amount: '1,000', 
        date: '2025-04-19', 
        recipient: '08012345678',
        provider: 'MTN',
        status: 'success'
      },
      { 
        id: '2', 
        type: 'bill', 
        amount: '15,500', 
        date: '2025-04-18', 
        provider: 'DSTV',
        billName: 'DSTV Premium',
        reference: 'AC12345678',
        status: 'success'
      },
      { 
        id: '3', 
        type: 'airtime', 
        amount: '500', 
        date: '2025-04-17', 
        recipient: '09087654321',
        provider: 'Airtel',
        status: 'pending'
      },
    ]);
  }, []);
  
  const renderServiceOptions = () => {
    return (
      <View style={styles.servicesContainer}>
        <TouchableOpacity 
          style={styles.serviceItem}
          onPress={() => navigation.navigate('AirtimeScreen')}
        >
          <View style={styles.serviceIconContainer}>
            <Ionicons name="phone-portrait" size={28} color={colors.primary} />
          </View>
          <Text style={styles.serviceTitle}>Airtime</Text>
          <Text style={styles.serviceDescription}>Buy airtime for any network</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.serviceArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.serviceItem}
          onPress={() => navigation.navigate('BillsPaymentScreen')}
        >
          <View style={styles.serviceIconContainer}>
            <Ionicons name="receipt" size={28} color={colors.primary} />
          </View>
          <Text style={styles.serviceTitle}>Bill Payments</Text>
          <Text style={styles.serviceDescription}>Pay utility & subscription bills</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.serviceArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.serviceItem}
          onPress={() => navigation.navigate('DataPurchaseScreen')}
        >
          <View style={[styles.serviceIconContainer, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
            <Ionicons name="globe" size={28} color="#007AFF" />
          </View>
          <Text style={styles.serviceTitle}>Buy Data</Text>
          <Text style={styles.serviceDescription}>Purchase data bundles</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.serviceArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.serviceItem}>
          <View style={[styles.serviceIconContainer, { backgroundColor: 'rgba(48, 209, 88, 0.1)' }]}>
            <Ionicons name="card" size={28} color={colors.success} />
          </View>
          <Text style={styles.serviceTitle}>WaoCard Recharge</Text>
          <Text style={styles.serviceDescription}>Add money to your WaoCard</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.serviceArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.serviceItem}>
          <View style={[styles.serviceIconContainer, { backgroundColor: 'rgba(10, 132, 255, 0.1)' }]}>
            <Ionicons name="swap-horizontal" size={28} color={colors.infoBlue} />
          </View>
          <Text style={styles.serviceTitle}>Transfer Money</Text>
          <Text style={styles.serviceDescription}>Send money to bank accounts</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.serviceArrow} />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderTransactions = () => {
    if (recentTransactions.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="receipt-outline" size={60} color={colors.textTertiary} />
          <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyStateMessage}>Your recent transactions will appear here</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.transactionsContainer}>
        {recentTransactions.map((transaction) => (
          <TouchableOpacity 
            key={transaction.id}
            style={styles.transactionItem}
          >
            <View style={styles.transactionIconContainer}>
              <Ionicons 
                name={transaction.type === 'airtime' ? 'phone-portrait' : 'receipt'} 
                size={24} 
                color={colors.primary} 
              />
            </View>
            
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>
                {transaction.type === 'airtime' 
                  ? `${transaction.provider} Airtime` 
                  : transaction.billName}
              </Text>
              <Text style={styles.transactionDetail}>
                {transaction.type === 'airtime' 
                  ? transaction.recipient 
                  : `Ref: ${transaction.reference}`}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.transactionAmount}>₦{transaction.amount}</Text>
              <View style={[styles.statusBadge, 
                transaction.status === 'success' 
                  ? styles.successBadge 
                  : transaction.status === 'pending' 
                    ? styles.pendingBadge 
                    : styles.failedBadge
              ]}>
                <Text style={styles.statusText}>{transaction.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>View All Transactions</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {!isConnected && <OfflineNotice />}
     
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'services' && styles.activeTabButton]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'transactions' && styles.activeTabButton]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>Recent</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'services' ? renderServiceOptions() : renderTransactions()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: spacing.l,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: colors.white,
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.semiBold,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    marginRight: spacing.m,
  },
  tabText: {
    color: colors.textTertiary,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.medium,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  servicesContainer: {
    padding: spacing.l,
  },
  serviceItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  serviceTitle: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.small,
    marginBottom: spacing.s,
  },
  serviceArrow: {
    position: 'absolute',
    right: spacing.l,
    top: '50%',
    marginTop: -10,
  },
  transactionsContainer: {
    padding: spacing.l,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  transactionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.medium,
  },
  transactionDetail: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.small,
    marginTop: 2,
  },
  transactionDate: {
    color: colors.textTertiary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.xs,
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.medium,
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 12,
  },
  successBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 214, 10, 0.2)',
  },
  failedBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  statusText: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.medium,
    color: colors.white,
  },
  viewMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
    marginTop: spacing.m,
  },
  viewMoreText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: fonts.sizes.small,
    marginRight: spacing.xs,
  },
  emptyStateContainer: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: fonts.sizes.large,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  emptyStateMessage: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.medium,
    textAlign: 'center',
  },
});

export default PaymentsScreen;