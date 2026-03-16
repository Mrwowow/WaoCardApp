// src/styles/theme.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  primary: '#FF9500',
  primaryDark: '#E08600',
  primaryLight: '#FFB649',
  primaryTransparent: 'rgba(255, 149, 0, 0.2)',
  primaryBorder: 'rgba(255, 149, 0, 0.3)',
  background: 'rgb(255, 248, 240)',
  backgroundLight: 'rgb(255, 252, 248)',
  white: '#1a1a1a',
  textPrimary: '#1a1a1a',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  textTertiary: 'rgba(0, 0, 0, 0.4)',
  inputBackground: 'rgba(0, 0, 0, 0.04)',
  inputBorder: 'rgba(0, 0, 0, 0.1)',
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  error: '#FF3B30',
  success: '#30D158',
  warning: '#FFD60A',
  infoBlue: '#0A84FF',
  black: '#000000',
  border: 'rgba(0, 0, 0, 0.1)'
};

export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  sizes: {
    xs: 12,
    small: 14,
    medium: 16,
    large: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    jumbo: 32,
    title: 36
  }
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  md: 16,
  l: 24,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

export const borderRadius = {
  small: 8,
  medium: 12,
  md: 12,
  large: 16,
  lg: 16,
  xl: 20,
  xxl: 28
};

export const shadows = {
  small: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  medium: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  large: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10
  }
};

// Screen dimensions for responsive design
export const screenDimensions = {
  width,
  height
};

// Common styles that can be reused across the app
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.l,
  }
};
