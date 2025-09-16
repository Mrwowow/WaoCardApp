import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import CardStackItem from './CardStackItem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CardStack = ({ cards, onCardPress, selectedCardType }) => {
  const [expandedIndex, setExpandedIndex] = useState(0); // Start expanded with first card selected
  const animatedValues = useRef({}).current;
  const panRefs = useRef({}).current;

  // Initialize animated values for each card
  useEffect(() => {
    cards.forEach((card, index) => {
      if (!animatedValues[card.id]) {
        animatedValues[card.id] = {
          translateY: new Animated.Value(1), // Start in expanded state
          scale: new Animated.Value(1),
          opacity: new Animated.Value(1),
        };
      }
    });
  }, [cards]);

  // Calculate card positions - Apple Wallet style
  const getCardStyle = (index, isExpanded) => {
    const cardId = cards[index]?.id;
    if (!cardId || !animatedValues[cardId]) return {};

    // Apple Wallet style: cards fan out from the top
    const reverseIndex = cards.length - 1 - index;
    
    // In collapsed state: show only top edge of cards below
    const baseOffset = reverseIndex * 12; // Reduced spacing for tighter stack
    
    // In expanded state: full spacing for all cards
    const expandedOffset = index * (screenHeight * 0.12); // More spacing when expanded
    
    // Apple Wallet scaling effect
    const baseScale = 1 - (reverseIndex * 0.02); // Subtle scale reduction
    const expandedScale = 1;

    return {
      transform: [
        {
          translateY: animatedValues[cardId].translateY.interpolate({
            inputRange: [0, 1],
            outputRange: [baseOffset, expandedOffset],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: animatedValues[cardId].scale.interpolate({
            inputRange: [0, 1],
            outputRange: [baseScale, expandedScale],
            extrapolate: 'clamp',
          }),
        },
      ],
      opacity: animatedValues[cardId].opacity.interpolate({
        inputRange: [0, 1],
        outputRange: [isExpanded ? 1 : (reverseIndex < 3 ? 1 : 0.8), 1], // Fade cards further back
        extrapolate: 'clamp',
      }),
      zIndex: cards.length - reverseIndex, // Top card has highest z-index
    };
  };

  // Handle card tap - improved for stacked arrangement
  const handleCardTap = (index) => {
    const card = cards[index];
    
    if (expandedIndex === null) {
      // If stack is collapsed, expand it
      expandStack();
    } else if (expandedIndex === index) {
      // If tapped card is already selected, open details
      onCardPress(card);
    } else {
      // If different card is tapped, select it and bring to front
      setExpandedIndex(index);
      // Optionally scroll to show the selected card
    }
  };

  // Expand the stack - Apple Wallet style
  const expandStack = () => {
    setExpandedIndex(0); // Select first card by default
    
    cards.forEach((card, index) => {
      if (animatedValues[card.id]) {
        // Stagger animations for smooth cascade effect
        const delay = index * 50; // 50ms delay between cards
        
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(animatedValues[card.id].translateY, {
              toValue: 1,
              useNativeDriver: true,
              tension: 120,
              friction: 9,
              overshootClamping: false,
            }),
            Animated.spring(animatedValues[card.id].scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 120,
              friction: 9,
            }),
            Animated.spring(animatedValues[card.id].opacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 120,
              friction: 9,
            }),
          ]).start();
        }, delay);
      }
    });
  };

  // Collapse the stack - Apple Wallet style
  const collapseStack = () => {
    setExpandedIndex(null);
    
    cards.forEach((card, index) => {
      if (animatedValues[card.id]) {
        // Reverse stagger for smooth collapse
        const delay = (cards.length - index - 1) * 30; // Collapse from back to front
        
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(animatedValues[card.id].translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 140,
              friction: 10,
            }),
            Animated.spring(animatedValues[card.id].scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 140,
              friction: 10,
            }),
            Animated.spring(animatedValues[card.id].opacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 140,
              friction: 10,
            }),
          ]).start();
        }, delay);
      }
    });
  };

  // Handle pan gesture - Apple Wallet style
  const handlePanGesture = (event, cardIndex) => {
    const { translationY, velocityY, state } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      // Apple Wallet style: only allow top card to be dragged when collapsed
      if (expandedIndex === null && cardIndex !== 0) {
        return; // Only top card responds to gestures when collapsed
      }
      
      // Update card position during drag
      const cardId = cards[cardIndex]?.id;
      if (animatedValues[cardId]) {
        if (expandedIndex === null) {
          // In collapsed state: gentle preview of expansion
          animatedValues[cardId].translateY.setValue(Math.max(0, translationY * 0.2));
        } else {
          // In expanded state: allow scrolling through cards
          const currentValue = 1 + translationY * 0.002;
          animatedValues[cardId].translateY.setValue(Math.max(0, Math.min(1, currentValue)));
        }
      }
    } else if (state === State.END) {
      // Determine action based on gesture with Apple Wallet thresholds
      if (expandedIndex === null) {
        // Stack is collapsed - only respond to upward swipe on top card
        if (cardIndex === 0 && (translationY < -20 || velocityY < -200)) {
          expandStack();
        } else {
          // Snap back to collapsed position with smooth animation
          const cardId = cards[cardIndex]?.id;
          if (animatedValues[cardId]) {
            Animated.spring(animatedValues[cardId].translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 150,
              friction: 8,
            }).start();
          }
        }
      } else {
        // Stack is expanded
        if (translationY > 50 || velocityY > 400) {
          // Downward gesture to collapse
          collapseStack();
        } else if (translationY < -50 || velocityY < -400) {
          // Upward gesture - could trigger card selection or details
          handleCardTap(cardIndex);
        } else {
          // Snap back to expanded position
          const cardId = cards[cardIndex]?.id;
          if (animatedValues[cardId]) {
            Animated.spring(animatedValues[cardId].translateY, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 8,
            }).start();
          }
        }
      }
    }
  };

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.stackContainer}>
        {cards.slice().reverse().map((card, reverseIndex) => {
          const index = cards.length - 1 - reverseIndex;
          const cardId = card.id;
          const isSelected = expandedIndex === index;
          const isExpanded = expandedIndex !== null;

          return (
            <PanGestureHandler
              key={cardId}
              onGestureEvent={(event) => handlePanGesture(event, index)}
              onHandlerStateChange={(event) => handlePanGesture(event, index)}
              ref={(ref) => {
                if (ref) panRefs[cardId] = ref;
              }}
            >
              <Animated.View
                style={[
                  styles.cardWrapper,
                  getCardStyle(index, isExpanded),
                  isSelected && styles.selectedCard,
                ]}
              >
                <CardStackItem
                  card={card}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  onPress={() => handleCardTap(index)}
                />
              </Animated.View>
            </PanGestureHandler>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0, // Remove top padding to position stack at very top
  },
  stackContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0, // Remove padding to position cards at absolute top
    minHeight: screenHeight * 0.7, // Increased height to accommodate stacked cards
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
