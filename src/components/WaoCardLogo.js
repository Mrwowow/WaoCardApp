import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * WaoCard Logo Component
 * Used for displaying the WaoCard logo in various places in the app
 */
const WaoCardLogo = ({ size = 'medium', color = '#fff' }) => {
  // Size variations
  const logoSizes = {
    small: {
      fontSize: 12,
      iconSize: 14,
      spacing: 2,
    },
    medium: {
      fontSize: 16,
      iconSize: 18,
      spacing: 3,
    },
    large: {
      fontSize: 20,
      iconSize: 22,
      spacing: 4,
    }
  };

  const { fontSize, iconSize, spacing } = logoSizes[size] || logoSizes.medium;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { marginRight: spacing }]}>
        <Ionicons name="wifi" size={iconSize} color={color} />
      </View>
      <Text style={[styles.text, { fontSize, color }]}>WaoCard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    transform: [{ rotate: '45deg' }],
  },
  text: {
    fontWeight: 'bold',
  },
});

export default WaoCardLogo;