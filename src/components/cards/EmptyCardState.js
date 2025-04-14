import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const EmptyCardState = ({ cardType, onAddCard }) => {
  // Get navigation object directly using the hook
  const navigation = useNavigation();
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
          onPress={() => {
            if (onAddCard) {
              // Use the provided onAddCard function if available
              onAddCard();
            } else if (navigation) {
              // Navigate to AddCardScreen with appropriate params
              navigation.navigate('AddCard', {
                cardTypes: [
                  { id: 'payment', name: 'Payment', icon: 'card-outline' },
                  { id: 'loyalty', name: 'Loyalty', icon: 'ribbon-outline' },
                  { id: 'id', name: 'ID', icon: 'id-card-outline' },
                  { id: 'ticket', name: 'Tickets', icon: 'ticket-outline' },
                  { id: 'gift', name: 'Gift Cards', icon: 'gift-outline' },
                  { id: 'business', name: 'Business', icon: 'briefcase-outline' },
                ]
              });
            }
          }}
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