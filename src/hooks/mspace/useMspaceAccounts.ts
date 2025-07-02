
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface SubAccountPayload {
  clientname: string;
  noOfSms: number;
}

interface SubUser {
  smsBalance: string;
  subAccUser: string;
}

interface ResellerClientApiResponse {
  clientUserName: string;
  smsBalance: string;
}

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

export const useMspaceAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleRetry } = useErrorHandler();

  const querySubAccounts = async (): Promise<SubUser[]> => {
    setIsLoading(true);
    try {
      const accountsOperation = async () => {
        const { data, error } = await supabase.functions.invoke('mspace-accounts', {
          body: { operation: 'querysubs' }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data?.subUsers || [];
      };

      return await handleRetry(accountsOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Query Sub Accounts',
        shouldRetry: true,
        retryFn: () => querySubAccounts()
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const queryResellerClients = async (): Promise<ResellerClient[]> => {
    setIsLoading(true);
    try {
      const clientsOperation = async () => {
        const { data, error } = await supabase.functions.invoke('mspace-accounts', {
          body: { operation: 'queryresellerclients' }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        return (data?.resellerClients || []).map((client: ResellerClientApiResponse) => ({
          clientname: client.clientUserName,
          balance: client.smsBalance,
          status: 'active'
        }));
      };

      return await handleRetry(clientsOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Query Reseller Clients',
        shouldRetry: true,
        retryFn: () => queryResellerClients()
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const topUpSubAccount = async (payload: SubAccountPayload) => {
    setIsLoading(true);
    try {
      const topUpOperation = async () => {
        const { data, error } = await supabase.functions.invoke('mspace-accounts', {
          body: {
            operation: 'topupsub',
            clientname: payload.clientname,
            noOfSms: payload.noOfSms
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      };

      return await handleRetry(topUpOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Top Up Sub Account',
        details: payload,
        shouldRetry: true,
        retryFn: () => topUpSubAccount(payload)
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const topUpResellerClient = async (payload: SubAccountPayload) => {
    setIsLoading(true);
    try {
      const topUpOperation = async () => {
        const { data, error } = await supabase.functions.invoke('mspace-accounts', {
          body: {
            operation: 'topupresellerclient',
            clientname: payload.clientname,
            noOfSms: payload.noOfSms
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      };

      return await handleRetry(topUpOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Top Up Reseller Client',
        details: payload,
        shouldRetry: true,
        retryFn: () => topUpResellerClient(payload)
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    querySubAccounts,
    queryResellerClients,
    topUpSubAccount,
    topUpResellerClient,
    isLoading
  };
};
