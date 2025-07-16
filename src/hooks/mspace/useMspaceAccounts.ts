
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/components/ui/use-toast';

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
        console.log('Fetching reseller clients...');
        
        const { data, error } = await supabase.functions.invoke('mspace-accounts', {
          body: { operation: 'queryresellerclients' }
        });
        
        if (error) {
          console.error('MSpace accounts error:', error);
          
          // Try to parse the error response for more details
          try {
            const errorData = JSON.parse(error.message);
            throw new Error(`Failed to fetch reseller clients: ${errorData.error} (${errorData.errorType})`);
          } catch (parseError) {
            // If we can't parse the error, just use the original message
            throw new Error(error.message || 'Failed to fetch reseller clients');
          }
        }
        
        if (!data) {
          console.warn('No data returned from MSpace accounts API');
          toast({
            title: 'Warning',
            description: 'No data returned from MSpace accounts API.',
            variant: 'default'
          });
          return [];
        }
        
        console.log('Raw reseller clients data:', data);
        
        // Handle different response formats
        let clientsData: ResellerClientApiResponse[] = [];
        
        if (Array.isArray(data)) {
          // Direct array of clients
          clientsData = data;
        } else if (data.resellerClients && Array.isArray(data.resellerClients)) {
          // Object with resellerClients array
          clientsData = data.resellerClients;
        } else if (typeof data === 'object' && data !== null) {
          // Try to find any array property that might contain clients
          const arrayProps = Object.entries(data)
            .filter(([_, value]) => Array.isArray(value))
            .map(([key, value]) => ({ key, value }));
            
          if (arrayProps.length > 0) {
            // Use the first array property found
            console.log(`Found potential clients array in property: ${arrayProps[0].key}`);
            clientsData = arrayProps[0].value;
          }
        }
        
        // Normalize client data
        const clients = clientsData.map((client: any) => {
          // Handle different property names
          const clientName = client.clientUserName || client.clientname || client.username || '';
          const smsBalance = client.smsBalance || client.balance || client.credits || '0';
          
          return {
            clientname: clientName,
            balance: typeof smsBalance === 'number' ? String(smsBalance) : smsBalance,
            status: client.status || 'active'
          };
        }).filter(client => client.clientname); // Filter out any clients without a name
        
        console.log('Normalized reseller clients:', clients);
        
        if (clients.length === 0) {
          toast({
            title: 'Info',
            description: 'No reseller clients found for your Mspace account.',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Success',
            description: `Found ${clients.length} reseller clients.`,
            variant: 'default'
          });
        }
        
        return clients;
      };

      return await handleRetry(clientsOperation);
    } catch (error: any) {
      console.error('Query reseller clients failed:', error.message);
      
      handleError(error, {
        operation: 'Query Reseller Clients',
        shouldRetry: true,
        retryFn: () => queryResellerClients()
      });
      
      // Show error toast
      toast({
        title: 'Error',
        description: `Failed to fetch reseller clients: ${error.message}`,
        variant: 'destructive'
      });
      
      // Return empty array instead of throwing to prevent UI crashes
      return [];
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
