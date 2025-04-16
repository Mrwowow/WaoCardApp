import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Import NavigationService for global navigation
import NavigationService from '../../services/NavigationService';

const { height } = Dimensions.get('window');

const EmptyCardState = ({ cardType, onAddCard }) => {
  // Get navigation object directly using the hook
  const navigation = useNavigation();
  
  // Make sure we have a valid navigation object
  useEffect(() => {
    if (!navigation) {
      console.warn('Navigation object not available in EmptyCardState');
    }
  }, [navigation]);

  // Get message based on selected card type
  const getMessage = () => {
    switch (cardType) {
      case 'payment':
        return 'Add your credit, debit or prepaid cards to make contactless payments';
      case 'loyalty':
        return 'Store your loyalty cards in one place and never miss rewards';
      case 'id':
        return 'Keep your ID cards and memberships in your digital wallet';
      case 'ticket':
        return 'Save your event tickets and passes for easy access';
      case 'gift':
        return 'Store gift cards and track your balances';
      case 'business':
        return 'Manage your business cards and corporate identities';
      default:
        return 'Add your first card to get started with your digital wallet';
    }
  };

  const getIcon = () => {
    switch (cardType) {
      case 'payment':
        return 'card';
      case 'loyalty':
        return 'ribbon';
      case 'id':
        return 'id-card';
      case 'ticket':
        return 'ticket';
      case 'gift':
        return 'gift';
      case 'business':
        return 'briefcase';
      default:
        return 'albums';
    }
  };

  // Button press handler 
  const handleAddCardPress = () => {
    console.log("[EmptyCardState] Add card button pressed");
    
    // 1. First, try using the provided callback
    if (onAddCard && typeof onAddCard === 'function') {
      console.log("[EmptyCardState] Using provided onAddCard callback");
      onAddCard();
      return;
    }
    
    // 2. If no callback, use NavigationService as a fallback
    console.log("[EmptyCardState] Using NavigationService as fallback");
    
    // Get card types data
    const cardTypeData = [
      { id: 'payment', name: 'Payment', icon: 'card-outline' },
      { id: 'loyalty', name: 'Loyalty', icon: 'ribbon-outline' },
      { id: 'id', name: 'ID', icon: 'id-card-outline' },
      { id: 'ticket', name: 'Tickets', icon: 'ticket-outline' },
      { id: 'gift', name: 'Gift Cards', icon: 'gift-outline' },
      { id: 'business', name: 'Business', icon: 'briefcase-outline' },
    ];
    
    try {
      NavigationService.navigateToAddCard(cardTypeData);
    } catch (error) {
      console.error("[EmptyCardState] Navigation service error:", error);
      
      // 3. If NavigationService fails, try direct navigation as last resort
      try {
        navigation.navigate('AddCard', { cardTypes: cardTypeData });
      } catch (navError) {
        console.error("[EmptyCardState] All navigation attempts failed:", navError);
        Alert.alert(
          "Navigation Error",
          "Could not navigate to Add Card screen. Please try again."
        );
      }
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(255, 149, 0, 0.2)', 'rgba(224, 134, 0, 0.2)']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={getIcon()} size={50} color="#FF9500" />
          </LinearGradient>
        </View>
        
        <Text style={styles.title}>No Cards Found</Text>
        <Text style={styles.message}>{getMessage()}</Text>
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddCardPress}
        >
          <LinearGradient
            colors={['#FF9500', '#E08600']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Add Your First Card</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="qr-code" size={16} color="#FF9500" />
            <Text style={styles.tipText}>Scan a QR code to quickly add a card</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="camera" size={16} color="#FF9500" />
            <Text style={styles.tipText}>Use camera to capture card details</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="wifi" size={16} color="#FF9500" />
            <Text style={styles.tipText}>Tap NFC cards to read contactless data</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    minHeight: height * 0.7,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    marginBottom: 50,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  addButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 30,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 10,
  },
});

export default EmptyCardState;