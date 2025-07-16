
import React from 'react';
import { z } from 'zod';

// Comprehensive input validation schemas
export const ValidationSchemas = {
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .refine((email) => {
      // Additional email validation beyond HTML5
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return emailRegex.test(email);
    }, 'Invalid email format'),

  phone: z.string()
    .min(1, 'Phone number is required')
    .refine((phone) => {
      // International phone number validation
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      return phoneRegex.test(cleanPhone);
    }, 'Invalid phone number format (use international format: +1234567890)'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine((password) => {
      // Strong password requirements
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }, 'Password must contain uppercase, lowercase, number, and special character'),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .refine((name) => {
      // Prevent XSS in names
      const sanitized = name.replace(/<script.*?>.*?<\/script>/gi, '');
      return sanitized === name && !/[<>]/.test(name);
    }, 'Invalid characters in name'),

  smsContent: z.string()
    .min(1, 'Message content is required')
    .max(1600, 'Message too long (max 1600 characters)')
    .refine((content) => {
      // Prevent injection attacks in SMS content
      const dangerous = /<script|javascript:|data:|vbscript:/i;
      return !dangerous.test(content);
    }, 'Invalid content detected'),

  apiKey: z.string()
    .min(8, 'API key too short')
    .max(256, 'API key too long')
    .refine((key) => {
      // Basic API key format validation
      return /^[a-zA-Z0-9_-]+$/.test(key);
    }, 'Invalid API key format')
};

interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  schema: z.ZodString;
  placeholder?: string;
  type?: string;
  className?: string;
  required?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  value,
  onChange,
  schema,
  placeholder,
  type = 'text',
  className = '',
  required = false
}) => {
  const [error, setError] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Real-time validation
    try {
      schema.parse(newValue);
      setError('');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Invalid input');
      }
    }
  };

  return (
    <div className="space-y-1">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`${className} ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

// Utility function to validate data before submission
export const validateInput = (data: any, schema: z.ZodSchema): { isValid: boolean; errors: string[] } => {
  try {
    schema.parse(data);
    return { isValid: true, errors: [] };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.errors.map(e => e.message);
      return { isValid: false, errors };
    }
    return { isValid: false, errors: ['Validation failed'] };
  }
};
