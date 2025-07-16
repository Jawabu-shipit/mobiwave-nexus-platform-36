// Phone number validation utilities for Kenyan phone numbers

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  errorCode?: string;
  errorMessage?: string;
}

export const PHONE_ERROR_CODES = {
  INVALID_LENGTH: 'INVALID_LENGTH',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_PREFIX: 'INVALID_PREFIX',
  EMPTY_NUMBER: 'EMPTY_NUMBER',
} as const;

export const PHONE_ERROR_MESSAGES = {
  [PHONE_ERROR_CODES.INVALID_LENGTH]: 'Phone number must be exactly 12 digits in format +2547XXXXXXXX',
  [PHONE_ERROR_CODES.INVALID_FORMAT]: 'Phone number must start with +254 followed by 9 digits',
  [PHONE_ERROR_CODES.INVALID_PREFIX]: 'Phone number must start with +254 (Kenya country code)',
  [PHONE_ERROR_CODES.EMPTY_NUMBER]: 'Phone number is required',
} as const;

/**
 * Validates and formats Kenyan phone numbers
 * Accepts formats: +2547XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX
 * Returns: +2547XXXXXXXX format
 */
export function validateAndFormatPhoneNumber(phoneNumber: string): PhoneValidationResult {
  // Remove all whitespace and special characters except +
  const cleanNumber = phoneNumber.trim().replace(/[\s\-\(\)]/g, '');
  
  if (!cleanNumber) {
    return {
      isValid: false,
      errorCode: PHONE_ERROR_CODES.EMPTY_NUMBER,
      errorMessage: PHONE_ERROR_MESSAGES[PHONE_ERROR_CODES.EMPTY_NUMBER],
    };
  }

  let formattedNumber = '';

  // Handle different input formats
  if (cleanNumber.startsWith('+254')) {
    // Already in international format: +2547XXXXXXXX
    formattedNumber = cleanNumber;
  } else if (cleanNumber.startsWith('254')) {
    // Missing + sign: 2547XXXXXXXX
    formattedNumber = '+' + cleanNumber;
  } else if (cleanNumber.startsWith('07') || cleanNumber.startsWith('01')) {
    // Local format: 07XXXXXXXX or 01XXXXXXXX
    // Convert 07 to +2547 and 01 to +2541
    const prefix = cleanNumber.startsWith('07') ? '+2547' : '+2541';
    formattedNumber = prefix + cleanNumber.substring(2);
  } else if (cleanNumber.startsWith('7') && cleanNumber.length === 9) {
    // Missing leading zero: 7XXXXXXXX
    formattedNumber = '+254' + cleanNumber;
  } else if (cleanNumber.startsWith('1') && cleanNumber.length === 9) {
    // Missing leading zero: 1XXXXXXXX
    formattedNumber = '+254' + cleanNumber;
  } else {
    return {
      isValid: false,
      errorCode: PHONE_ERROR_CODES.INVALID_FORMAT,
      errorMessage: PHONE_ERROR_MESSAGES[PHONE_ERROR_CODES.INVALID_FORMAT],
    };
  }

  // Validate the final format
  if (!formattedNumber.startsWith('+254')) {
    return {
      isValid: false,
      errorCode: PHONE_ERROR_CODES.INVALID_PREFIX,
      errorMessage: PHONE_ERROR_MESSAGES[PHONE_ERROR_CODES.INVALID_PREFIX],
    };
  }

  // Check total length (should be 13: +254 + 9 digits)
  if (formattedNumber.length !== 13) {
    return {
      isValid: false,
      errorCode: PHONE_ERROR_CODES.INVALID_LENGTH,
      errorMessage: PHONE_ERROR_MESSAGES[PHONE_ERROR_CODES.INVALID_LENGTH],
    };
  }

  // Validate that the remaining characters are digits
  const numberPart = formattedNumber.substring(4); // Remove +254
  if (!/^\d{9}$/.test(numberPart)) {
    return {
      isValid: false,
      errorCode: PHONE_ERROR_CODES.INVALID_FORMAT,
      errorMessage: PHONE_ERROR_MESSAGES[PHONE_ERROR_CODES.INVALID_FORMAT],
    };
  }

  // Validate Kenyan mobile prefixes (7XX or 1XX after +254)
  const firstDigit = numberPart[0];
  if (firstDigit !== '7' && firstDigit !== '1') {
    return {
      isValid: false,
      errorCode: PHONE_ERROR_CODES.INVALID_FORMAT,
      errorMessage: 'Phone number must be a valid Kenyan mobile number (+2547XXXXXXXX or +2541XXXXXXXX)',
    };
  }

  return {
    isValid: true,
    formattedNumber,
  };
}

/**
 * Validates multiple phone numbers and returns results for each
 */
export function validatePhoneNumbers(phoneNumbers: string[]): PhoneValidationResult[] {
  return phoneNumbers.map(validateAndFormatPhoneNumber);
}

/**
 * Filters out invalid phone numbers and returns only valid formatted ones
 */
export function getValidPhoneNumbers(phoneNumbers: string[]): string[] {
  return phoneNumbers
    .map(validateAndFormatPhoneNumber)
    .filter(result => result.isValid)
    .map(result => result.formattedNumber!);
}

/**
 * Checks if a phone number is valid without formatting
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  return validateAndFormatPhoneNumber(phoneNumber).isValid;
}