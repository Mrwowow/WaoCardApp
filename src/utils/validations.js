// src/utils/validations.js
/**
 * Validates email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates phone number format
   */
  export const isValidPhone = (phone) => {
    // Basic validation - could be made more robust based on requirements
    return phone && phone.length >= 10;
  };
  
  /**
   * Validates password strength
   */
  export const isStrongPassword = (password) => {
    return password && password.length >= 6;
  };
  
  /**
   * Validates if passwords match
   */
  export const doPasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
  };
  
  /**
   * Validates registration form data
   */
  export const validateRegistrationData = (data) => {
    const errors = {};
    
    // First name validation
    if (!data.first_name || data.first_name.trim().length === 0) {
      errors.first_name = 'First name is required';
    }
    
    // Last name validation
    if (!data.last_name || data.last_name.trim().length === 0) {
      errors.last_name = 'Last name is required';
    }
    
    // Email validation
    if (!data.email || !isValidEmail(data.email)) {
      errors.email = 'Valid email is required';
    }
    
    // Phone validation
    if (!data.phone_num || !isValidPhone(data.phone_num)) {
      errors.phone_num = 'Valid phone number is required';
    }
    
    // Username validation
    if (!data.username || data.username.trim().length < 4) {
      errors.username = 'Username must be at least 4 characters';
    }
    
    // Password validation
    if (!data.password || !isStrongPassword(data.password)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!doPasswordsMatch(data.password, data.confirm_password)) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    // Gender validation
    if (!data.gender) {
      errors.gender = 'Gender is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };