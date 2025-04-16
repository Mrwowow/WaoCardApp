import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  ScrollView,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';

import CardListItem from './CardListItem';

const { width, height } = Dimensions.get('window');

const CardDetailsModal = ({ visible, card, onClose, onDelete }) => {
  // Animation
  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Reset animation values
      slideAnim.setValue(height);
      opacityAnim.setValue(0);
      
      // Run animations
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  const handleClose = () => {
    // Close with animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  const handleShare = async () => {
    try {
      // Trigger haptic feedback
      Platform.OS === 'ios' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Prepare share content based on card type
      let message = `Check out my ${card.type} card: ${card.name}`;
      
      if (card.type === 'payment') {
        message = `I'm using ${card.name} from ${card.issuer || 'my bank'} for payments.`;
      } else if (card.type === 'loyalty') {
        message = `I'm collecting points with my ${card.name} loyalty card. Join now!`;
      }
      
      await Share.share({
        message,
        title: `WaoCard - ${card.name}`,
      });
    } catch (error) {
      console.error('Error sharing card:', error);
    }
  };
  
  const formatCardCreationDate = () => {
    if (!card.createdAt) return 'Unknown';
    
    const date = new Date(card.createdAt);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get field label based on card type
  const getFieldLabel = (field) => {
    switch (field) {
      case 'number':
        return card.type === 'payment' ? 'Card Number' : 
               card.type === 'loyalty' ? 'Membership ID' : 
               card.type === 'ticket' ? 'Ticket Number' : 'Card ID';
      case 'expiry':
        return 'Expiry Date';
      case 'holderName':
        return 'Cardholder Name';
      case 'network':
        return 'Card Network';
      case 'points':
        return 'Points Balance';
      case 'balance':
        return 'Available Balance';
      case 'date':
        return 'Event Date';
      case 'location':
        return 'Event Location';
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };
  
  // Format card number with proper masking based on card type
  const formatCardField = (field, value) => {
    if (!value) return '-';
    
    if (field === 'number' && card.type === 'payment') {
      // Mask all but last 4 digits
      return '•••• •••• •••• ' + value.replace(/\s/g, '').slice(-4);
    }
    
    if (field === 'network' && card.type === 'payment') {
      // Capitalize card network
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    return value;
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: opacityAnim }
        ]}
      >
        <BlurView intensity={30} tint="dark" style={styles.blurView}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            activeOpacity={1}
            onPress={handleClose}
          />
          
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.handle} />
            
            {/* Card Preview */}
            <View style={styles.cardPreviewContainer}>
              <CardListItem card={card} onPress={() => {}} />
            </View>
            
            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <LinearGradient
                  colors={['rgba(255, 149, 0, 0.2)', 'rgba(224, 134, 0, 0.2)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="share-outline" size={22} color="#FF9500" />
                </LinearGradient>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Platform.OS === 'ios' && 
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Add update functionality
                  alert('Update feature coming soon');
                }}
              >
                <LinearGradient
                  colors={['rgba(10, 132, 255, 0.2)', 'rgba(0, 122, 255, 0.2)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="create-outline" size={22} color="#0A84FF" />
                </LinearGradient>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Platform.OS === 'ios' && 
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onDelete();
                }}
              >
                <LinearGradient
                  colors={['rgba(255, 45, 85, 0.2)', 'rgba(215, 0, 65, 0.2)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF2D55" />
                </LinearGradient>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
            {/* Card Details */}
            <ScrollView style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Card Details</Text>
              
              {/* QR Code for cards that need it */}
              {(card.type === 'loyalty' || card.type === 'gift' || card.type === 'ticket') && card.number && (
                <View style={styles.qrCodeContainer}>
                  <QRCode
                    value={card.number}
                    size={150}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                  <Text style={styles.qrCodeText}>
                    Scan this code at {card.issuer || 'the merchant'}
                  </Text>
                </View>
              )}
              
              {/* Created Date */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Added On</Text>
                <Text style={styles.detailValue}>{formatCardCreationDate()}</Text>
              </View>
              
              {/* Card Type */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card Type</Text>
                <View style={styles.cardTypeTag}>
                  <Ionicons 
                    name={getCardTypeIcon(card.type)} 
                    size={14} 
                    color="#FF9500" 
                  />
                  <Text style={styles.cardTypeText}>
                    {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
                  </Text>
                </View>
              </View>
              
              {/* Issuer */}
              {card.issuer && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Issuer</Text>
                  <Text style={styles.detailValue}>{card.issuer}</Text>
                </View>
              )}
              
              {/* Dynamic Card Fields */}
              {Object.entries(card).map(([key, value]) => {
                // Skip fields that are not card data or already shown
                if (['id', 'type', 'name', 'issuer', 'logo', 'createdAt'].includes(key) || !value) {
                  return null;
                }
                
                return (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{getFieldLabel(key)}</Text>
                    <Text style={styles.detailValue}>{formatCardField(key, value)}</Text>
                  </View>
                );
              })}
            </ScrollView>
            
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

// Helper function to get card type icon
const getCardTypeIcon = (type) => {
  switch (type) {
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  blurView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  cardPreviewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    maxHeight: 300,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  qrCodeText: {
    marginTop: 10,
    color: '#121212',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailValue: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  cardTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardTypeText: {
    color: '#FF9500',
    fontSize: 14,
    marginLeft: 5,
  },
  closeButton: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CardDetailsModal;