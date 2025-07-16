
import { toast } from 'sonner';

interface EnhancedErrorContext {
  operation: string;
  component?: string;
  details?: any;
  shouldRetry?: boolean;
  retryFn?: () => Promise<any>;
  onError?: (error: any) => void;
}

export const useEnhancedErrorHandler = () => {
  // Basic error handling functionality (previously in useErrorHandler)
  const baseHandleError = (error: any, context: EnhancedErrorContext) => {
    console.error(`Error in ${context.operation}:`, error, context.details);
    
    // Extract meaningful error message
    let message = 'An unexpected error occurred';
    
    if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    // Show appropriate toast based on error type
    if (message.toLowerCase().includes('network') || 
        message.toLowerCase().includes('fetch') ||
        message.toLowerCase().includes('connection')) {
      toast.error('Network error. Please check your internet connection.');
    } else if (message.toLowerCase().includes('unauthorized') ||
               message.toLowerCase().includes('authentication')) {
      toast.error('Authentication failed. Please check your credentials.');
    } else if (message.toLowerCase().includes('rate limit')) {
      toast.error('Too many requests. Please wait before trying again.');
    } else {
      toast.error(`${context.operation} failed: ${message}`);
    }
  };

  const handleRetry = async <T>(operation: () => Promise<T>, maxRetries: number = 2): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  };

  const handleError = async (error: any, context: EnhancedErrorContext) => {
    // Log error for debugging
    console.error(`[${context.component || 'Unknown'}] ${context.operation}:`, error, context.details);

    // Call base error handler
    baseHandleError(error, context);

    // Call custom error handler if provided
    context.onError?.(error);

    // Auto-retry for certain error types
    if (context.shouldRetry && context.retryFn) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        await handleRetry(context.retryFn, 1);
        toast.success(`${context.operation} succeeded after retry`);
      } catch (retryError) {
        console.error(`Retry failed for ${context.operation}:`, retryError);
        toast.error(`${context.operation} failed after retry`);
      }
    }
  };

  const withErrorHandling = <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: Omit<EnhancedErrorContext, 'retryFn'>
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        await handleError(error, {
          ...context,
          retryFn: () => fn(...args)
        });
        return undefined;
      }
    };
  };

  return {
    handleError,
    withErrorHandling,
    handleRetry
  };
};
