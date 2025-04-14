import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, borderRadius, shadows } from '../styles/theme';
import { getCategoryIcon, getCategoryName } from '../utils/categoryUtils';

/**
 * Card component for merchant preview
 * @param {Object} props - Component props
 * @param {Object} props.merchant - Merchant data
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onViewDetails - View details handler
 * @returns {JSX.Element}
 */
const MerchantCard = ({ merchant, onClose, onViewDetails }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: merchant.image }} 
          style={styles.image} 
          defaultSource={require('../../assets/images/merchant-placeholder.png')}
        />
        {merchant.acceptsWaoCard && (
          <View style={styles.waoCardBadge}>
            <Text style={styles.waoCardBadgeText}>Accepts WaoCard</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{merchant.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color={colors.primary} />
          <Text style={styles.rating}>{merchant.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.category}>
          <Ionicons name={getCategoryIcon(merchant.category)} size={16} color={colors.primary} /> 
          {getCategoryName(merchant.category)}
        </Text>
        <Text style={styles.address}>
          <Ionicons name="location-outline" size={16} color={colors.primary} /> 
          {merchant.address}
        </Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.directionsButton}>
            <Ionicons name="navigate-outline" size={18} color="#FFF" />
            <Text style={styles.buttonText}>Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  imageContainer: {
    height: 150,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  waoCardBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  waoCardBadgeText: {
    color: colors.light,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  content: {
    padding: 5,
  },
  name: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.light,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.light,
    marginLeft: 5,
  },
  category: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTransparent,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  buttonText: {
    color: colors.light,
    fontFamily: fonts.medium,
    marginLeft: 5,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  detailsButtonText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    marginRight: 5,
  },
});

export default MerchantCard;