
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiCredential {
  id: string;
  service_name: string;
  api_key_encrypted?: string;
  additional_config?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSecureApiCredentials = () => {
  const queryClient = useQueryClient();

  const { data: credentials = [], isLoading, error } = useQuery({
    queryKey: ['api-credentials'],
    queryFn: async (): Promise<ApiCredential[]> => {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const saveCredential = useMutation({
    mutationFn: async ({ service_name, api_key }: { service_name: string; api_key: string }) => {
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('api_credentials')
        .upsert({
          service_name,
          api_key_encrypted: btoa(api_key), // Simple base64 encoding for demo
          user_id: user.data.user?.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-credentials'] });
      toast.success('API credentials saved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to save credentials: ${error.message}`);
    }
  });

  const getDecryptedCredential = (serviceName: string): string | null => {
    const credential = credentials.find(c => c.service_name === serviceName);
    if (!credential?.api_key_encrypted) return null;
    
    try {
      return atob(credential.api_key_encrypted); // Simple base64 decoding for demo
    } catch {
      return null;
    }
  };

  return {
    credentials,
    isLoading,
    error,
    saveCredential: saveCredential.mutateAsync,
    getDecryptedCredential,
    isSaving: saveCredential.isPending
  };
};
