import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const IDCardTemplate = ({ card, showActions = false, onShare, onEdit, onDelete, scrollViewRef }) => {
  // State for showing/hiding actions and details
  const [actionsVisible, setActionsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  // Get gradient colors based on the card's background color
  const getGradientColors = () => {
    const baseColor = card.backgroundColor || '#1e3c72';
    
    // Create a darker variant for gradient
    const darkerColor = baseColor.replace('#', '')
      .match(/.{1,2}/g)
      .map(hex => Math.max(0, parseInt(hex, 16) - 40))
      .map(dec => dec.toString(16).padStart(2, '0'))
      .join('');
    
    return [baseColor, `#${darkerColor}`];
  };

  // Toggle actions visibility
  const toggleActions = () => {
    const toValue = actionsVisible ? 0 : 1;
    setActionsVisible(!actionsVisible);
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-scroll to focus on actions when opening
    if (!actionsVisible && scrollViewRef?.current) {
      // Wait for the animation to start, then scroll
      setTimeout(() => {
        // Simple scroll down to show the expanded actions
        // Scroll to approximately where the actions panel will be
        scrollViewRef.current.scrollTo({
          y: 250, // Scroll down to show actions panel
          animated: true,
        });
      }, 150);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header with institution name and logo */}
        <View style={styles.header}>
          <View style={styles.institutionContainer}>
            {card.logo ? (
              <Image source={{ uri: card.logo }} style={styles.institutionLogo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="school" size={20} color="#FFD700" />
              </View>
            )}
            <Text style={styles.institutionName}>{card.issuer || 'Institution'}</Text>
          </View>
        </View>

        {/* Campus/Building Image Background */}
        <View style={styles.campusImageContainer}>
          {card.campusImage ? (
            <Image 
              source={{ uri: card.campusImage }} 
              style={styles.campusImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.campusImagePlaceholder}>
              <Ionicons name="business" size={30} color="rgba(255,255,255,0.3)" />
            </View>
          )}
        </View>

        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          {card.photo ? (
            <Image 
              source={{ uri: card.photo }} 
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Ionicons name="person" size={40} color="#FFF" />
            </View>
          )}
        </View>

        {/* Name and Role */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{card.holderName || 'Card Holder'}</Text>
          <Text style={styles.role}>{card.role || 'Student'}</Text>
        </View>

        {/* ID Card specific information */}
        {card.type === 'id' && (
          <View style={styles.infoContainer}>
            {/* Student ID */}

            {/* Meal Plan or Department Info */}
            {(card.mealPlan || card.department) && (
              <View style={styles.mealPlanContainer}>
                <View style={styles.mealPlanRow}>
                  <View style={styles.mealPlanItem}>
                    <Text style={styles.mealPlanLabel}>
                      {card.department ? 'DEPARTMENT' : 'MEAL PLAN'}
                    </Text>
                    <Text style={styles.mealPlanValue}>
                      {card.department || card.mealPlan || 'N/A'}
                    </Text>
                  </View>
                  
                  {card.level && (
                    <View style={styles.mealPlanItem}>
                      <Text style={styles.mealPlanLabel}>LEVEL</Text>
                      <Text style={styles.balanceValue}>{card.level}</Text>
                    </View>
                  )}
                  
                  {card.mealsRemaining && (
                    <View style={styles.mealPlanItem}>
                      <Text style={styles.mealPlanLabel}>MEALS</Text>
                      <Text style={styles.mealPlanValue}>{card.mealsRemaining}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Expiry Date */}
            {card.expiry && (
              <View style={styles.expiryContainer}>
                <Text style={styles.expiryLabel}>VALID UNTIL</Text>
                <Text style={styles.expiryValue}>{card.expiry}</Text>
              </View>
            )}

            {/* QR Code for ID - Always visible */}
            {card.number && (
              <View style={styles.mainQrCodeContainer}>
                <View style={styles.mainQrCodeWrapper}>
                  <QRCode
                    value={card.number}
                    size={80}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                </View>
                <Text style={styles.mainQrCodeText}>ID: {card.number}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer with QR Code and 3-dot menu */}
        <View style={styles.footer}>
          <View style={styles.leftFooter}>
            <View style={styles.qrIndicator}>
              <Ionicons name="qr-code" size={20} color="#FFD700" />
            </View>
            <Text style={styles.scanText}>Scan for access</Text>
          </View>
          
          {/* 3-dot menu button */}
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleActions}
            activeOpacity={0.7}
          >
            <View style={styles.menuDots}>
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Expandable Actions and Details */}
        {actionsVisible && (
          <Animated.View 
            style={[
              styles.actionsPanel,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }],
                opacity: slideAnim,
              }
            ]}
          >
            {/* Action Buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={18} color="#FFD700" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={18} color="#0A84FF" />
                <Text style={[styles.actionText, { color: '#0A84FF' }]}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#FF2D55" />
                <Text style={[styles.actionText, { color: '#FF2D55' }]}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Card Details Section */}
            <View style={styles.cardDetails}>
              <Text style={styles.detailsTitle}>Card Details</Text>
              
              {/* Cardholder Name */}
              {card.holderName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cardholder</Text>
                  <Text style={styles.detailValue}>{card.holderName}</Text>
                </View>
              )}

              {/* Role */}
              {card.role && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Role</Text>
                  <Text style={styles.detailValue}>{card.role}</Text>
                </View>
              )}

              {/* Department */}
              {card.department && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>{card.department}</Text>
                </View>
              )}


              {/* Meal Plan */}
              {card.mealPlan && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Meal Plan</Text>
                  <Text style={styles.detailValue}>{card.mealPlan}</Text>
                </View>
              )}

              {/* Level */}
              {card.level && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Level</Text>
                  <Text style={styles.detailValue}>{card.level}</Text>
                </View>
              )}

              {/* Balance */}
              {card.balance && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Balance</Text>
                  <Text style={styles.detailValue}>${card.balance}</Text>
                </View>
              )}

              {/* Meals Remaining */}
              {card.mealsRemaining && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Meals Remaining</Text>
                  <Text style={styles.detailValue}>{card.mealsRemaining}</Text>
                </View>
              )}

              {/* Expiry Date */}
              {card.expiry && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expires</Text>
                  <Text style={styles.detailValue}>{card.expiry}</Text>
                </View>
              )}

              {/* Creation Date */}
              {card.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Added On</Text>
                  <Text style={styles.detailValue}>
                    {new Date(card.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Decorative elements */}
        <View style={styles.decorativeLine} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    minHeight: 320, // Minimum height, but can grow
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    width: '100%',
    flex: 1, // Use flex instead of fixed height
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 15, // Add bottom padding for content
    justifyContent: 'flex-start', // Align content to top
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 15,
    zIndex: 10,
  },
  institutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  institutionLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  logoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  institutionName: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  campusImageContainer: {
    height: 80,
    opacity: 0.4,
    marginTop: -10, // Overlap with header slightly
    marginBottom: 10,
  },
  campusImage: {
    width: '100%',
    height: '100%',
  },
  campusImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoContainer: {
    alignSelf: 'center',
    marginTop: -40, // Overlap with campus image
    zIndex: 5,
    marginBottom: 10,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  profilePhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: 15,
  },
  name: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  role: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  infoContainer: {
    paddingHorizontal: 15,
    zIndex: 10,
    flex: 1, // Take available space
  },
  idNumberContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  idLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 8,
    letterSpacing: 1,
  },
  idNumber: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  mealPlanContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  mealPlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mealPlanItem: {
    alignItems: 'center',
    flex: 1,
  },
  mealPlanLabel: {
    color: 'rgba(255, 215, 0, 0.8)',
    fontSize: 8,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  mealPlanValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expiryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  expiryLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 8,
    marginRight: 5,
  },
  expiryValue: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
  // Main QR Code (always visible)
  mainQrCodeContainer: {
    alignItems: 'center',
    marginTop: 15,
    zIndex: 10,
  },
  mainQrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 8,
    marginBottom: 5,
  },
  mainQrCodeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginTop: 'auto', // Push to bottom with flex
  },
  leftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 4,
    borderRadius: 6,
    marginRight: 5,
  },
  scanText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontStyle: 'italic',
  },
  decorativeLine: {
    height: 3,
    backgroundColor: '#FFD700',
    opacity: 0.3,
    marginTop: 5,
  },
  // 3-dot menu styles
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    zIndex: 10,
  },
  menuDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFD700',
    marginHorizontal: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  // Actions panel styles
  actionsPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    minWidth: 60,
  },
  actionText: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  // Card Details Section Styles
  cardDetails: {
    paddingTop: 5,
  },
  detailsTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default IDCardTemplate;