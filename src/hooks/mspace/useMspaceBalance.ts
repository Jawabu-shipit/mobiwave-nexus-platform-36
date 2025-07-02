
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface BalanceResponse {
  balance: number;
  status: string;
}

export const useMspaceBalance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleRetry } = useErrorHandler();

  const checkBalance = async (): Promise<BalanceResponse> => {
    setIsLoading(true);
    try {
      const balanceOperation = async () => {
        const { data, error } = await supabase.functions.invoke('mspace-balance');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data || typeof data.balance === 'undefined') {
          throw new Error('Invalid balance response from API');
        }
        
        return data;
      };

      return await handleRetry(balanceOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Check SMS Balance',
        shouldRetry: true,
        retryFn: () => checkBalance()
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkBalance, isLoading };
};
