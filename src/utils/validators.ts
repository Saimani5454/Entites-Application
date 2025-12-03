/**
 * Email validation regex
 * Matches standard email format with domains
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex
 * Only accepts digits (0-9)
 */
export const phoneRegex = /^\d+$/;

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

/**
 * Validate phone format (numbers only)
 */
export const isValidPhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};
