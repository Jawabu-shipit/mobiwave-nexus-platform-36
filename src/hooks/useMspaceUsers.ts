
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MspaceUser {
  id: string;
  mspace_client_id: string;
  client_name: string;
  username?: string;
  phone?: string;
  email?: string;
  balance: number;
  status: string;
  user_type: string;
  created_date?: string;
  last_login?: string;
  created_at: string;
  fetched_at: string;
  updated_at: string;
}

export const useMspaceUsers = () => {
  const queryClient = useQueryClient();

  // Get users from profiles table to simulate M-Space users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['mspace-users'],
    queryFn: async (): Promise<MspaceUser[]> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform profiles into simulated M-Space users
      const mspaceUsers: MspaceUser[] = (profiles || []).map(profile => ({
        id: profile.id,
        mspace_client_id: `MSPACE_${profile.id.slice(0, 8)}`,
        client_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Unknown User',
        username: profile.email?.split('@')[0],
        phone: profile.phone || undefined,
        email: profile.email || undefined,
        balance: Math.random() * 1000, // Simulated balance
        status: 'active',
        user_type: profile.user_type || 'demo',
        created_date: profile.created_at,
        last_login: undefined,
        created_at: profile.created_at,
        fetched_at: new Date().toISOString(),
        updated_at: profile.updated_at || profile.created_at
      }));

      return mspaceUsers;
    }
  });

  const refreshUserData = useMutation({
    mutationFn: async (userId: string) => {
      // Simulate refreshing user data from M-Space
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'User data refreshed successfully' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mspace-users'] });
      toast.success('User data refreshed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to refresh user data: ${error.message}`);
    }
  });

  const updateUserBalance = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      // Simulate updating user balance in M-Space
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, newBalance: amount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mspace-users'] });
      toast.success('User balance updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update user balance: ${error.message}`);
    }
  });

  const fetchAndSyncClients = useMutation({
    mutationFn: async () => {
      // Simulate fetching from M-Space API
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'Clients synced successfully' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mspace-users'] });
      toast.success('M-Space clients synced successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to sync clients: ${error.message}`);
    }
  });

  return {
    users,
    storedMspaceUsers: users, // Alias for backward compatibility
    isLoading,
    isLoadingStored: isLoading, // Alias for backward compatibility
    error,
    refreshUserData,
    updateUserBalance,
    fetchAndSyncClients
  };
};
