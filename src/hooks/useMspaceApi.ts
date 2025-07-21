
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendSMSParams {
  recipients: string[];
  message: string;
  senderId?: string;
  campaignId?: string;
}

interface ApiCredentials {
  username: string;
  sender_id: string;
}

interface MspaceDeliveryMessage {
  messageId: string;
  recipient: string;
  status: number;
  statusDescription: string;
}

export const useMspaceApi = () => {
  // Get API credentials from the database - we only need username and sender_id
  // The actual API key is securely stored and used only in the backend functions
  const { data: credentials } = useQuery({
    queryKey: ['mspace-credentials'],
    queryFn: async (): Promise<ApiCredentials | null> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.id) {
          console.error('No user or user.id found for credentials query');
          return null;
        }
        console.log('[useMspaceApi] Querying api_credentials with:', {
          user_id: user.id,
          service_name: 'mspace',
          is_active: true
        });

        let { data, error, status } = await supabase
          .from('api_credentials')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_name', 'mspace')
          .eq('is_active', true)
          .single();

        if (error && status === 406) {
          // Try with string 'true' for is_active
          console.warn('[useMspaceApi] 406 error, retrying with is_active as string');
          ({ data, error, status } = await supabase
            .from('api_credentials')
            .select('*')
            .eq('user_id', user.id)
            .eq('service_name', 'mspace')
            // Cast 'true' as any to bypass TS error for fallback
            .eq('is_active', 'true' as any)
            .single());
        }

        if (error || !data) {
          console.error('[useMspaceApi] Error or no data from api_credentials:', error);
          return null;
        }

        // Extract credentials from additional_config
        const config = data.additional_config as any;
        
        // Check if we have the required fields
        if (!config?.username) {
          console.error('[useMspaceApi] Missing username in credentials');
          return null;
        }
        
        // We don't need the API key in the frontend - it's used securely in the backend
        return {
          username: config?.username || '',
          sender_id: config?.sender_id || ''
        };
      } catch (error) {
        console.error('Error fetching credentials:', error);
        return null;
      }
    }
  });

  // Check if credentials exist in the database
  const checkCredentialsExist = useMutation({
    mutationFn: async (): Promise<boolean> => {
      try {
        const { data, error } = await supabase.functions.invoke('mspace-accounts', {
          body: { operation: 'checkCredentials' }
        });
        
        if (error) {
          console.error('Error checking credentials:', error);
          return false;
        }
        
        return data?.exists === true;
      } catch (error) {
        console.error('Error checking if credentials exist:', error);
        return false;
      }
    }
  });

  const sendSMS = useMutation({
    mutationFn: async ({ recipients, message, senderId, campaignId }: SendSMSParams) => {
      if (!credentials?.username) {
        throw new Error('Mspace API credentials not configured. Please configure them in Settings.');
      }

      const { data, error } = await supabase.functions.invoke('mspace-sms', {
        body: {
          recipients,
          message,
          senderId: senderId || credentials.sender_id,
          campaignId
        }
      });

      if (error) {
        console.error('Error sending SMS:', error);
        throw new Error(`Failed to send SMS: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data?.summary) {
        const { successful, failed, total } = data.summary;
        if (successful > 0) {
          toast.success(`${successful}/${total} SMS sent successfully`);
        }
        if (failed > 0) {
          toast.error(`${failed}/${total} SMS failed to send`);
        }
      } else {
        toast.success('SMS sent successfully');
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to send SMS: ${error.message}`);
    }
  });

  const checkBalance = useMutation({
    mutationFn: async () => {
      try {
        console.log('Checking balance via Supabase function');
        
        const { data, error } = await supabase.functions.invoke('mspace-balance', {});
        
        if (error) {
          console.error('Error checking balance:', error);
          
          // Try to parse the error response for more details
          try {
            const errorData = JSON.parse(error.message);
            throw new Error(`Failed to check balance: ${errorData.error} (${errorData.errorType})`);
          } catch (parseError) {
            // If we can't parse the error, just use the original message
            throw new Error(`Failed to check balance: ${error.message}`);
          }
        }
        
        if (!data) {
          console.error('No data returned from balance check');
          throw new Error('No data returned from balance check');
        }
        
        if (typeof data.balance === 'undefined') {
          console.error('Invalid balance response format:', data);
          throw new Error('Invalid response format: missing balance field');
        }
        
        // Ensure balance is a number
        const balance = typeof data.balance === 'string' 
          ? parseInt(data.balance) 
          : data.balance;
          
        if (isNaN(balance)) {
          throw new Error(`Invalid balance value: ${data.balance}`);
        }
        
        // Normalize the response
        const result = {
          ...data,
          balance,
          currency: data.currency || 'KES',
          timestamp: data.timestamp || new Date().toISOString()
        };
        
        console.log('Successfully checked balance:', result);
        return result;
      } catch (error: any) {
        console.error('Balance check error:', error);
        throw new Error(`Balance check failed: ${error.message}`);
      }
    },
    onSuccess: (data) => {
      toast.success(`Balance: ${data.balance.toLocaleString()} ${data.currency || ''} SMS credits`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const getDeliveryReport = useMutation({
    mutationFn: async (messageId: string): Promise<MspaceDeliveryMessage | null> => {
      try {
        console.log('Fetching delivery report via Supabase function for message ID:', messageId);
        
        const { data, error } = await supabase.functions.invoke('mspace-sms', {
          body: { 
            operation: 'deliveryreport',
            messageId
          }
        });
        
        if (error) {
          console.error('Error fetching delivery report:', error);
          throw new Error(`Failed to get delivery report: ${error.message}`);
        }
        
        console.log('Delivery report response:', data);
        
        // Handle the documented response structure
        if (data?.message && Array.isArray(data.message) && data.message.length > 0) {
          return data.message[0];
        }
        
        return null;
      } catch (error: any) {
        console.error('Delivery report error:', error);
        throw new Error(`Delivery report failed: ${error.message}`);
      }
    },
    onSuccess: (data) => {
      if (data) {
        const statusText = data.status === 3 ? 'Delivered' : data.statusDescription;
        toast.success(`Message Status: ${statusText}`);
      } else {
        toast.info('No delivery report found for this message');
      }
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const getResellerClients = useMutation({
    mutationFn: async () => {
      try {
        console.log('Fetching reseller clients via Supabase function');
        
        const { data, error } = await supabase.functions.invoke('mspace-accounts', {
          body: { 
            operation: 'queryresellerclients'
          }
        });
        
        if (error) {
          console.error('Error fetching reseller clients:', error);
          
          // Try to parse the error response for more details
          try {
            const errorData = JSON.parse(error.message);
            throw new Error(`Failed to fetch reseller clients: ${errorData.error} (${errorData.errorType})`);
          } catch (parseError) {
            // If we can't parse the error, just use the original message
            throw new Error(`Failed to fetch reseller clients: ${error.message}`);
          }
        }
        
        if (!data) {
          console.error('No data returned from reseller clients request');
          return []; // Return empty array instead of throwing
        }
        
        console.log('Raw reseller clients data:', data);
        
        // Handle different response formats
        let clientsData = [];
        
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
          } else {
            console.warn('Could not find clients array in response:', data);
            return []; // Return empty array instead of throwing
          }
        } else {
          console.error('Invalid response format:', data);
          return []; // Return empty array instead of throwing
        }
        
        // Normalize client data
        const normalizedClients = clientsData.map((client: any) => {
          // Handle different property names
          const clientName = client.clientUserName || client.clientname || client.username || '';
          const smsBalance = client.smsBalance || client.balance || client.credits || '0';
          
          return {
            clientUserName: clientName,
            smsBalance: typeof smsBalance === 'number' ? String(smsBalance) : smsBalance,
            status: client.status || 'active'
          };
        }).filter((client: any) => client.clientUserName); // Filter out any clients without a name
        
        console.log('Successfully fetched and normalized reseller clients:', normalizedClients);
        return normalizedClients;
      } catch (error: any) {
        console.error('Reseller clients error:', error);
        throw new Error(`Failed to fetch reseller clients: ${error.message}`);
      }
    },
    onSuccess: (data) => {
      if (data.length === 0) {
        toast.info('No reseller clients found');
      } else {
        toast.success(`Found ${data.length} reseller clients`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  return {
    sendSMS,
    checkBalance,
    getDeliveryReport,
    getResellerClients,
    checkCredentialsExist,
    isLoading: sendSMS.isPending || checkBalance.isPending || getDeliveryReport.isPending || getResellerClients.isPending,
    hasCredentials: !!credentials?.username,
    credentials
  };
};
