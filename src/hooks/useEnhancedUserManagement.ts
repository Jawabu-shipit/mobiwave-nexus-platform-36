
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMspaceUsers } from './useMspaceUsers';

interface DatabaseUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  role: string;
  user_type: string;
  source: 'database';
}

interface MspaceUser {
  id: string;
  mspace_client_id: string;
  client_name: string;
  username?: string;
  phone?: string;
  email?: string;
  balance: number;
  status: string;
  created_date?: string;
  last_login?: string;
  user_type: 'mspace_client';
  source: 'mspace_api';
  fetched_at: string;
  updated_at: string;
}

export type CombinedUser = DatabaseUser | MspaceUser;

type ValidRole = 'super_admin' | 'admin' | 'manager' | 'user';

export const useEnhancedUserManagement = (searchTerm: string, roleFilter: string, userTypeFilter: string) => {
  // Get database users
  const { data: databaseUsers, isLoading: isLoadingDatabase } = useQuery({
    queryKey: ['enhanced-users-database', searchTerm, roleFilter],
    queryFn: async (): Promise<DatabaseUser[]> => {
      let query = supabase
        .from('profiles')
        .select('*');

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        const validRoles: ValidRole[] = ['super_admin', 'admin', 'manager', 'user'];
        if (validRoles.includes(roleFilter as ValidRole)) {
          query = query.eq('role', roleFilter as ValidRole);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(user => ({
        ...user,
        source: 'database' as const,
        user_type: user.user_type || (user.role === 'super_admin' || user.role === 'admin' ? 'real' : 'demo')
      }));
    }
  });

  // Get Mspace users
  const { users: mspaceUsers, isLoading: isLoadingMspace } = useMspaceUsers();

  // Combine and filter users
  const { data: combinedUsers, isLoading: isProcessing } = useQuery({
    queryKey: ['combined-users', databaseUsers, mspaceUsers, userTypeFilter, searchTerm],
    queryFn: async (): Promise<CombinedUser[]> => {
      const dbUsers = databaseUsers || [];
      const transformedMspaceUsers: MspaceUser[] = (mspaceUsers || []).map(user => ({
        ...user,
        source: 'mspace_api' as const,
        user_type: 'mspace_client' as const
      }));

      let combined: CombinedUser[] = [...dbUsers, ...transformedMspaceUsers];

      // Filter by user type
      if (userTypeFilter !== 'all') {
        combined = combined.filter(user => {
          if (userTypeFilter === 'real') {
            return user.user_type === 'real' || user.user_type === 'mspace_client';
          }
          if (userTypeFilter === 'demo') {
            return user.user_type === 'demo';
          }
          if (userTypeFilter === 'mspace_client') {
            return user.user_type === 'mspace_client';
          }
          return true;
        });
      }

      // Additional search filtering for Mspace users
      if (searchTerm && searchTerm.length > 0) {
        combined = combined.filter(user => {
          if (user.source === 'mspace_api') {
            const mUser = user as MspaceUser;
            return (
              mUser.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              mUser.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              mUser.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              mUser.mspace_client_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return true; // Database users already filtered in the query
        });
      }

      return combined;
    },
    enabled: !!databaseUsers || !!mspaceUsers
  });

  const isLoading = isLoadingDatabase || isLoadingMspace || isProcessing;

  const stats = {
    total: combinedUsers?.length || 0,
    real: combinedUsers?.filter(u => u.user_type === 'real' || u.user_type === 'mspace_client').length || 0,
    demo: combinedUsers?.filter(u => u.user_type === 'demo').length || 0,
    mspace: combinedUsers?.filter(u => u.source === 'mspace_api').length || 0,
    database: combinedUsers?.filter(u => u.source === 'database').length || 0
  };

  return {
    users: combinedUsers || [],
    isLoading,
    stats
  };
};
