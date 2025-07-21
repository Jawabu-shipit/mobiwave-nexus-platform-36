
/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Please use useSecureApiCredentials instead for all API credential management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  rate_limit: number;
}

interface CreateApiKeyData {
  key_name: string;
  permissions: string[];
  rate_limit?: number;
  expires_at?: string;
}

export const useApiKeys = () => {
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async (): Promise<ApiKey[]> => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our expected interface
      return (data || []).map(item => ({
        id: item.id,
        key_name: item.name,
        api_key: item.encrypted_key,
        permissions: [], // API keys table doesn't have permissions column
        is_active: item.is_active,
        created_at: item.created_at,
        expires_at: item.expires_at,
        last_used_at: item.last_used,
        rate_limit: 1000 // Default rate limit since it's not in the schema
      }));
    }
  });

  const createApiKey = useMutation({
    mutationFn: async (keyData: CreateApiKeyData): Promise<ApiKey> => {
      // Generate a random API key
      const apiKey = `mk_${keyData.key_name.includes('live') ? 'live' : 'test'}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: keyData.key_name,
          encrypted_key: apiKey,
          key_hash: btoa(apiKey), // Simple hash for demo
          service: 'mspace',
          expires_at: keyData.expires_at,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        key_name: data.name,
        api_key: data.encrypted_key,
        permissions: keyData.permissions,
        is_active: data.is_active,
        created_at: data.created_at,
        expires_at: data.expires_at,
        last_used_at: data.last_used,
        rate_limit: keyData.rate_limit || 1000
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create API key: ${error.message}`);
    }
  });

  const toggleApiKey = useMutation({
    mutationFn: async ({ keyId, isActive }: { keyId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: isActive })
        .eq('id', keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update API key: ${error.message}`);
    }
  });

  const deleteApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete API key: ${error.message}`);
    }
  });

  const getApiUsage = async (keyId: string) => {
    // Since api_usage table doesn't exist, return empty array
    console.log('API usage tracking not implemented yet for key:', keyId);
    return [];
  };

  return {
    apiKeys,
    isLoading,
    createApiKey: createApiKey.mutateAsync,
    toggleApiKey: toggleApiKey.mutateAsync,
    deleteApiKey: deleteApiKey.mutateAsync,
    getApiUsage,
    isCreating: createApiKey.isPending
  };
};
