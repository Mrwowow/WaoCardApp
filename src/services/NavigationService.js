// src/services/NavigationService.js

import { createRef } from 'react';
import { CommonActions, StackActions } from '@react-navigation/native';
import NavigationDebugger from '../utils/NavigationDebugger';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Navigation service to provide global navigation capabilities
 * outside of React components.
 */

// Reference to navigation object
export const navigationRef = createRef();

/**
 * Navigate to a specific route
 * @param {string} name - Route name
 * @param {Object} params - Route params
 */
export const navigate = (name, params) => {
  NavigationDebugger.debugLog(`Attempting to navigate to: ${name}`, params);
  
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
    NavigationDebugger.debugLog(`Successfully navigated to: ${name}`);
    return true;
  } else {
    NavigationDebugger.debugLog(`Navigation ref not ready, queueing navigation to: ${name}`);
    // Store navigation action to be performed when navigator is ready
    _queuedNavigationActions.push({ action: 'navigate', name, params });
    return false;
  }
};

/**
 * Replace the current screen with a new one
 * @param {string} name - Route name
 * @param {Object} params - Route params
 */
export const replace = (name, params) => {
  NavigationDebugger.debugLog(`Attempting to replace with: ${name}`, params);
  
  if (navigationRef.current) {
    navigationRef.current.dispatch(StackActions.replace(name, params));
    NavigationDebugger.debugLog(`Successfully replaced with: ${name}`);
    return true;
  } else {
    NavigationDebugger.debugLog(`Navigation ref not ready, queueing replace with: ${name}`);
    _queuedNavigationActions.push({ action: 'replace', name, params });
    return false;
  }
};

/**
 * Push a new screen onto the stack
 * @param {string} name - Route name
 * @param {Object} params - Route params
 */
export const push = (name, params) => {
  NavigationDebugger.debugLog(`Attempting to push: ${name}`, params);
  
  if (navigationRef.current) {
    navigationRef.current.dispatch(StackActions.push(name, params));
    NavigationDebugger.debugLog(`Successfully pushed: ${name}`);
    return true;
  } else {
    NavigationDebugger.debugLog(`Navigation ref not ready, queueing push: ${name}`);
    _queuedNavigationActions.push({ action: 'push', name, params });
    return false;
  }
};

/**
 * Go back to the previous screen
 */
export const goBack = () => {
  NavigationDebugger.debugLog('Attempting to go back');
  
  if (navigationRef.current) {
    navigationRef.current.goBack();
    NavigationDebugger.debugLog('Successfully went back');
    return true;
  } else {
    NavigationDebugger.debugLog('Navigation ref not ready, cannot go back');
    return false;
  }
};

/**
 * Reset the navigation state
 * @param {Array} routes - Routes to reset to
 * @param {number} index - Index to reset to
 */
export const reset = (routes, index = 0) => {
  NavigationDebugger.debugLog('Attempting to reset navigation state', { routes, index });
  
  if (navigationRef.current) {
    try {
      // First try using the root level reset
      console.log('NavigationService: Using root level navigation reset');
      
      // Use a more sophisticated approach that safely handles the navigation state
      navigationRef.current.dispatch(state => {
        try {
          // Safely log the current state (defensive coding)
          console.log('NavigationService: Current nav state type:', 
            state && typeof state === 'object' ? 'Valid state object' : 'Invalid state');
          
          if (state && state.routes && Array.isArray(state.routes)) {
            console.log('NavigationService: Routes found:', state.routes.length);
          }
        } catch (err) {
          console.log('NavigationService: Error inspecting state:', err);
        }
        
        // Create a new state for complete reset - use CommonActions.reset
        return CommonActions.reset({
          index,
          routes,
        });
      });
      
      NavigationDebugger.debugLog('Successfully reset navigation state');
      return true;
    } catch (error) {
      console.error('NavigationService: Error during reset:', error);
      
      // Fallback to standard reset approach
      try {
        console.log('NavigationService: Trying standard reset approach');
        navigationRef.current.dispatch(
          CommonActions.reset({
            index,
            routes,
          })
        );
        console.log('NavigationService: Standard reset succeeded');
        return true;
      } catch (err) {
        console.error('NavigationService: All reset attempts failed:', err);
        return false;
      }
    }
  } else {
    console.log('NavigationService: Navigation ref not ready, queueing reset');
    NavigationDebugger.debugLog('Navigation ref not ready, queueing reset');
    _queuedNavigationActions.push({ action: 'reset', routes, index });
    return false;
  }
};

/**
 * Navigate to the AddCard screen specifically
 * @param {Object} cardTypes - Card type data to pass
 */
export const navigateToAddCard = (cardTypes) => {
  NavigationDebugger.debugLog('Specialized navigation to AddCard screen', { cardTypes });
  return navigate('AddCard', { cardTypes });
};

/**
 * Navigate to Home screen (Main tab)
 */
export const navigateToHome = () => {
  NavigationDebugger.debugLog('Attempting to navigate to Home');
  return navigate('Home');
};

/**
 * Specifically handle logout navigation by resetting to Auth
 * Uses multiple strategies to ensure success
 */
export const navigateToAuth = async () => {
  console.log('NavigationService: Attempting to navigate to Auth screen after logout');
  
  try {
    // First, ensure we're operating on a clean state
    await AsyncStorage.removeItem('waocard_token');
    await AsyncStorage.removeItem('waocard_user_data');
    console.log('NavigationService: Token removed for logout navigation');
    
    // Try the most direct approach if available
    if (navigationRef.current) {
      console.log('NavigationService: Using direct root navigation manipulation');
      
      // Safely log state information
      try {
        if (navigationRef.current.getRootState) {
          const state = navigationRef.current.getRootState();
          console.log('NavigationService: Root state available:', state ? 'yes' : 'no');
        } else {
          console.log('NavigationService: getRootState method not available');
        }
      } catch (stateError) {
        console.log('NavigationService: Error inspecting root state:', stateError);
      }
      
      // Try safer approaches sequentially
      try {
        // First, try the CommonActions approach which works with any navigator
        console.log('NavigationService: Using CommonActions.reset');
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Auth' }]
          })
        );
        console.log('NavigationService: CommonActions.reset completed');
        return true;
      } catch (resetError) {
        console.error('NavigationService: CommonActions.reset failed:', resetError);
        
        // Next, try navigation.navigate as a fallback
        try {
          console.log('NavigationService: Trying simple navigate as fallback');
          navigationRef.current.navigate('Auth');
          console.log('NavigationService: Navigate to Auth completed');
          return true;
        } catch (navError) {
          console.error('NavigationService: Navigate fallback also failed:', navError);
          
          // Force a state update to trigger re-render based on auth state
          return false;
        }
      }
    } else {
      console.error('NavigationService: No navigation ref available for logout');
      return false;
    }
  } catch (e) {
    console.error('NavigationService: Error during auth navigation:', e);
    
    // Final fallback - use multiple techniques to force auth state change
    try {
      console.log('NavigationService: Using extreme fallback mechanisms');
      
      // 1. Make sure token is really gone
      await AsyncStorage.removeItem('waocard_token');
      await AsyncStorage.removeItem('waocard_user_data');
      
      // 2. React Native specific approach - no web APIs available
      console.log('NavigationService: Using React Native specific approaches');
      
      // Ensure all tokens are really gone
      try {
        const keysToRemove = [
          'waocard_token',
          'waocard_user_data',
          'waocard_credentials',
          'waocard_user_id'
        ];
        
        // Remove all keys to be extra sure
        await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
        console.log('NavigationService: All auth keys confirmed removed');
      } catch (storageError) {
        console.log('NavigationService: Error in final storage cleanup:', storageError);
      }
      
      return false;
    } catch (error) {
      console.error('NavigationService: All navigation attempts failed', error);
      return false;
    }
  }
};

/**
 * Log a debug message
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export const debugLog = (message, data = null) => {
  NavigationDebugger.debugLog(message, data);
};

// Queue of navigation actions to run when navigator is ready
const _queuedNavigationActions = [];

/**
 * Process any queued navigation actions
 */
export const processQueuedActions = () => {
  if (navigationRef.current && _queuedNavigationActions.length > 0) {
    NavigationDebugger.debugLog(`Processing ${_queuedNavigationActions.length} queued navigation actions`);
    
    _queuedNavigationActions.forEach(queuedAction => {
      NavigationDebugger.debugLog('Processing queued action', queuedAction);
      
      switch (queuedAction.action) {
        case 'navigate':
          navigate(queuedAction.name, queuedAction.params);
          break;
        case 'replace':
          replace(queuedAction.name, queuedAction.params);
          break;
        case 'push':
          push(queuedAction.name, queuedAction.params);
          break;
        case 'reset':
          reset(queuedAction.routes, queuedAction.index);
          break;
        default:
          NavigationDebugger.debugLog(`Unknown queued action type: ${queuedAction.action}`);
          break;
      }
    });
    
    // Clear the queue
    _queuedNavigationActions.length = 0;
    NavigationDebugger.debugLog('Finished processing queued navigation actions');
  } else if (!navigationRef.current) {
    NavigationDebugger.debugLog('Cannot process queued actions: navigation ref not ready');
  } else {
    NavigationDebugger.debugLog('No queued navigation actions to process');
  }
};

// Export the service as a single object
const NavigationService = {
  navigate,
  replace,
  push,
  goBack,
  reset,
  navigationRef,
  navigateToAddCard,
  navigateToHome,
  navigateToAuth,
  debugLog,
  processQueuedActions,
};

export default NavigationService;