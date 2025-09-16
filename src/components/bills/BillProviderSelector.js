// src/components/bills/BillProviderSelector.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../../styles/theme';
import { getBillProviders } from '../../services/billsService';

const BillProviderSelector = ({ categoryId, selectedProvider, onSelectProvider }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!categoryId) return;
    
    const loadProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const providersData = await getBillProviders(categoryId);
        setProviders(providersData);
      } catch (error) {
        console.error('Failed to load providers:', error);
        setError('Failed to load providers');
        
        // Default providers for demo
        if (categoryId === '1') { // TV Subscription
          setProviders([
            { id: '101', name: 'DSTV', logo: null, color: '#0077C8' },
            { id: '102', name: 'GOtv', logo: null, color: '#7B44C8' },
            { id: '103', name: 'StarTimes', logo: null, color: '#E50914' },
          ]);
        } else if (categoryId === '2') { // Electricity
          setProviders([
            { id: '201', name: 'EKEDC', logo: null, color: '#FFAE00' },
            { id: '202', name: 'IKEDC', logo: null, color: '#F23D3D' },
            { id: '203', name: 'AEDC', logo: null, color: '#3D72F2' },
          ]);
        } else {
          // Generic providers for other categories
          setProviders([
            { id: `${categoryId}01`, name: 'Provider 1', logo: null, color: '#FF9500' },
            { id: `${categoryId}02`, name: 'Provider 2', logo: null, color: '#FF2D55' },
            { id: `${categoryId}03`, name: 'Provider 3', logo: null, color: '#5AC8FA' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProviders();
  }, [categoryId]);
  
  const renderLogo = (provider) => {
    if (provider.logo) {
      return (
        <Image source={{ uri: provider.logo }} style={styles.providerLogo} />
      );
    }
    
    // Fallback to colored circle with text
    return (
      <View 
        style={[styles.providerLogoFallback, { backgroundColor: provider.color ? `${provider.color}33` : colors.primary + '33' }]}
      >
        <Text style={styles.providerLogoText}>{provider.name.substring(0, 1)}</Text>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading providers...</Text>
      </View>
    );
  }
  
  if (error && providers.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {providers.map((provider) => (
        <TouchableOpacity
          key={provider.id}
          style={[
            styles.providerItem,
            selectedProvider?.id === provider.id && styles.selectedProviderItem
          ]}
          onPress={() => onSelectProvider(provider)}
        >
          {renderLogo(provider)}
          <Text style={styles.providerName}>{provider.name}</Text>
          
          {selectedProvider?.id === provider.id && (
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing.m,
  },
  providerItem: {
    width: 100,
    height: 110,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    marginRight: spacing.m,
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedProviderItem: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: spacing.s,
  },
  providerLogoFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerLogoText: {
    color: colors.white,
    fontSize: fonts.sizes.large,
    fontFamily: fonts.bold,
  },
  providerName: {
    color: colors.white,
    fontSize: fonts.sizes.small,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  checkIcon: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  loadingContainer: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.small,
    marginTop: spacing.s,
  },
  errorContainer: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  errorText: {
    color: colors.error,
    fontSize: fonts.sizes.small,
    marginLeft: spacing.s,
  },
});

export default BillProviderSelector;