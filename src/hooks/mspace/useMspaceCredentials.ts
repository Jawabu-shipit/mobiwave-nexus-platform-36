
import { supabase } from '@/integrations/supabase/client';

interface MspaceCredentials {
  api_key: string;
  username: string;
  sender_id: string;
}

export const useMspaceCredentials = () => {
  const getApiCredentials = async (): Promise<MspaceCredentials> => {
    const { data: credentials, error } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('service_name', 'mspace')
      .eq('is_active', true)
      .single();

    if (error || !credentials) {
      throw new Error('No active Mspace API credentials found. Please configure your API settings.');
    }

    const config = credentials.additional_config as any;
    return {
      api_key: config?.api_key || credentials.api_key_encrypted || '',
      username: config?.username || '',
      sender_id: config?.sender_id || ''
    };
  };

  return { getApiCredentials };
};
