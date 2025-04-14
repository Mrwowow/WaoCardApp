/**
 * Helper functions for merchant categories
 */

/**
 * Get Ionicons icon name based on category
 * @param {string} category - The merchant category
 * @returns {string} - Ionicons icon name
 */
export function getCategoryIcon(category) {
    switch (category) {
      case 'food':
        return 'restaurant-outline';
      case 'retail':
        return 'cart-outline';
      case 'services':
        return 'briefcase-outline';
      case 'atm':
        return 'cash-outline';
      case 'fueling':
        return 'flame-outline';
      default:
        return 'storefront-outline';
    }
  }
  
  /**
   * Get friendly category name based on category id
   * @param {string} category - The merchant category
   * @returns {string} - Human-readable category name
   */
  export function getCategoryName(category) {
    switch (category) {
      case 'food':
        return 'Restaurant';
      case 'retail':
        return 'Retail Store';
      case 'services':
        return 'Services';
      case 'atm':
        return 'ATM';
      case 'fueling':
        return 'Fuel Station';
      default:
        return 'Business';
    }
  }
  
  /**
   * Get all available categories
   * @returns {Array} - Array of category objects with id, name, and icon
   */
  export function getCategories() {
    return [
      { id: 'all', name: 'All', icon: 'grid-outline' },
      { id: 'food', name: 'Food', icon: 'restaurant-outline' },
      { id: 'retail', name: 'Retail', icon: 'cart-outline' },
      { id: 'services', name: 'Services', icon: 'briefcase-outline' },
      { id: 'atm', name: 'ATMs', icon: 'cash-outline' },
      { id: 'fueling', name: 'Fuel', icon: 'flame-outline' },
    ];
  }