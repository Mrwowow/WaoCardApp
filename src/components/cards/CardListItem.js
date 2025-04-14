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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px padding on each side

const CardListItem = ({ card, onPress }) => {
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
        colors={getCardGradient()}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.issuerContainer}>
            {card.logo ? (
              <Image source={{ uri: card.logo }} style={styles.issuerLogo} />
            ) : (
              <View style={styles.issuerPlaceholder}>
                <Text style={styles.issuerInitial}>
                  {card.issuer ? card.issuer.charAt(0).toUpperCase() : 'C'}
                </Text>
              </View>
            )}
            <Text style={styles.issuerName}>{card.issuer || 'Card'}</Text>
          </View>
          <View style={styles.typeContainer}>
            <Ionicons name={getCardIcon()} size={16} color="#FFF" />
            <Text style={styles.typeText}>
              {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Card Middle Section */}
        <View style={styles.cardMiddle}>
          <Text style={styles.cardName}>{card.name}</Text>
          {card.number && (
            <Text style={styles.cardNumber}>
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
                <Text style={styles.cardInfoLabel}>VALID THRU</Text>
                <Text style={styles.cardInfoValue}>{card.expiry || 'MM/YY'}</Text>
              </View>
              
              <View style={styles.cardInfoItem}>
                <Text style={styles.cardInfoLabel}>HOLDER</Text>
                <Text style={styles.cardInfoValue}>{card.holderName || 'CARD HOLDER'}</Text>
              </View>
              
              <View style={styles.cardNetwork}>
                {card.network === 'visa' && (
                  <Text style={styles.cardNetworkText}>VISA</Text>
                )}
                {card.network === 'mastercard' && (
                  <Text style={styles.cardNetworkText}>MasterCard</Text>
                )}
                {card.network === 'amex' && (
                  <Text style={styles.cardNetworkText}>AMEX</Text>
                )}
              </View>
            </>
          )}

          {card.type === 'loyalty' && (
            <>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsValue}>{card.points || '0'}</Text>
                <Text style={styles.pointsLabel}>POINTS</Text>
              </View>
            </>
          )}

          {card.type === 'ticket' && (
            <>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>DATE</Text>
                <Text style={styles.dateValue}>{card.date || 'DD/MM/YYYY'}</Text>
              </View>
            </>
          )}

          {card.type === 'gift' && (
            <>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>BALANCE</Text>
                <Text style={styles.balanceValue}>{card.balance || '$0.00'}</Text>
              </View>
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
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  issuerPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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