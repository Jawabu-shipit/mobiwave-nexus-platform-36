
import React from 'react';
import { z } from 'zod';

// Enhanced validation schemas with XSS protection
export const ValidationSchemas = {
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .transform(val => val.trim().toLowerCase())
    .refine((email) => {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return emailRegex.test(email);
    }, 'Invalid email format'),

  phone: z.string()
    .min(1, 'Phone number is required')
    .transform(val => val.replace(/[\s\-\(\)]/g, ''))
    .refine((phone) => {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(phone);
    }, 'Invalid phone number format'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine((password) => {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }, 'Password must contain uppercase, lowercase, number, and special character'),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .transform(val => sanitizeHtml(val))
    .refine((name) => {
      return !/[<>]/.test(name);
    }, 'Invalid characters in name'),

  textContent: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content too long')
    .transform(val => sanitizeHtml(val))
    .refine((content) => {
      const dangerous = /<script|javascript:|data:|vbscript:/i;
      return !dangerous.test(content);
    }, 'Invalid content detected'),
};

// Enhanced HTML sanitization function
function sanitizeHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URLs
    .trim();
}

// Rate limiting with enhanced security
const rateLimitStore = new Map<string, number[]>();

export const validateRateLimit = (
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  
  const requests = rateLimitStore.get(key) || [];
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitStore.entries()) {
      const filtered = v.filter(timestamp => now - timestamp < windowMs);
      if (filtered.length === 0) {
        rateLimitStore.delete(k);
      } else {
        rateLimitStore.set(k, filtered);
      }
    }
  }
  
  return true;
};

// CSRF token validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken) return false;
  if (token.length !== expectedToken.length) return false;
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
};
