
import { useState } from 'react';
import { toast } from 'sonner';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  backoffMultiplier?: number;
}

interface PhoneValidationResult {
  valid: string[];
  invalid: string[];
}

export const useMspaceReliability = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    operationName: string,
    options: RetryOptions = {}
  ): Promise<T> => {
    const { maxRetries = 3, baseDelay = 1000, backoffMultiplier = 2 } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (attempt > 1) {
          setIsRetrying(true);
          const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 2);
          console.log(`Retrying ${operationName} (attempt ${attempt}/${maxRetries + 1}) after ${delay}ms delay`);
          await sleep(delay);
        }
        
        const result = await operation();
        
        if (attempt > 1) {
          toast.success(`${operationName} succeeded after ${attempt - 1} retry(ies)`);
        }
        
        setIsRetrying(false);
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.error(`${operationName} attempt ${attempt} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.message?.includes('authentication') || 
            error.message?.includes('unauthorized') ||
            error.message?.includes('invalid credentials')) {
          break;
        }
        
        if (attempt === maxRetries + 1) {
          break;
        }
      }
    }
    
    setIsRetrying(false);
    
    if (lastError) {
      console.error(`${operationName} failed after ${maxRetries + 1} attempts:`, lastError.message);
      throw new Error(`${operationName} failed: ${lastError.message}`);
    }
    
    throw new Error(`${operationName} failed for unknown reasons`);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Kenyan number
    if (cleaned.startsWith('254')) {
      return cleaned.length === 12 && /^254[17]\d{8}$/.test(cleaned);
    }
    
    if (cleaned.startsWith('0')) {
      return cleaned.length === 10 && /^0[17]\d{8}$/.test(cleaned);
    }
    
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return cleaned.length === 9 && /^[17]\d{8}$/.test(cleaned);
    }
    
    return false;
  };

  const normalizePhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const batchValidatePhones = (phones: string[]): PhoneValidationResult => {
    const valid: string[] = [];
    const invalid: string[] = [];
    
    phones.forEach(phone => {
      if (validatePhoneNumber(phone)) {
        valid.push(normalizePhoneNumber(phone));
      } else {
        invalid.push(phone);
      }
    });
    
    return { valid, invalid };
  };

  return {
    executeWithRetry,
    validatePhoneNumber,
    normalizePhoneNumber,
    batchValidatePhones,
    isRetrying
  };
};
