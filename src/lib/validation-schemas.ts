
import { z } from 'zod';

// Service validation schema with comprehensive security checks
export const serviceValidationSchema = z.object({
  id: z.string().uuid().optional(), // Add id field to match ServiceCatalog interface
  service_name: z
    .string()
    .min(1, 'Service name is required')
    .max(100, 'Service name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Service name contains invalid characters'),
  
  service_type: z
    .enum(['sms', 'email', 'ussd', 'shortcode', 'mpesa', 'whatsapp', 'survey', 'servicedesk', 'rewards'])
    .refine(val => val !== null, 'Service type is required'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(val => val ? val.replace(/<[^>]*>/g, '') : val), // Strip HTML tags
  
  setup_fee: z
    .number()
    .min(0, 'Setup fee cannot be negative')
    .max(1000000, 'Setup fee cannot exceed 1,000,000')
    .finite('Setup fee must be a valid number'),
  
  monthly_fee: z
    .number()
    .min(0, 'Monthly fee cannot be negative')
    .max(1000000, 'Monthly fee cannot exceed 1,000,000')
    .finite('Monthly fee must be a valid number'),
  
  transaction_fee_type: z
    .enum(['none', 'fixed', 'percentage'])
    .default('none'),
  
  transaction_fee_amount: z
    .number()
    .min(0, 'Transaction fee cannot be negative')
    .max(100, 'Transaction fee cannot exceed 100')
    .finite('Transaction fee must be a valid number'),
  
  is_premium: z.boolean().default(false),
  is_active: z.boolean().default(true),
  
  provider: z
    .enum(['mspace', 'internal', 'third-party'])
    .default('mspace')
});

export type ServiceFormData = z.infer<typeof serviceValidationSchema>;

// SMS content validation schema
export const smsContentSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(1600, 'Message content cannot exceed 1600 characters')
    .transform(val => val.replace(/<[^>]*>/g, '')) // Strip HTML tags for XSS protection
    .refine(val => !val.includes('javascript:'), 'Invalid content detected')
    .refine(val => !val.includes('<script'), 'Invalid content detected'),
  
  recipient: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .transform(val => val.replace(/[^\d+]/g, '')) // Sanitize phone number
});

// User input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Rate limiting check
export const validateRateLimit = (endpoint: string, maxRequests: number = 100): boolean => {
  const key = `rate_limit_${endpoint}`;
  const now = Date.now();
  const windowStart = now - (60 * 1000); // 1 minute window
  
  const requests = JSON.parse(localStorage.getItem(key) || '[]');
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  localStorage.setItem(key, JSON.stringify(validRequests));
  return true;
};
