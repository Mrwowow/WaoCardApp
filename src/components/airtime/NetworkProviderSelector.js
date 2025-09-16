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

const NetworkProviderSelector = ({ providers, selectedProvider, onSelectProvider }) => {
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
    if (provider.logo) {
      return (
        <Image source={{ uri: provider.logo }} style={styles.providerLogo} />
      );
    }
    
    // Fallback to colored circle with text
    return (
      <View 
        style={[styles.providerLogoFallback, { backgroundColor: provider.color || colors.primary + '33' }]}
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
    padding: spacing.m,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.small,
    marginTop: spacing.s,
  },
});

export default NetworkProviderSelector;