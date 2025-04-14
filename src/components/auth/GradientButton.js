// src/components/auth/GradientButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

const GradientButton = ({ 
  title, 
  onPress, 
  isLoading, 
  icon, 
  disabled, 
  style, 
  textStyle,
  iconPosition = 'right'
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientButton}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={20} color="#FFF" style={styles.iconLeft} />
            )}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={20} color="#FFF" style={styles.iconRight} />
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default GradientButton;