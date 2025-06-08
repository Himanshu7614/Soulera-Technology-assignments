const validator = require('validator');

// Validate email format
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validate required string fields
const isValidString = (str, minLength = 1, maxLength = 255) => {
  return str && 
         typeof str === 'string' && 
         str.trim().length >= minLength && 
         str.trim().length <= maxLength;
};

// Validate positive number
const isPositiveNumber = (num) => {
  return num !== null && num !== undefined && num >= 0;
};

// Validate positive integer
const isPositiveInteger = (num) => {
  return Number.isInteger(num) && num > 0;
};

// Validate UUID format
const isValidUUID = (uuid) => {
  return validator.isUUID(uuid);
};

// Validate user registration input
const validateRegisterInput = (input) => {
  const errors = [];

  if (!isValidEmail(input.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!isValidPassword(input.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!isValidString(input.firstName, 1, 50)) {
    errors.push('First name is required and must be between 1-50 characters');
  }

  if (!isValidString(input.lastName, 1, 50)) {
    errors.push('Last name is required and must be between 1-50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate product input
const validateProductInput = (input) => {
  const errors = [];

  if (!isValidString(input.name, 1, 200)) {
    errors.push('Product name is required and must be between 1-200 characters');
  }

  if (!isPositiveNumber(input.price)) {
    errors.push('Price must be a positive number');
  }

  if (!Number.isInteger(input.inventory) || input.inventory < 0) {
    errors.push('Inventory must be a non-negative integer');
  }

  if (!isValidUUID(input.categoryId)) {
    errors.push('Please provide a valid category ID');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate category input
const validateCategoryInput = (input) => {
  const errors = [];

  if (!isValidString(input.name, 1, 100)) {
    errors.push('Category name is required and must be between 1-100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate order input
const validateOrderInput = (input) => {
  const errors = [];

  if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (input.items) {
    input.items.forEach((item, index) => {
      if (!isValidUUID(item.productId)) {
        errors.push(`Item ${index + 1}: Invalid product ID`);
      }
      if (!isPositiveInteger(item.quantity)) {
        errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidString,
  isPositiveNumber,
  isPositiveInteger,
  isValidUUID,
  validateRegisterInput,
  validateProductInput,
  validateCategoryInput,
  validateOrderInput
}; 