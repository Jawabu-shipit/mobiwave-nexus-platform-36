
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  credits_purchased: number;
  created_at: string;
  updated_at: string;
}

export const useUserCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading, error } = useQuery({
    queryKey: ['user-credits'],
    queryFn: async (): Promise<UserCredits> => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const purchaseCredits = useMutation({
    mutationFn: async (amount: number) => {
      const { data, error } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: (credits?.credits_remaining || 0) + amount,
          credits_purchased: (credits?.credits_purchased || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', credits?.user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      toast.success('Credits purchased successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to purchase credits: ${error.message}`);
    }
  });

  const refetch = async () => {
    return queryClient.refetchQueries({ queryKey: ['user-credits'] });
  };

  return {
    credits,
    data: credits, // For backward compatibility
    isLoading,
    error,
    purchaseCredits,
    refetch
  };
};
