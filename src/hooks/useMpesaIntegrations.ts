
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MpesaIntegration {
  id: string;
  user_id: string;
  consumer_key?: string;
  consumer_secret?: string;
  shortcode?: string;
  passkey?: string;
  callback_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMpesaIntegrations = () => {
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading, error } = useQuery({
    queryKey: ['mpesa-integrations'],
    queryFn: async (): Promise<MpesaIntegration[]> => {
      const { data, error } = await supabase
        .from('mspace_pesa_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createIntegration = useMutation({
    mutationFn: async (integrationData: Omit<MpesaIntegration, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mspace_pesa_integrations')
        .insert([integrationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpesa-integrations'] });
      toast.success('M-Pesa integration created successfully');
    }
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MpesaIntegration> & { id: string }) => {
      const { data, error } = await supabase
        .from('mspace_pesa_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpesa-integrations'] });
      toast.success('M-Pesa integration updated successfully');
    }
  });

  const deleteIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from('mspace_pesa_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpesa-integrations'] });
      toast.success('M-Pesa integration deleted successfully');
    }
  });

  return {
    integrations,
    isLoading,
    error,
    createIntegration,
    updateIntegration,
    deleteIntegration
  };
};
