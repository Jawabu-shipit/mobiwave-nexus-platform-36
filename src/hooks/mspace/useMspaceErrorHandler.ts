
import { useState } from 'react';
import { toast } from 'sonner';

interface MspaceError {
  code: string;
  message: string;
  retryable: boolean;
  suggestion?: string;
}

export const useMspaceErrorHandler = () => {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleMspaceError = (error: any, operation: string): MspaceError => {
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';

    // Map common Mspace API errors
    const errorMap: Record<string, MspaceError> = {
      'INSUFFICIENT_BALANCE': {
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient SMS credits in your Mspace account',
        retryable: false,
        suggestion: 'Please top up your Mspace account balance'
      },
      'INVALID_CREDENTIALS': {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid Mspace API credentials',
        retryable: false,
        suggestion: 'Please check your API key and username in Settings'
      },
      'INVALID_RECIPIENT': {
        code: 'INVALID_RECIPIENT',
        message: 'Invalid phone number format',
        retryable: false,
        suggestion: 'Ensure phone numbers include country code (e.g., +254...)'
      },
      'RATE_LIMIT_EXCEEDED': {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'API rate limit exceeded',
        retryable: true,
        suggestion: 'Please wait a moment before trying again'
      },
      'NETWORK_ERROR': {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        retryable: true,
        suggestion: 'Check your internet connection'
      },
      'SERVER_ERROR': {
        code: 'SERVER_ERROR',
        message: 'Mspace API server error',
        retryable: true,
        suggestion: 'The service is temporarily unavailable'
      }
    };

    // Determine error type based on message content
    let mappedError: MspaceError;
    
    if (errorMessage.toLowerCase().includes('insufficient') || errorMessage.toLowerCase().includes('balance')) {
      mappedError = errorMap.INSUFFICIENT_BALANCE;
    } else if (errorMessage.toLowerCase().includes('credential') || errorMessage.toLowerCase().includes('auth')) {
      mappedError = errorMap.INVALID_CREDENTIALS;
    } else if (errorMessage.toLowerCase().includes('recipient') || errorMessage.toLowerCase().includes('phone')) {
      mappedError = errorMap.INVALID_RECIPIENT;
    } else if (errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('limit')) {
      mappedError = errorMap.RATE_LIMIT_EXCEEDED;
    } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
      mappedError = errorMap.NETWORK_ERROR;
    } else if (error?.status >= 500) {
      mappedError = errorMap.SERVER_ERROR;
    } else {
      mappedError = {
        code: errorCode,
        message: errorMessage,
        retryable: error?.status >= 500 || errorMessage.toLowerCase().includes('timeout'),
        suggestion: 'Please try again or contact support if the issue persists'
      };
    }

    // Show appropriate toast message
    if (mappedError.retryable && retryCount < maxRetries) {
      toast.warning(`${operation} failed: ${mappedError.message}. Retrying... (${retryCount + 1}/${maxRetries})`);
    } else {
      toast.error(`${operation} failed: ${mappedError.message}${mappedError.suggestion ? `. ${mappedError.suggestion}` : ''}`);
    }

    return mappedError;
  };

  const shouldRetry = (error: MspaceError): boolean => {
    return error.retryable && retryCount < maxRetries;
  };

  const incrementRetry = () => setRetryCount(prev => prev + 1);
  const resetRetry = () => setRetryCount(0);

  return {
    handleMspaceError,
    shouldRetry,
    incrementRetry,
    resetRetry,
    retryCount,
    maxRetries
  };
};
