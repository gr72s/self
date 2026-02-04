// Shared validation utilities
// Can be used in both Web and Miniprogram form validation

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

/**
 * Validate number is positive
 */
export const isPositiveNumber = (value: number): boolean => {
    return !isNaN(value) && value > 0;
};

/**
 * Validate string length
 */
export const isValidLength = (
    value: string,
    min?: number,
    max?: number
): boolean => {
    const length = value.trim().length;
    if (min !== undefined && length < min) return false;
    if (max !== undefined && length > max) return false;
    return true;
};

/**
 * Validate number range
 */
export const isInRange = (
    value: number,
    min?: number,
    max?: number
): boolean => {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
};
