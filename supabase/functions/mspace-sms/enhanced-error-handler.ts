
export interface EnhancedError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
  httpStatus: number;
}

export class MspaceErrorHandler {
  static handleApiError(error: unknown, context: string): EnhancedError {
    console.error(`Mspace API Error in ${context}:`, error);

    // Network errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      'message' in error &&
      (error as { name: string }).name === 'TypeError' &&
      typeof (error as { message: string }).message === 'string' &&
      (error as { message: string }).message.includes('fetch')
    ) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        details: { originalError: (error as { message: string }).message },
        retryable: true,
        httpStatus: 503
      };
    }

    // HTTP errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status: number }).status === 'number'
    ) {
      const status = (error as { status: number }).status;
      switch (status) {
        case 401:
          return {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid API credentials',
            details: { status },
            retryable: false,
            httpStatus: 401
          };
        case 402:
          return {
            code: 'INSUFFICIENT_BALANCE',
            message: 'Insufficient SMS credits',
            details: { status },
            retryable: false,
            httpStatus: 402
          };
        case 429:
          return {
            code: 'RATE_LIMITED',
            message: 'API rate limit exceeded',
            details: { status },
            retryable: true,
            httpStatus: 429
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            code: 'SERVER_ERROR',
            message: 'Mspace server temporarily unavailable',
            details: { status },
            retryable: true,
            httpStatus: status
          };
        default:
          return {
            code: 'HTTP_ERROR',
            message: `HTTP ${status} error`,
            details: { status },
            retryable: status >= 500,
            httpStatus: status
          };
      }
    }

    // Mspace-specific API errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: string }).message === 'string'
    ) {
      const message = (error as { message: string }).message.toLowerCase();
      
      if (message.includes('invalid recipient') || message.includes('invalid phone')) {
        return {
          code: 'INVALID_RECIPIENT',
          message: 'Invalid phone number format',
          details: { originalMessage: (error as { message: string }).message },
          retryable: false,
          httpStatus: 400
        };
      }
      
      if (message.includes('insufficient') || message.includes('balance')) {
        return {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient SMS credits',
          details: { originalMessage: (error as { message: string }).message },
          retryable: false,
          httpStatus: 402
        };
      }
      
      if (message.includes('timeout')) {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out',
          details: { originalMessage: (error as { message: string }).message },
          retryable: true,
          httpStatus: 408
        };
      }
    }

    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message:
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'An unknown error occurred',
      details: { originalError: error },
      retryable: false,
      httpStatus: 500
    };
  }

  static shouldRetry(error: EnhancedError, attemptCount: number, maxRetries: number): boolean {
    if (attemptCount >= maxRetries) return false;
    if (!error.retryable) return false;
    
    // Special retry logic for specific errors
    switch (error.code) {
      case 'RATE_LIMITED':
        return attemptCount < 2; // Only retry once for rate limits
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return attemptCount < maxRetries;
      case 'SERVER_ERROR':
        return attemptCount < Math.min(maxRetries, 2); // Limit server error retries
      default:
        return error.retryable && attemptCount < maxRetries;
    }
  }

  static getRetryDelay(error: EnhancedError, attemptCount: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 10000; // 10 seconds
    
    switch (error.code) {
      case 'RATE_LIMITED':
        return Math.min(5000 * Math.pow(2, attemptCount), maxDelay); // Exponential backoff for rate limits
      case 'SERVER_ERROR':
        return Math.min(baseDelay * Math.pow(1.5, attemptCount), maxDelay);
      default:
        return Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay);
    }
  }
}