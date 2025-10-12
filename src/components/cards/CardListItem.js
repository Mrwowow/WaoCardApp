import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import IDCardListItem from './IDCardListItem';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px padding on each side

const CardListItem = ({ card, onPress }) => {
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

  // Create a darker shade of a color for gradients
  const getDarkerShade = (hexColor) => {
    if (!hexColor) return '#000000';
    const color = hexColor.replace('#', '');
    const darkerColor = color
      .match(/.{1,2}/g)
      .map(hex => Math.max(0, parseInt(hex, 16) - 40))
      .map(dec => dec.toString(16).padStart(2, '0'))
      .join('');
    return `#${darkerColor}`;
  };

  // Use simplified ID card view for list display
  if (card.type === 'id') {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <IDCardListItem card={card} />
      </TouchableOpacity>
    );
  }

  // Card type specific properties
  const getCardIcon = () => {
    switch (card.type) {
      case 'payment':
        return 'card-outline';
      case 'loyalty':
        return 'ribbon-outline';
      case 'id':
        return 'id-card-outline';
      case 'ticket':
        return 'ticket-outline';
      case 'gift':
        return 'gift-outline';
      case 'business':
        return 'briefcase-outline';
      default:
        return 'card-outline';
    }
  };

  // Card type specific background gradient
  const getCardGradient = () => {
    // Check if card has brandData with backgroundColor
    if (card.brandData && card.brandData.backgroundColor) {
      const baseColor = card.brandData.backgroundColor;
      const gradientColor = getDarkerShade(baseColor);
      return [baseColor, gradientColor];
    }

    // Fallback to default colors by type
    switch (card.type) {
      case 'payment':
        return ['#0A84FF', '#0066CC'];
      case 'loyalty':
        return ['#FF9500', '#E08600'];
      case 'id':
        return ['#5856D6', '#4639B8'];
      case 'ticket':
        return ['#FF2D55', '#D70041'];
      case 'gift':
        return ['#34C759', '#28A745'];
      case 'business':
        return ['#8E8E93', '#636366'];
      default:
        return ['#0A84FF', '#0066CC'];
    }
  };

  // Get dynamic text colors based on background
  const cardGradient = getCardGradient();
  const dynamicTextColor = card.brandData && card.brandData.backgroundColor
    ? getTextColor(card.brandData.backgroundColor)
    : '#FFFFFF';
  const dynamicSecondaryColor = dynamicTextColor === '#FFFFFF'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)';

  // Format card number with proper spacing
  const formatCardNumber = (number) => {
    if (!number) return '';
    
    // Different formatting based on card type
    if (card.type === 'payment') {
      return number.replace(/(.{4})/g, '$1 ').trim();
    }
    
    return number;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={cardGradient}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Card Header */}
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
                <Ionicons
                  name={getCardIcon()}
                  size={20}
                  color={dynamicTextColor}
                />
              </View>
            )}
            <Text style={[styles.issuerName, { color: dynamicTextColor }]}>{card.issuer || 'Card'}</Text>
          </View>
          <View style={styles.typeContainer}>
            <Text style={[styles.typeText, { color: dynamicTextColor }]}>
              {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Card Middle Section */}
        <View style={styles.cardMiddle}>
          <Text style={[styles.cardName, { color: dynamicTextColor }]}>{card.name}</Text>
          {card.number && (
            <Text style={[styles.cardNumber, { color: dynamicTextColor }]}>
              {card.type === 'payment'
                ? '•••• •••• •••• ' + card.number.slice(-4)
                : formatCardNumber(card.number)}
            </Text>
          )}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          {card.type === 'payment' && (
            <>
              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, { color: dynamicSecondaryColor }]}>VALID THRU</Text>
                <Text style={[styles.cardInfoValue, { color: dynamicTextColor }]}>{card.expiry || 'MM/YY'}</Text>
              </View>

              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, { color: dynamicSecondaryColor }]}>HOLDER</Text>
                <Text style={[styles.cardInfoValue, { color: dynamicTextColor }]}>{card.holderName || 'CARD HOLDER'}</Text>
              </View>

              <View style={styles.cardNetwork}>
                {card.network === 'visa' && (
                  <Text style={[styles.cardNetworkText, { color: dynamicTextColor }]}>VISA</Text>
                )}
                {card.network === 'mastercard' && (
                  <Text style={[styles.cardNetworkText, { color: dynamicTextColor }]}>MasterCard</Text>
                )}
                {card.network === 'amex' && (
                  <Text style={[styles.cardNetworkText, { color: dynamicTextColor }]}>AMEX</Text>
                )}
              </View>
            </>
          )}

          {card.type === 'loyalty' && (
            <>
              <View style={styles.pointsContainer}>
                <Text style={[styles.pointsValue, { color: dynamicTextColor }]}>{card.points || '0'}</Text>
                <Text style={[styles.pointsLabel, { color: dynamicSecondaryColor }]}>POINTS</Text>
              </View>
              {card.number && (
                <View style={styles.qrIndicator}>
                  <Ionicons name="qr-code" size={16} color={dynamicTextColor} />
                </View>
              )}
            </>
          )}

          {card.type === 'ticket' && (
            <>
              <View style={styles.dateContainer}>
                <Text style={[styles.dateLabel, { color: dynamicSecondaryColor }]}>DATE</Text>
                <Text style={[styles.dateValue, { color: dynamicTextColor }]}>{card.date || 'DD/MM/YYYY'}</Text>
              </View>
              {card.number && (
                <View style={styles.qrIndicator}>
                  <Ionicons name="qr-code" size={16} color={dynamicTextColor} />
                </View>
              )}
            </>
          )}

          {card.type === 'gift' && (
            <>
              <View style={styles.balanceContainer}>
                <Text style={[styles.balanceLabel, { color: dynamicSecondaryColor }]}>BALANCE</Text>
                <Text style={[styles.balanceValue, { color: dynamicTextColor }]}>{card.balance || '$0.00'}</Text>
              </View>
              {card.number && (
                <View style={styles.qrIndicator}>
                  <Ionicons name="qr-code" size={16} color={dynamicTextColor} />
                </View>
              )}
            </>
          )}
        </View>

        {/* Card shine effect */}
        <View style={styles.shineEffect} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 200,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
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
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 4,
  },
  issuerPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  issuerInitial: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  issuerName: {
    color: '#FFF',
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
  cardNumber: {
    color: '#FFF',
    fontSize: 16,
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cardInfoItem: {
    marginRight: 15,
  },
  cardInfoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    marginBottom: 2,
  },
  cardInfoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cardNetwork: {
    marginLeft: 'auto',
  },
  cardNetworkText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pointsLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  dateContainer: {
    alignItems: 'flex-start',
  },
  dateLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    marginBottom: 2,
  },
  dateValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'flex-start',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    marginBottom: 2,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 'auto',
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

export default CardListItem;