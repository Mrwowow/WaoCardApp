import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { getCategoryIcon } from '../utils/categoryUtils';

/**
 * Custom marker component for merchants on the map
 * @param {Object} props - Component props
 * @param {string} props.category - Merchant category
 * @param {boolean} props.acceptsWaoCard - Whether merchant accepts WaoCard
 * @param {boolean} props.isSelected - Whether marker is selected/active
 * @returns {JSX.Element}
 */
const MerchantMarker = ({ category, acceptsWaoCard = false, isSelected = false }) => {
  // Animation value for scaling effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Animate marker when selected state changes
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isSelected, scaleAnim]);

  // Get icon based on category
  const iconName = getCategoryIcon(category);
  
  // Background color based on whether merchant accepts WaoCard
  const backgroundColor = acceptsWaoCard ? colors.primary : '#999';

  return (
    <Animated.View 
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View 
        style={[
          styles.marker,
          { backgroundColor }
        ]}
      >
        <Ionicons 
          name={iconName} 
          size={16} 
          color="#FFF" 
        />
      </View>
      
      {/* Shadow/effect at bottom of marker */}
      <View style={styles.shadow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  selectedContainer: {
    zIndex: 1,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 3,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: -1,
  },
});

export default MerchantMarker;