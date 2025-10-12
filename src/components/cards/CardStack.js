import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardStackItem from './CardStackItem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CardStack = ({ cards, onCardPress, selectedCardType, onRefresh, refreshing }) => {
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState(0); // Track selected card

  // Calculate card positions - always expanded
  const getCardStyle = (index) => {
    // Cards fan out from the top with fixed positions
    const reverseIndex = cards.length - 1 - index;
    const translateY = index * (screenHeight * 0.12);

    return {
      transform: [
        {
          translateY: translateY,
        },
      ],
      zIndex: cards.length - reverseIndex, // Top card has highest z-index
    };
  };

  // Handle card tap - single tap opens the card
  const handleCardTap = (index) => {
    const card = cards[index];
    setSelectedIndex(index);
    onCardPress(card);
  };


  if (!cards || cards.length === 0) {
    return null;
  }

  // Calculate total height needed for all cards
  const totalHeight = cards.length * (screenHeight * 0.12) + 200; // 200 is card height

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.bottom + 75 + 10,
          minHeight: screenHeight - 200, // Ensure minimum height for scrolling
        }
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={onRefresh}
          tintColor="#FF9500"
          colors={['#FF9500']}
        />
      }
    >
      <View style={[styles.stackContainer, { height: totalHeight }]}>
        {cards.map((card, index) => {
          const isSelected = selectedIndex === index;

          return (
            <View
              key={card.id}
              style={[
                styles.cardWrapper,
                getCardStyle(index),
                isSelected && styles.selectedCard,
              ]}
            >
              <CardStackItem
                card={card}
                isSelected={isSelected}
                isExpanded={true}
                onPress={() => handleCardTap(index)}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stackContainer: {
    position: 'relative',
    width: '100%',
  },
  cardWrapper: {
    position: 'absolute',
    width: screenWidth - 40,
    height: 200,
    borderRadius: 16,
    // Apple Wallet style shadows
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // Subtle border for depth
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCard: {
    // Enhanced shadow for selected card
    shadowColor: '#007AFF', // Apple blue
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    // Subtle glow effect
    borderColor: 'rgba(0, 122, 255, 0.3)',
    borderWidth: 1,
  },
});

export default CardStack;
