import React from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../styles/theme';

/**
 * Floating action button component with animation support
 * @param {Object} props - Component props
 * @param {string} props.iconName - Ionicons icon name
 * @param {function} props.onPress - Button press handler
 * @param {string} props.position - Button position ('bottomRight', 'bottomLeft', 'topRight', 'topLeft')
 * @param {Object} props.style - Additional styles for the button
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {number} props.size - Button size in pixels (default: 50)
 * @param {number} props.iconSize - Icon size in pixels (default: 24)
 * @returns {JSX.Element}
 */
const FloatingActionButton = ({ 
  iconName, 
  onPress, 
  position = 'bottomRight', 
  style, 
  disabled = false,
  size = 50,
  iconSize = 24
}) => {
  // Get position styles based on position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'bottomRight':
        return { bottom: 30, right: 20 };
      case 'bottomLeft':
        return { bottom: 30, left: 20 };
      case 'topRight':
        return { top: 30, right: 20 };
      case 'topLeft':
        return { top: 30, left: 20 };
      default:
        return { bottom: 30, right: 20 };
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { width: size, height: size, borderRadius: size / 2 },
        getPositionStyles(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={iconName} 
        size={iconSize} 
        color={disabled ? colors.textTertiary : colors.primary} 
      />
    </TouchableOpacity>
  );
};

/**
 * Floating action button with scale animation on press
 */
export const AnimatedFloatingActionButton = ({ 
  iconName, 
  onPress, 
  position = 'bottomRight', 
  style, 
  disabled = false,
  size = 50,
  iconSize = 24
}) => {
  // Animation value for scale effect
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Handle button press with animation
  const handlePress = () => {
    // Animate button scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Call the provided onPress handler
    onPress();
  };

  // Get position styles based on position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'bottomRight':
        return { bottom: 30, right: 20 };
      case 'bottomLeft':
        return { bottom: 30, left: 20 };
      case 'topRight':
        return { top: 30, right: 20 };
      case 'topLeft':
        return { top: 30, left: 20 };
      default:
        return { bottom: 30, right: 20 };
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        getPositionStyles(),
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.button, 
          { width: size, height: size, borderRadius: size / 2 },
          disabled && styles.disabled,
          style
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={iconName} 
          size={iconSize} 
          color={disabled ? colors.textTertiary : colors.primary} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default FloatingActionButton;