import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  Dimensions, 
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Create the notification context
const NotificationContext = createContext();

// Notification types with their properties
const NOTIFICATION_TYPES = {
  SUCCESS: {
    backgroundColor: 'rgba(52, 199, 89, 0.95)',
    icon: 'checkmark-circle',
    defaultTitle: 'Success',
  },
  ERROR: {
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
    icon: 'alert-circle',
    defaultTitle: 'Error',
  },
  INFO: {
    backgroundColor: 'rgba(0, 122, 255, 0.95)',
    icon: 'information-circle',
    defaultTitle: 'Information',
  },
  WARNING: {
    backgroundColor: 'rgba(255, 204, 0, 0.95)',
    icon: 'warning',
    defaultTitle: 'Warning',
  },
};

// Animation patterns
const ANIMATION_PATTERNS = {
  SLIDE_IN: (animValue, toValue) => {
    return Animated.spring(animValue, {
      toValue,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    });
  },
  FADE_IN: (animValue, toValue) => {
    return Animated.timing(animValue, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    });
  },
  BOUNCE: (animValue, toValue) => {
    return Animated.spring(animValue, {
      toValue,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    });
  },
};

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Maximum number of notifications to show at once
const MAX_VISIBLE_NOTIFICATIONS = 3;

// Component for a single notification
const Notification = ({ 
  id, 
  type = 'INFO', 
  title, 
  message, 
  duration = 3000, 
  onPress, 
  onDismiss, 
  actionLabel, 
  actionOnPress,
  onLayout,
  animPattern = 'SLIDE_IN',
  index,
  removeNotification
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const notificationTypeProps = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.INFO;
  const animationPattern = ANIMATION_PATTERNS[animPattern] || ANIMATION_PATTERNS.SLIDE_IN;
  const timeoutRef = useRef(null);

  // Layout calculations for staggered animations
  const yOffset = index * 10;
  
  useEffect(() => {
    // Show notification animation
    Animated.parallel([
      animationPattern(slideAnim, 0),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Auto-dismiss after duration
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        dismissNotification();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const dismissNotification = () => {
    // Hide notification animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      removeNotification(id);
      if (onDismiss) onDismiss();
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
      dismissNotification();
    }
  };

  const handleActionPress = () => {
    if (actionOnPress) {
      actionOnPress();
      dismissNotification();
    }
  };

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          backgroundColor: notificationTypeProps.backgroundColor,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            { translateY: yOffset }
          ],
          opacity: fadeAnim,
          // Subtle shadow for stacked notifications
          shadowOpacity: 0.3 - (index * 0.05),
          zIndex: 1000 - index
        }
      ]}
      onLayout={onLayout}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={handlePress}
      >
        <Ionicons name={notificationTypeProps.icon} size={24} color="#FFF" />
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationTitle}>
            {title || notificationTypeProps.defaultTitle}
          </Text>
          {message ? <Text style={styles.notificationMessage}>{message}</Text> : null}
        </View>
        
        <TouchableOpacity
          style={styles.notificationDismiss}
          onPress={dismissNotification}
        >
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </TouchableOpacity>
      
      {actionLabel && (
        <TouchableOpacity
          style={styles.notificationAction}
          onPress={handleActionPress}
        >
          <Text style={styles.notificationActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const notificationsLayout = useRef({}).current;
  
  const showNotification = ({
    type = 'INFO',
    title,
    message,
    duration = 3000,
    onPress,
    onDismiss,
    actionLabel,
    actionOnPress,
    animPattern = 'SLIDE_IN'
  }) => {
    const newNotification = {
      id: generateId(),
      type,
      title,
      message,
      duration,
      onPress,
      onDismiss,
      actionLabel,
      actionOnPress,
      animPattern
    };
    
    setNotifications(prev => {
      // If we have reached maximum, remove the oldest
      const updatedNotifications = [...prev];
      if (updatedNotifications.length >= MAX_VISIBLE_NOTIFICATIONS) {
        updatedNotifications.pop(); // Remove oldest
      }
      return [newNotification, ...updatedNotifications];
    });
    
    return newNotification.id;
  };
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    delete notificationsLayout[id];
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  const handleNotificationLayout = (id, event) => {
    const { height } = event.nativeEvent.layout;
    notificationsLayout[id] = height;
  };
  
  // Shorthand methods for different notification types
  const success = (message, options = {}) => {
    return showNotification({ type: 'SUCCESS', message, ...options });
  };
  
  const error = (message, options = {}) => {
    return showNotification({ type: 'ERROR', message, ...options });
  };
  
  const info = (message, options = {}) => {
    return showNotification({ type: 'INFO', message, ...options });
  };
  
  const warning = (message, options = {}) => {
    return showNotification({ type: 'WARNING', message, ...options });
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        removeNotification,
        clearAllNotifications,
        success,
        error,
        info,
        warning
      }}
    >
      {children}
      
      <SafeAreaView pointerEvents="box-none" style={styles.notificationContainer}>
        {notifications.map((notification, index) => (
          <Notification
            key={notification.id}
            {...notification}
            index={index}
            onLayout={(e) => handleNotificationLayout(notification.id, e)}
            removeNotification={removeNotification}
          />
        ))}
      </SafeAreaView>
    </NotificationContext.Provider>
  );
};

// Hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Styles
const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  notification: {
    width: width - 30,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  notificationTextContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  notificationTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notificationMessage: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
  notificationDismiss: {
    padding: 5,
  },
  notificationAction: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    alignItems: 'center',
  },
  notificationActionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default NotificationContext;