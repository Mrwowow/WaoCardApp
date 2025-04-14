// src/styles/theme.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  primary: '#FF9500',
  primaryDark: '#E08600',
  primaryLight: '#FFB649',
  primaryTransparent: 'rgba(255, 149, 0, 0.2)',
  primaryBorder: 'rgba(255, 149, 0, 0.3)',
  background: '#000000',
  backgroundLight: '#111111',
  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  inputBackground: 'rgba(255, 255, 255, 0.06)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  cardBackground: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  error: '#FF3B30',
  success: '#30D158',
  warning: '#FFD60A',
  infoBlue: '#0A84FF'
};

export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
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
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
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
