import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../styles/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  buttons = [],
  onClose,
  showCloseButton = true,
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: colors.success };
      case 'error':
        return { icon: 'close-circle', color: colors.error };
      case 'warning':
        return { icon: 'warning', color: colors.warning };
      default:
        return { icon: 'information-circle', color: colors.primary };
    }
  };

  const { icon, color } = getIconAndColor();

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose) {
      onClose();
    }
  };

  const defaultButtons = buttons.length > 0 ? buttons : [
    {
      text: 'OK',
      style: 'default',
      onPress: () => {},
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.androidOverlay} />
        )}
        
        <View style={styles.alertContainer}>
          <LinearGradient
            colors={[colors.backgroundLight, colors.cardBackground]}
            style={styles.gradientBackground}
          >
          <View style={styles.alertContent}>
            {/* Close button */}
            {showCloseButton && (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            )}

            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={48} color={color} />
            </View>

            {/* Title */}
            {title && (
              <Text style={styles.title}>{title}</Text>
            )}

            {/* Message */}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {defaultButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    button.style === 'destructive' && styles.destructiveButton,
                    defaultButtons.length === 1 && styles.singleButton,
                    index === 0 && defaultButtons.length > 1 && styles.firstButton,
                    index === defaultButtons.length - 1 && defaultButtons.length > 1 && styles.lastButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  androidOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  alertContainer: {
    width: screenWidth - spacing.xl * 2,
    maxWidth: 320,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradientBackground: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  alertContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleButton: {
    borderRadius: borderRadius.md,
  },
  firstButton: {
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
    marginRight: 1,
  },
  lastButton: {
    borderTopRightRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.white,
  },
  cancelButtonText: {
    color: colors.textPrimary,
  },
  destructiveButtonText: {
    color: colors.white,
  },
});

export default CustomAlert;