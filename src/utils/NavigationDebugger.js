// src/utils/NavigationDebugger.js
import { Platform } from 'react-native';

/**
 * NavigationDebugger utility to help diagnose navigation issues
 */
class NavigationDebugger {
  static debugLog(message, data = null) {
    if (__DEV__) {
      if (data) {
        console.log(`[NavDebug] ${message}`, data);
      } else {
        console.log(`[NavDebug] ${message}`);
      }
    }
  }

  /**
   * Enhanced navigation method that includes debugging and fallbacks
   * @param {object} navigation - The navigation object
   * @param {string} routeName - Primary route to navigate to
   * @param {object} params - Parameters to pass
   * @param {object} options - Additional options including fallback routes
   */
  static navigateTo(navigation, routeName, params = {}, options = {}) {
    if (!navigation) {
      this.debugLog('Navigation object is missing');
      return false;
    }

    this.debugLog(`Attempting to navigate to: ${routeName}`, params);

    try {
      // Check if special nested navigation is needed
      if (options.isNested) {
        const { parentRoute, childRoute } = options;
        if (parentRoute && childRoute) {
          this.debugLog(`Using nested navigation: ${parentRoute} → ${childRoute}`);
          navigation.navigate(parentRoute, {
            screen: childRoute,
            params: params
          });
          return true;
        }
      } 
      
      // Try direct navigation (main approach)
      this.debugLog(`Using direct navigation to: ${routeName}`);
      navigation.navigate(routeName, params);
      return true;
    } catch (error) {
      this.debugLog(`Navigation error: ${error.message}`, error);
      
      // Try fallback approaches if provided
      if (options.fallbacks && options.fallbacks.length > 0) {
        for (const fallback of options.fallbacks) {
          try {
            this.debugLog(`Trying fallback navigation: ${fallback.route}`);
            if (fallback.isNested) {
              navigation.navigate(fallback.parent, {
                screen: fallback.route,
                params: params
              });
            } else {
              navigation.navigate(fallback.route, params);
            }
            return true;
          } catch (fallbackError) {
            this.debugLog(`Fallback navigation error: ${fallbackError.message}`);
          }
        }
      }
      
      // All navigation attempts failed
      this.debugLog('All navigation attempts failed');
      return false;
    }
  }

  /**
   * Specific helper for navigating to AddCard screen in WaoCard app
   */
  static navigateToAddCard(navigation, cardTypes) {
    this.debugLog('Attempting to navigate to AddCard screen');
    
    return this.navigateTo(navigation, 'AddCard', { cardTypes }, {
      isNested: true,
      parentRoute: 'CardsTab',
      childRoute: 'AddCard',
      fallbacks: [
        { route: 'AddCard', isNested: false },
        { route: 'AddCard', parent: 'CardsTab', isNested: true },
        // You can add more fallbacks here if needed
      ]
    });
  }
}

export default NavigationDebugger;