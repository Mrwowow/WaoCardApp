/**
 * Utility functions for card management
 */

/**
 * Generate dummy cards for first-time users
 * This provides sample cards to demonstrate the app's functionality
 */
export const generateDummyCards = () => {
    const now = new Date().toISOString();
    
    return [
      // Payment card example
      {
        id: 'dummy-payment-1',
        type: 'payment',
        name: 'My Debit Card',
        number: '4111111111111111',
        holderName: 'JOHN DOE',
        expiry: '05/27',
        cvv: '123',
        issuer: 'Omni Bank',
        network: 'visa',
        createdAt: now,
      },
      
      // Loyalty card example
      {
        id: 'dummy-loyalty-1',
        type: 'loyalty',
        name: 'Coffee Rewards',
        number: '7632198465',
        issuer: 'Star Cafe',
        points: '750',
        createdAt: now,
      },
      
      // Gift card example
      {
        id: 'dummy-gift-1',
        type: 'gift',
        name: 'Shopping Gift Card',
        number: 'GC1234567890',
        balance: '$50.00',
        issuer: 'GlobalMart',
        createdAt: now,
      },
      
      // ID card example
      {
        id: 'dummy-id-1',
        type: 'id',
        name: 'Gym Membership',
        number: 'M-5431',
        issuer: 'FitZone Gym',
        createdAt: now,
      },
      
      // Ticket example
      {
        id: 'dummy-ticket-1',
        type: 'ticket',
        name: 'Music Festival',
        number: 'TKT-9876543',
        date: '15/07/2025',
        location: 'Central Park',
        issuer: 'Event Master',
        createdAt: now,
      },
      
      // Business card example
      {
        id: 'dummy-business-1',
        type: 'business',
        name: 'Corporate Expense Card',
        number: '5105105105105100',
        holderName: 'JOHN DOE',
        expiry: '12/26',
        issuer: 'Global Corp',
        network: 'mastercard',
        createdAt: now,
      },
    ];
  };
  
  /**
   * Detect card type based on card number
   * @param {string} cardNumber - The card number to analyze
   * @returns {string} The detected card type (visa, mastercard, amex, discover, or unknown)
   */
  export const detectCardType = (cardNumber) => {
    if (!cardNumber) return 'unknown';
    
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Visa
    if (/^4/.test(cleanNumber)) {
      return 'visa';
    }
    
    // Mastercard
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
      return 'mastercard';
    }
    
    // American Express
    if (/^3[47]/.test(cleanNumber)) {
      return 'amex';
    }
    
    // Discover
    if (/^6(?:011|5)/.test(cleanNumber)) {
      return 'discover';
    }
    
    return 'unknown';
  };
  
  /**
   * Validate a credit card number using the Luhn algorithm
   * @param {string} cardNumber - The card number to validate
   * @returns {boolean} True if the card number is valid
   */
  export const validateCardNumber = (cardNumber) => {
    if (!cardNumber) return false;
    
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if the input only contains digits
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }
    
    // Implement Luhn algorithm for card number validation
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
  };
  
  /**
   * Format a card number with proper spacing based on card type
   * @param {string} cardNumber - The card number to format
   * @param {string} cardType - The type of card (visa, mastercard, amex, discover)
   * @returns {string} Formatted card number
   */
  export const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    
    // Remove existing spaces
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Default (Visa, Mastercard, Discover): XXXX XXXX XXXX XXXX
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };
  
  /**
   * Mask a card number for display, showing only the last 4 digits
   * @param {string} cardNumber - The card number to mask
   * @returns {string} Masked card number
   */
  export const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    
    // Remove spaces
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Keep only last 4 digits
    const last4 = cleanNumber.slice(-4);
    
    // Create appropriate number of bullets based on card length
    const bulletCount = cleanNumber.length - 4;
    const bullets = '•'.repeat(bulletCount);
    
    // Return formatted with spaces
    const masked = bullets + last4;
    return masked.replace(/(.{4})/g, '$1 ').trim();
  };
  
  /**
   * Validate expiry date in MM/YY format
   * @param {string} expiry - The expiry date to validate
   * @returns {boolean} True if the expiry date is valid and not expired
   */
  export const validateExpiryDate = (expiry) => {
    if (!expiry) return false;
    
    // Check format
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return false;
    }
    
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
    const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-based
    
    // Convert to numbers
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);
    
    // Check if month is valid
    if (expiryMonth < 1 || expiryMonth > 12) {
      return false;
    }
    
    // Check if expired
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return false;
    }
    
    return true;
  };