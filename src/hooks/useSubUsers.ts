import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SubUser {
  id: string;
  parent_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  permissions: any;
  is_active: boolean;
  credits_allocated: number;
  credits_used: number;
  service_access: any;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

interface SubUserFilters {
  is_active?: boolean;
  role?: string;
  limit?: number;
  offset?: number;
}

export const useSubUsers = (filters?: SubUserFilters) => {
  const queryClient = useQueryClient();

  // Get sub-users
  const { data: subUsers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sub-users', filters],
    queryFn: async (): Promise<SubUser[]> => {
      const { data, error } = await supabase.functions.invoke('sub-users', {
        body: {
          action: 'list',
          filters
        }
      });

      if (error) throw error;
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create sub-user
  const createSubUser = useMutation({
    mutationFn: async (subUser: Omit<SubUser, 'id' | 'parent_user_id' | 'created_at' | 'updated_at' | 'credits_used' | 'last_login_at'>) => {
      const { data, error } = await supabase.functions.invoke('sub-users', {
        body: {
          action: 'create',
          sub_user: subUser
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-users'] });
      toast.success('Sub-user created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create sub-user: ${error.message}`);
    }
  });

  // Update sub-user
  const updateSubUser = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SubUser> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('sub-users', {
        body: {
          action: 'update',
          sub_user_id: id,
          sub_user: updates
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-users'] });
      toast.success('Sub-user updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update sub-user: ${error.message}`);
    }
  });

  // Allocate credits
  const allocateCredits = useMutation({
    mutationFn: async ({ subUserId, amount }: { subUserId: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke('sub-users', {
        body: {
          action: 'allocateCredits',
          sub_user_id: subUserId,
          credits_amount: amount
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-users'] });
      toast.success('Credits allocated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to allocate credits: ${error.message}`);
    }
  });

  // Delete sub-user
  const deleteSubUser = useMutation({
    mutationFn: async (subUserId: string) => {
      const { data, error } = await supabase.functions.invoke('sub-users', {
        body: {
          action: 'delete',
          sub_user_id: subUserId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-users'] });
      toast.success('Sub-user deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete sub-user: ${error.message}`);
    }
  });

  return {
    subUsers,
    isLoading,
    error,
    refetch,
    createSubUser: createSubUser.mutateAsync,
    updateSubUser: updateSubUser.mutateAsync,
    allocateCredits: allocateCredits.mutateAsync,
    deleteSubUser: deleteSubUser.mutateAsync,
    isCreating: createSubUser.isPending,
    isUpdating: updateSubUser.isPending,
    isAllocating: allocateCredits.isPending,
    isDeleting: deleteSubUser.isPending
  };
};