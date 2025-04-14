import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * Modern and reusable confirmation modal component
 * @param {boolean} visible - Whether the modal is visible
 * @param {string} title - Title of the confirmation dialog
 * @param {string} message - Message/question to be displayed
 * @param {string} confirmText - Text for the confirm button
 * @param {string} cancelText - Text for the cancel button
 * @param {function} onConfirm - Function to call when confirm is pressed
 * @param {function} onCancel - Function to call when cancel is pressed
 * @param {string} type - Type of confirmation ('default', 'danger', 'warning', 'success')
 * @param {string} icon - Ionicons name for the icon
 * @param {boolean} hideCancel - Whether to hide the cancel button
 * @param {boolean} closeOnTouchOutside - Whether to close when clicking outside
 */
const ConfirmationModal = ({
  visible = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'default',
  icon,
  hideCancel = false,
  closeOnTouchOutside = true,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Get configuration based on type
  const getTypeConfig = () => {
    const types = {
      default: {
        iconName: icon || 'help-circle',
        iconColor: '#FF9500',
        gradientColors: ['#FF9500', '#FF6347'],
      },
      danger: {
        iconName: icon || 'alert-circle',
        iconColor: '#FF3B30',
        gradientColors: ['#FF3B30', '#FF0000'],
      },
      warning: {
        iconName: icon || 'warning',
        iconColor: '#FFCC00',
        gradientColors: ['#FFCC00', '#FF9500'],
      },
      success: {
        iconName: icon || 'checkmark-circle',
        iconColor: '#34C759',
        gradientColors: ['#34C759', '#00A550'],
      },
    };
    
    return types[type] || types.default;
  };
  
  const typeConfig = getTypeConfig();
  
  // Run animations when visibility changes
  useEffect(() => {
    if (visible) {
      // Show animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Hide animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);
  
  // Handle touch outside
  const handleOutsideTouch = () => {
    if (closeOnTouchOutside && onCancel) {
      onCancel();
    }
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      
      <TouchableWithoutFeedback onPress={handleOutsideTouch}>
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <TouchableWithoutFeedback>
              <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                {/* Header */}
                <LinearGradient
                  colors={typeConfig.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.header}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={typeConfig.iconName} size={32} color="#FFF" />
                  </View>
                  <Text style={styles.title}>{title}</Text>
                </LinearGradient>
                
                {/* Content */}
                <View style={styles.content}>
                  <Text style={styles.message}>{message}</Text>
                  
                  {/* Buttons */}
                  <View style={[
                    styles.buttonContainer,
                    hideCancel && styles.singleButtonContainer
                  ]}>
                    {!hideCancel && (
                      <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]} 
                        onPress={onCancel}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelButtonText}>{cancelText}</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={[
                        styles.button, 
                        styles.confirmButton,
                        {backgroundColor: typeConfig.iconColor}
                      ]} 
                      onPress={onConfirm}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.confirmButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 350,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  header: {
    paddingTop: 25,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    padding: 20,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  singleButtonContainer: {
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  confirmButton: {
    backgroundColor: '#FF9500',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmationModal;