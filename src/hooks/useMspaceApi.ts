
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
  api_key: string;
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
  // Get API credentials from the database
  const { data: credentials } = useQuery({
    queryKey: ['mspace-credentials'],
    queryFn: async (): Promise<ApiCredentials | null> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('api_credentials')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_name', 'mspace')
          .eq('is_active', true)
          .single();

        if (error || !data) return null;

        // Extract credentials from additional_config
        const config = data.additional_config as any;
        return {
          api_key: config?.api_key || '',
          username: config?.username || '',
          sender_id: config?.sender_id || ''
        };
      } catch (error) {
        console.error('Error fetching credentials:', error);
        return null;
      }
    }
  });

  const sendSMS = useMutation({
    mutationFn: async ({ recipients, message, senderId, campaignId }: SendSMSParams) => {
      if (!credentials?.api_key || !credentials?.username) {
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

      if (error) throw error;
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
      if (!credentials?.api_key || !credentials?.username) {
        throw new Error('Mspace API credentials not configured');
      }

      try {
        const response = await fetch(
          `https://api.mspace.co.ke/smsapi/v2/balance/apikey=${credentials.api_key}/username=${credentials.username}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to check balance');
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        throw new Error(`Balance check failed: ${error.message}`);
      }
    },
    onSuccess: (data) => {
      toast.success(`Balance: ${data.balance || 'N/A'} SMS credits`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const getDeliveryReport = useMutation({
    mutationFn: async (messageId: string): Promise<MspaceDeliveryMessage | null> => {
      if (!credentials?.api_key || !credentials?.username) {
        throw new Error('Mspace API credentials not configured');
      }

      try {
        const response = await fetch('https://api.mspace.co.ke/smsapi/v2/deliveryreport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'apikey': credentials.api_key
          },
          body: JSON.stringify({
            username: credentials.username,
            messageId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get delivery report');
        }

        const data = await response.json();
        
        // Handle the documented response structure
        if (data.message && Array.isArray(data.message) && data.message.length > 0) {
          return data.message[0];
        }
        
        return null;
      } catch (error: any) {
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

  return {
    sendSMS,
    checkBalance,
    getDeliveryReport,
    isLoading: sendSMS.isPending || checkBalance.isPending || getDeliveryReport.isPending,
    hasCredentials: !!(credentials?.api_key && credentials?.username)
  };
};
