// Update for your CardsScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the navigation service
import NavigationService from '../services/NavigationService';

import { colors, fonts } from '../styles/theme';
import CardListItem from '../components/cards/CardListItem';
import CardDetailsModal from '../components/cards/CardDetailsModal';
import EmptyCardState from '../components/cards/EmptyCardState';
import CardTypeFilter from '../components/cards/CardTypeFilter';
import { saveCards } from '../utils/storageUtils';
import { generateDummyCards } from '../utils/cardUtils';

const { width, height } = Dimensions.get('window');

const CardsScreen = ({ navigation, route }) => {
  // Check if we have a new card from AddCardScreen
  useEffect(() => {
    if (route.params?.newCard) {
      // Add the new card with id and timestamp
      const cardToAdd = {
        ...route.params.newCard,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      handleAddCard(cardToAdd);
    }
  }, [route.params?.newCard]);
  
  useEffect(() => {
    // Clear the params after handling
    navigation.setParams({ newCard: null });
  }, []);

    // State for cards and UI
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardType, setSelectedCardType] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

  // Card type filters
  const cardTypes = [
    { id: 'all', name: 'All Cards', icon: 'albums-outline' },
    { id: 'payment', name: 'Payment', icon: 'card-outline' },
    { id: 'loyalty', name: 'Loyalty', icon: 'ribbon-outline' },
    { id: 'id', name: 'ID', icon: 'id-card-outline' },
    { id: 'ticket', name: 'Tickets', icon: 'ticket-outline' },
    { id: 'gift', name: 'Gift Cards', icon: 'gift-outline' },
    { id: 'business', name: 'Business', icon: 'briefcase-outline' },
  ];

  // Load cards from storage when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadCards();
      return () => {};
    }, [])
  );

  // Add button animation on press
  const animateAddButton = () => {
    console.log("[CardsScreen] animateAddButton called");
    
    // Perform the animation
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log("[CardsScreen] Animation completed, attempting navigation");
      
      // Use NavigationService for global navigation
      // This bypasses nested navigator issues
      try {
        const filteredCardTypes = cardTypes.filter(type => type.id !== 'all');
        console.log("[CardsScreen] Using NavigationService to navigate to AddCard");
        NavigationService.navigateToAddCard(filteredCardTypes);
      } catch (error) {
        console.error("[CardsScreen] Navigation error:", error);
        Alert.alert(
          "Navigation Error",
          "Could not navigate to Add Card screen. Please try again."
        );
      }
    });
  };

  // Load cards from storage
  const loadCards = async () => {
    setIsLoading(true);
    try {
      // First try to get cards from storage
      const storedCards = await AsyncStorage.getItem('waocard_cards');
      
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      } else {
        // If no cards exist, use dummy data for first-time users
        const dummyCards = generateDummyCards();
        setCards(dummyCards);
        // Save dummy cards to storage
        await AsyncStorage.setItem('waocard_cards', JSON.stringify(dummyCards));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load your cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new card
  const handleAddCard = async (newCard) => {
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    await saveCards(updatedCards);
  };

  // Delete a card
  const handleDeleteCard = async (cardId) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedCards = cards.filter(card => card.id !== cardId);
            setCards(updatedCards);
            await saveCards(updatedCards);
            setShowCardDetails(false);
          },
        },
      ]
    );
  };

  // View card details
  const handleCardPress = (card) => {
    setSelectedCard(card);
    setShowCardDetails(true);
  };

  // Filter cards by type
  const filteredCards = selectedCardType === 'all'
    ? cards
    : cards.filter(card => card.type === selectedCardType);

  // Header animation on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Render card item
  const renderCardItem = ({ item }) => (
    <CardListItem 
      card={item}
      onPress={() => handleCardPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ImageBackground
        source={require('../../assets/images/gradient-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Animated Header */}
        <Animated.View style={[
          styles.headerBackground,
          { opacity: headerOpacity }
        ]}>
          <BlurView intensity={30} tint="dark" style={styles.headerBlur} />
        </Animated.View>

        {/* Header Content */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cards</Text>
          <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={animateAddButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF9500', '#E08600']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={28} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Card Type Filters */}
        <CardTypeFilter
          cardTypes={cardTypes}
          selectedType={selectedCardType}
          onSelectType={setSelectedCardType}
        />

        {/* Cards List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="card" size={40} color="#FF9500" />
            <Text style={styles.loadingText}>Loading your cards...</Text>
          </View>
        ) : filteredCards.length === 0 ? (
          <EmptyCardState 
            cardType={selectedCardType} 
            onAddCard={animateAddButton}
          />
        ) : (
          <Animated.FlatList
            data={filteredCards}
            renderItem={renderCardItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cardsList}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />
        )}

        {/* Card Details Modal */}
        {selectedCard && (
          <CardDetailsModal
            visible={showCardDetails}
            card={selectedCard}
            onClose={() => setShowCardDetails(false)}
            onDelete={() => handleDeleteCard(selectedCard.id)}
          />
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 15,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 15,
    fontSize: 16,
  },
});

// Update for your NavigationService.js

import { NavigationContainerRef } from '@react-navigation/native';

let navigator;

const setTopLevelNavigator = (navigatorRef) => {
  navigator = navigatorRef;
};

export default CardsScreen;