
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';

interface EnhancedErrorContext {
  operation: string;
  component?: string;
  details?: any;
  shouldRetry?: boolean;
  retryFn?: () => Promise<any>;
  onError?: (error: any) => void;
}

export const useEnhancedErrorHandler = () => {
  const { handleError: baseHandleError, handleRetry } = useErrorHandler();

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
