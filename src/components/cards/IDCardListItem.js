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
  // Get gradient colors based on the card's background color
  const getGradientColors = () => {
    const baseColor = card.backgroundColor || '#5856D6';
    
    // Create a darker variant for gradient
    const darkerColor = baseColor.replace('#', '')
      .match(/.{1,2}/g)
      .map(hex => Math.max(0, parseInt(hex, 16) - 40))
      .map(dec => dec.toString(16).padStart(2, '0'))
      .join('');
    
    return [baseColor, `#${darkerColor}`];
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Card Header with Issuer */}
      <View style={styles.cardHeader}>
        <View style={styles.issuerContainer}>
          {card.logo ? (
            <Image source={{ uri: card.logo }} style={styles.issuerLogo} />
          ) : (
            <View style={styles.issuerPlaceholder}>
              <Ionicons name="school" size={16} color="#FFD700" />
            </View>
          )}
          <Text style={styles.issuerName}>{card.issuer || 'Institution'}</Text>
        </View>
        <View style={styles.typeContainer}>
          <Ionicons name="id-card-outline" size={16} color="#FFF" />
          <Text style={styles.typeText}>ID</Text>
        </View>
      </View>

      {/* Card Name/Title */}
      <View style={styles.cardMiddle}>
        <Text style={styles.cardName}>{card.name}</Text>
        {card.role && (
          <Text style={styles.cardRole}>{card.role}</Text>
        )}
      </View>

      {/* Cardholder Name */}
      <View style={styles.cardFooter}>
        <View style={styles.cardInfoItem}>
          <Text style={styles.cardInfoLabel}>CARDHOLDER</Text>
          <Text style={styles.cardInfoValue} numberOfLines={1}>
            {card.holderName || 'Card Holder'}
          </Text>
        </View>
        
        {/* ID Number - last part only */}
        {card.number && (
          <View style={styles.idContainer}>
            <Text style={styles.idLabel}>ID</Text>
            <Text style={styles.idValue}>
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
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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