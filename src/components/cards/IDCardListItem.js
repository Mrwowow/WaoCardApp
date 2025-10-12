import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const IDCardListItem = ({ card }) => {
  // Utility function to determine if a color is light or dark
  const isLightColor = (hexColor) => {
    if (!hexColor) return false;
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Get appropriate text color based on background
  const getTextColor = (backgroundColor) => {
    return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
  };

  // Get gradient colors based on brandData or card's background color
  const getGradientColors = () => {
    // Prioritize brandData backgroundColor
    const baseColor = (card.brandData && card.brandData.backgroundColor) || card.backgroundColor || '#5856D6';

    // Create a darker variant for gradient
    const darkerColor = baseColor.replace('#', '')
      .match(/.{1,2}/g)
      .map(hex => Math.max(0, parseInt(hex, 16) - 40))
      .map(dec => dec.toString(16).padStart(2, '0'))
      .join('');

    return [baseColor, `#${darkerColor}`];
  };

  // Get dynamic text colors
  const gradientColors = getGradientColors();
  const baseColor = gradientColors[0];
  const dynamicTextColor = getTextColor(baseColor);
  const dynamicSecondaryColor = dynamicTextColor === '#FFFFFF'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)';
  const dynamicAccentColor = dynamicTextColor === '#FFFFFF' ? '#FFD700' : '#DAA520';

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Card Header with Issuer */}
      <View style={styles.cardHeader}>
        <View style={styles.issuerContainer}>
          {/* Prioritize brandData.icon, fallback to logo, then default icon */}
          {(card.brandData && card.brandData.icon) || card.logo ? (
            <Image
              source={{ uri: (card.brandData && card.brandData.icon) || card.logo }}
              style={styles.issuerLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.issuerPlaceholder}>
              <Ionicons name="school" size={20} color={dynamicAccentColor} />
            </View>
          )}
          <Text style={[styles.issuerName, { color: dynamicTextColor }]}>{card.issuer || 'Institution'}</Text>
        </View>
        <View style={styles.typeContainer}>
          <Ionicons name="id-card-outline" size={16} color={dynamicTextColor} />
          <Text style={[styles.typeText, { color: dynamicTextColor }]}>ID</Text>
        </View>
      </View>

      {/* Card Name/Title */}
      <View style={styles.cardMiddle}>
        <Text style={[styles.cardName, { color: dynamicTextColor }]}>{card.name}</Text>
        {card.role && (
          <Text style={[styles.cardRole, { color: dynamicSecondaryColor }]}>{card.role}</Text>
        )}
      </View>

      {/* Cardholder Name */}
      <View style={styles.cardFooter}>
        <View style={styles.cardInfoItem}>
          <Text style={[styles.cardInfoLabel, { color: dynamicSecondaryColor }]}>CARDHOLDER</Text>
          <Text style={[styles.cardInfoValue, { color: dynamicTextColor }]} numberOfLines={1}>
            {card.holderName || 'Card Holder'}
          </Text>
        </View>

        {/* ID Number - last part only */}
        {card.number && (
          <View style={styles.idContainer}>
            <Text style={[styles.idLabel, { color: dynamicSecondaryColor }]}>ID</Text>
            <Text style={[styles.idValue, { color: dynamicAccentColor }]}>
              {card.number.length > 6
                ? '•••' + card.number.slice(-3)
                : card.number}
            </Text>
          </View>
        )}
      </View>

      {/* Card shine effect */}
      <View style={styles.shineEffect} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  issuerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issuerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 4,
  },
  issuerPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  issuerName: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardMiddle: {
    marginBottom: 20,
  },
  cardName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cardInfoItem: {
    flex: 1,
    marginRight: 15,
  },
  cardInfoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  cardInfoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  idContainer: {
    alignItems: 'flex-end',
  },
  idLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    marginBottom: 2,
  },
  idValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  shineEffect: {
    position: 'absolute',
    top: -150,
    left: -150,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 150,
    transform: [{ rotate: '45deg' }],
  },
});

export default IDCardListItem;