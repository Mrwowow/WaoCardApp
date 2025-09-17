// Update for your CardsScreen.js

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the navigation service
import NavigationService from '../services/NavigationService';

import { colors, fonts } from '../styles/theme';
import CardListItem from '../components/cards/CardListItem';
import CardStack from '../components/cards/CardStack';
import CardDetailsModal from '../components/cards/CardDetailsModal';
import EmptyCardState from '../components/cards/EmptyCardState';
import CardTypeFilter from '../components/cards/CardTypeFilter';
import { saveCards, STORAGE_KEYS } from '../utils/storageUtils';
import { generateDummyCards, loadCardsFromStorage } from '../utils/cardUtils';

const { width, height } = Dimensions.get('window');

const CardsScreen = ({ navigation, route }) => {
  console.log('[CardsScreen] Initial render');
  const insets = useSafeAreaInsets();

  // State for cards and UI
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [viewMode, setViewMode] = useState('stack'); // 'list' or 'stack'
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

  // Load cards from storage
  const loadCards = async (forceRefresh = false) => {
    console.log('[CardsScreen] loadCards called, forceRefresh:', forceRefresh);
    
    // Set loading state
    if (!forceRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      console.log('[CardsScreen] Loading cards from storage', forceRefresh ? '(forced refresh)' : '');
      // Use helper function to load cards
      const storedCards = await loadCardsFromStorage();
      
      if (storedCards && storedCards.length > 0) {
        console.log('[CardsScreen] Loaded', storedCards.length, 'cards from storage');
        setCards(storedCards);
      } else {
        console.log('[CardsScreen] No cards found, generating dummy cards');
        // If no cards exist, use dummy data for first-time users
        const dummyCards = generateDummyCards();
        console.log('[CardsScreen] Generated', dummyCards.length, 'dummy cards');
        
        // Update state with dummy cards
        setCards(dummyCards);
        
        // Save dummy cards to storage
        try {
          await saveCards(dummyCards);
          console.log('[CardsScreen] Saved', dummyCards.length, 'dummy cards to storage');
        } catch (saveError) {
          console.error('[CardsScreen] Error saving dummy cards:', saveError);
        }
      }
    } catch (error) {
      console.error('[CardsScreen] Error loading cards:', error);
      Alert.alert('Error', 'Failed to load your cards. Please try again.');
    } finally {
      // Always make sure to reset loading states
      console.log('[CardsScreen] Resetting loading states');
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh
  const handleRefresh = () => {
    console.log('[CardsScreen] Manual refresh triggered');
    loadCards(true);
  };
  
  // Add a new card
  const handleAddCard = async (newCard) => {
    console.log('[CardsScreen] Adding new card:', newCard?.name);
    try {
      // Get the current cards from storage to ensure we have the latest data
      const currentCards = await loadCardsFromStorage();
      console.log('[CardsScreen] Current cards in storage:', currentCards.length);
      
      // Add new card to the array
      const updatedCards = [...currentCards, newCard];
      console.log('[CardsScreen] New total cards:', updatedCards.length);
      
      // Update state - Force render after setting cards
      setCards([...updatedCards]);
      
      // Save to storage
      await saveCards(updatedCards);
      console.log('[CardsScreen] Card added successfully, saved total:', updatedCards.length);
      
      // Force refresh after adding
      setIsLoading(false);
    } catch (error) {
      console.error('[CardsScreen] Error adding card:', error);
      Alert.alert('Error', 'Failed to add your card. Please try again.');
    }
  };
  
  // Initial load
  useLayoutEffect(() => {
    console.log('[CardsScreen] Initial layout effect, triggering first load');
    loadCards();
  }, []);
  
  // Check if we have a new or updated card from AddCardScreen
  useEffect(() => {
    const handleNewCard = async () => {
      if (route.params?.newCard) {
        console.log('[CardsScreen] New card received from params:', route.params.newCard);
        
        // Add the new card with id and timestamp
        const cardToAdd = {
          ...route.params.newCard,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        try {
          // Add the new card - handleAddCard will load latest cards from storage
          handleAddCard(cardToAdd);
        } catch (error) {
          console.error('[CardsScreen] Error processing new card:', error);
        }
      }
    };

    const handleUpdatedCard = async () => {
      if (route.params?.updatedCard) {
        console.log('[CardsScreen] Updated card received from params:', route.params.updatedCard);
        
        try {
          // Get current cards from storage
          const currentCards = await loadCardsFromStorage();
          
          // Find and replace the updated card
          const updatedCards = currentCards.map(card => 
            card.id === route.params.updatedCard.id 
              ? route.params.updatedCard 
              : card
          );
          
          // Update state and storage
          setCards(updatedCards);
          await saveCards(updatedCards);
          
          console.log('[CardsScreen] Card updated successfully');
        } catch (error) {
          console.error('[CardsScreen] Error processing updated card:', error);
        }
      }
    };
    
    handleNewCard();
    handleUpdatedCard();

    // Handle showing modal after update
    if (route.params?.showModal && route.params?.updatedCard) {
      // Wait for the card to be processed, then show the modal
      setTimeout(() => {
        const updatedCard = route.params.updatedCard;
        setSelectedCard(updatedCard);
        setShowCardDetails(true);
      }, 500);
    }
  }, [route.params?.newCard, route.params?.updatedCard, route.params?.showModal]);
  
  useEffect(() => {
    // Clear params if newCard or updatedCard exists and after they've been processed
    if (route.params?.newCard || route.params?.updatedCard || route.params?.showModal) {
      console.log('[CardsScreen] Scheduling to clear params after processing');
      
      // Use a longer timeout to ensure the card is fully processed
      const timer = setTimeout(() => {
        console.log('[CardsScreen] Clearing route params');
        navigation.setParams({ 
          newCard: null,
          updatedCard: null,
          showModal: null,
          timestamp: null
        });
      }, 1000); // Increased timeout to ensure card is processed
      
      return () => {
        console.log('[CardsScreen] Clearing timeout for params reset');
        clearTimeout(timer);
      };
    }
  }, [route.params?.newCard, route.params?.updatedCard, route.params?.showModal, route.params?.timestamp]);

  // Card type filters
  const cardTypes = [
    { id: 'all', name: 'All Cards', icon: 'albums-outline' },
    { id: 'payment', name: 'Payment', icon: 'card-outline' },
    { id: 'loyalty', name: 'Loyalty', icon: 'ribbon-outline' },
    { id: 'store', name: 'Store Cards', icon: 'storefront-outline' },
    { id: 'id', name: 'ID', icon: 'id-card-outline' },
    { id: 'ticket', name: 'Tickets', icon: 'ticket-outline' },
    { id: 'gift', name: 'Gift Cards', icon: 'gift-outline' },
    { id: 'business', name: 'Business', icon: 'briefcase-outline' },
  ];

  // Load cards from storage when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('[CardsScreen] Screen focused, loading cards');
      loadCards();
      
      // Clean up function
      return () => {
        console.log('[CardsScreen] Screen unfocused');
      };
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
      
      try {
        const filteredCardTypes = cardTypes.filter(type => type.id !== 'all');
        console.log("[CardsScreen] Navigating to AddCard screen");
        // AddCard is at the root level of the MainNavigator
        navigation.navigate('AddCard', { cardTypes: filteredCardTypes });
      } catch (error) {
        console.error("[CardsScreen] Navigation error:", error);
        Alert.alert(
          "Navigation Error",
          "Could not navigate to Add Card screen. Please try again."
        );
      }
    });
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
            try {
              console.log('[CardsScreen] Deleting card with ID:', cardId);
              
              // Get the latest cards from storage
              const currentCards = await loadCardsFromStorage();
              
              // Filter out the card to delete
              const updatedCards = currentCards.filter(card => card.id !== cardId);
              console.log('[CardsScreen] Cards after deletion:', updatedCards.length);
              
              // Update state
              setCards(updatedCards);
              
              // Save to storage
              await saveCards(updatedCards);
              console.log('[CardsScreen] Updated storage after deletion');
              
              // Close the details modal
              setShowCardDetails(false);
            } catch (error) {
              console.error('[CardsScreen] Error deleting card:', error);
              Alert.alert('Error', 'Failed to delete card. Please try again.');
            }
          },
        },
      ]
    );
  };

  // View card details
  const handleCardPress = React.useCallback((card) => {
    setSelectedCard(card);
    setShowCardDetails(true);
  }, []);

  // Filter cards by type and sort by most recent first
  const filteredCards = React.useMemo(() => {
    console.log('[CardsScreen] Filtering cards, type:', selectedCardType, 'total cards:', cards?.length || 0);
    if (!cards || cards.length === 0) return [];
    
    const filtered = selectedCardType === 'all'
      ? cards
      : cards.filter(card => card.type === selectedCardType);
    
    // Sort by createdAt date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Most recent first
    });
  }, [cards, selectedCardType]);

  // Header animation on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Render card item
  const renderCardItem = React.useCallback(({ item }) => (
    <CardListItem 
      card={item}
      onPress={() => handleCardPress(item)}
    />
  ), [handleCardPress]);

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
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.headerTitle}>My Cards</Text>
          <View style={styles.headerActions}>
            {/* View mode toggle */}
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'stack' ? 'list' : 'stack')}
              onLongPress={() => {
                if (viewMode === 'stack') {
                  // Cycle through card types in stack view
                  const currentIndex = cardTypes.findIndex(type => type.id === selectedCardType);
                  const nextIndex = (currentIndex + 1) % cardTypes.length;
                  setSelectedCardType(cardTypes[nextIndex].id);
                }
              }}
            >
              <Ionicons
                name={viewMode === 'stack' ? 'list-outline' : 'layers-outline'}
                size={24}
                color="#FFF"
              />
            </TouchableOpacity>
            
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
        </View>

        {/* Card Type Filters - Only show for list view */}
        {viewMode === 'list' && (
          <CardTypeFilter
            cardTypes={cardTypes}
            selectedType={selectedCardType}
            onSelectType={setSelectedCardType}
          />
        )}

        {/* Stack view filter indicator */}
        {viewMode === 'stack' && selectedCardType !== 'all' && (
          <View style={styles.stackFilterIndicator}>
            <Text style={styles.stackFilterText}>
              {cardTypes.find(type => type.id === selectedCardType)?.name || 'All Cards'}
            </Text>
          </View>
        )}

        {/* Cards Display */}
        <View style={viewMode === 'stack' ? styles.stackViewContainer : styles.listViewContainer}>
          {(() => {
            console.log('[CardsScreen] Render state:', { 
              isLoading, 
              cardsLength: cards.length, 
              filteredCardsLength: filteredCards?.length || 0,
              viewMode
            });
            
            if (isLoading) {
              return (
                <View style={styles.loadingContainer}>
                  <Ionicons name="card" size={40} color="#FF9500" />
                  <Text style={styles.loadingText}>Loading your cards...</Text>
                </View>
              );
            } else if (!filteredCards || filteredCards.length === 0) {
              return (
                <EmptyCardState 
                  cardType={selectedCardType} 
                  onAddCard={animateAddButton}
                />
              );
            } else if (viewMode === 'stack') {
              return (
                <CardStack
                  cards={filteredCards}
                  onCardPress={handleCardPress}
                  selectedCardType={selectedCardType}
                />
              );
            } else {
              return (
                <Animated.FlatList
                  data={filteredCards}
                  renderItem={renderCardItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={[
                    styles.cardsList,
                    { paddingBottom: 75 + insets.bottom + 10 } // Tab bar height + safe area + extra padding
                  ]}
                  showsVerticalScrollIndicator={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              );
            }
          })()}
        </View>

        {/* Card Details Modal */}
        {selectedCard && (
          <CardDetailsModal
            visible={showCardDetails}
            card={selectedCard}
            onClose={() => setShowCardDetails(false)}
            onDelete={() => handleDeleteCard(selectedCard.id)}
            navigation={navigation}
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
    paddingBottom: 15,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  stackFilterIndicator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 5, // Reduced from 10 to bring filter closer to cards
    marginTop: 5, // Small top margin for spacing from header
  },
  stackFilterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stackViewContainer: {
    flex: 1,
    paddingTop: 0, // Remove top padding to position stack at very top
    marginTop: -10, // Negative margin to bring stack closer to header
  },
  listViewContainer: {
    flex: 1,
  },
  cardsList: {
    paddingHorizontal: 20,
    // paddingBottom will be calculated dynamically in component
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

export default CardsScreen;