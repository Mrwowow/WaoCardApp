// src/components/airtime/NetworkProviderSelector.js
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
import { getProviderIcon } from '../icons/NetworkProviderIcons';

const NetworkProviderSelector = ({ providers, selectedProvider, onSelectProvider, compact = false }) => {
  const [loading, setLoading] = useState(false);
  
  // Default providers if API fails
  const defaultProviders = [
    { id: '1', name: 'MTN', logo: null, color: '#FFCC00', prefixes: ['0803', '0806', '0703'] },
    { id: '2', name: 'Airtel', logo: null, color: '#FF0000', prefixes: ['0802', '0808', '0701'] },
    { id: '3', name: 'Glo', logo: null, color: '#00FF00', prefixes: ['0805', '0807', '0705'] },
    { id: '4', name: '9Mobile', logo: null, color: '#00AA00', prefixes: ['0809', '0817', '0818'] },
  ];
  
  // If no providers are passed, use default ones
  const providersToRender = providers?.length > 0 ? providers : defaultProviders;
  
  const renderLogo = (provider) => {
    return getProviderIcon(provider.name, 50);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading providers...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {providersToRender.map((provider) => (
        <TouchableOpacity
          key={provider.id}
          style={[
            compact ? styles.compactProviderItem : styles.providerItem,
            selectedProvider?.id === provider.id && (compact ? styles.compactSelectedProviderItem : styles.selectedProviderItem)
          ]}
          onPress={() => onSelectProvider(provider)}
        >
          {compact ? (
            <View style={styles.compactProviderContent}>
              {getProviderIcon(provider.name, 24)}
              <Text style={styles.compactProviderName}>{provider.name}</Text>
            </View>
          ) : (
            <>
              {renderLogo(provider)}
              <Text style={styles.providerName}>{provider.name}</Text>
            </>
          )}
          
          {selectedProvider?.id === provider.id && (
            <Ionicons 
              name="checkmark-circle" 
              size={compact ? 14 : 18} 
              color={colors.primary} 
              style={compact ? styles.compactCheckIcon : styles.checkIcon} 
            />
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
    padding: spacing.m,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.small,
    marginTop: spacing.s,
  },
  compactProviderItem: {
    height: 60,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.small,
    marginRight: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 80,
  },
  compactSelectedProviderItem: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  compactProviderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactProviderName: {
    color: colors.white,
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.medium,
  },
  compactCheckIcon: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
});

export default NetworkProviderSelector;