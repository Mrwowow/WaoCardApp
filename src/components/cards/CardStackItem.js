import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CardStackItem = ({ card, isSelected, isExpanded, onPress }) => {
  // Get card type colors and gradients
  const getCardColors = (type) => {
    switch (type) {
      case 'payment':
        return {
          colors: ['#FF6B6B', '#FF8E8E'],
          textColor: '#FFFFFF',
          secondaryColor: '#FFE0E0',
        };
      case 'loyalty':
        return {
          colors: ['#4ECDC4', '#44B3AB'],
          textColor: '#FFFFFF',
          secondaryColor: '#E0F7F5',
        };
      case 'store':
        return {
          colors: ['#FF9500', '#E08600'],
          textColor: '#FFFFFF',
          secondaryColor: '#FFE5B3',
        };
      case 'id':
        // Use the card's custom background color if available
        const bgColor = card.backgroundColor || '#5856D6';
        const darkerColor = bgColor.replace('#', '')
          .match(/.{1,2}/g)
          .map(hex => Math.max(0, parseInt(hex, 16) - 40))
          .map(dec => dec.toString(16).padStart(2, '0'))
          .join('');
        return {
          colors: [bgColor, `#${darkerColor}`],
          textColor: '#FFFFFF',
          secondaryColor: '#FFD700', // Gold for ID cards
        };
      case 'ticket':
        return {
          colors: ['#A29BFE', '#8B7FF0'],
          textColor: '#FFFFFF',
          secondaryColor: '#EEEBFF',
        };
      case 'gift':
        return {
          colors: ['#FD79A8', '#E84393'],
          textColor: '#FFFFFF',
          secondaryColor: '#FFEEF7',
        };
      case 'business':
        return {
          colors: ['#636E72', '#2D3436'],
          textColor: '#FFFFFF',
          secondaryColor: '#F1F2F6',
        };
      default:
        return {
          colors: ['#74B9FF', '#0984E3'],
          textColor: '#FFFFFF',
          secondaryColor: '#E3F2FD',
        };
    }
  };

  const cardColors = getCardColors(card.type);

  // Get card type icon
  const getCardIcon = (type) => {
    switch (type) {
      case 'payment': return 'card-outline';
      case 'loyalty': return 'ribbon-outline';
      case 'store': return 'storefront-outline';
      case 'id': return 'id-card-outline';
      case 'ticket': return 'ticket-outline';
      case 'gift': return 'gift-outline';
      case 'business': return 'briefcase-outline';
      default: return 'card-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={cardColors.colors}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeContainer}>
            {card.logo ? (
              <Image
                source={{ uri: card.logo }}
                style={styles.cardLogo}
                resizeMode="contain"
              />
            ) : (
              <Ionicons
                name={getCardIcon(card.type)}
                size={20}
                color={cardColors.textColor}
              />
            )}
            <Text style={[styles.cardType, { color: cardColors.textColor }]}>
              {card.issuer || card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            </Text>
          </View>
          
          {/* Card menu dots */}
          <View style={styles.menuDots}>
            <View style={[styles.dot, { backgroundColor: cardColors.textColor }]} />
            <View style={[styles.dot, { backgroundColor: cardColors.textColor }]} />
            <View style={[styles.dot, { backgroundColor: cardColors.textColor }]} />
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={[styles.cardName, { color: cardColors.textColor }]} numberOfLines={2}>
            {card.name}
          </Text>
          
          {/* ID Card specific display */}
          {card.type === 'id' ? (
            <>
              {card.holderName && (
                <Text style={[styles.cardHolderName, { color: cardColors.secondaryColor }]} numberOfLines={1}>
                  {card.holderName}
                </Text>
              )}
              {card.issuer && (
                <Text style={[styles.cardIssuer, { color: cardColors.textColor }]} numberOfLines={1}>
                  {card.issuer}
                </Text>
              )}
              {card.number && (
                <Text style={[styles.cardIdNumber, { color: cardColors.secondaryColor }]}>
                  ID: {card.number.length > 6 ? '•••' + card.number.slice(-3) : card.number}
                </Text>
              )}
            </>
          ) : (
            <>
              {card.number && (
                <Text style={[styles.cardNumber, { color: cardColors.secondaryColor }]}>
                  •••• •••• •••• {card.number.slice(-4)}
                </Text>
              )}
              
              {card.barcode && (
                <View style={styles.barcodeContainer}>
                  <Ionicons
                    name="barcode-outline"
                    size={24}
                    color={cardColors.textColor}
                  />
                  <Text style={[styles.barcodeText, { color: cardColors.secondaryColor }]}>
                    {card.barcode.slice(-8)}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
         
          
          {card.expiryDate && (
            <View style={styles.expiryContainer}>
              <Text style={[styles.expiryLabel, { color: cardColors.secondaryColor }]}>
                Expires
              </Text>
              <Text style={[styles.expiryDate, { color: cardColors.textColor }]}>
                {card.expiryDate}
              </Text>
            </View>
          )}
        </View>

        {/* Selection indicator */}
        {isSelected && isExpanded && (
          <View style={styles.selectionIndicator}>
            <View style={styles.selectionDot} />
          </View>
        )}

        {/* Tap hint for collapsed stack */}
        {!isExpanded && (
          <View style={styles.tapHint}>
            <Ionicons
              name="chevron-up-outline"
              size={16}
              color={cardColors.secondaryColor}
            />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  cardLogo: {
    width: 28,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  menuDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    paddingTop: 10,
    marginBottom: 4,
    lineHeight: 26,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 2,
    marginTop: 4,
  },
  // ID Card specific styles
  cardHolderName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  cardIssuer: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 4,
  },
  cardIdNumber: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 2,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  barcodeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceContainer: {
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expiryContainer: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
  },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    opacity: 0.6,
  },
});

export default CardStackItem;
