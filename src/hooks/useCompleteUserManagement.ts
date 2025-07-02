
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  raw_user_meta_data?: any;
}

interface ProfileUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  user_type?: string;
  created_at: string;
}

interface UserCredits {
  user_id: string;
  balance: number;
  total_purchased: number;
  credits_remaining?: number;
  credits_purchased?: number;
}

export interface CompleteUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  user_type?: string;
  created_at: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  credits_remaining?: number;
  credits_purchased?: number;
  has_profile: boolean;
  raw_user_meta_data?: any;
}

export const useCompleteUserManagement = (searchTerm: string, roleFilter: string, userTypeFilter: string) => {
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['complete-user-management', searchTerm, roleFilter, userTypeFilter],
    queryFn: async (): Promise<CompleteUser[]> => {
      console.log('Fetching complete user data...');
      
      try {
        // Check if we have admin access by attempting to fetch auth users via Edge Function
        console.log('Checking admin access via Edge Function...');
        let authUsers: any[] = [];
        let hasAdminAccess = false;
        
        try {
          // Get current session for authorization
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Use the correct Edge Function URL format
            const functionUrl = `https://bhnjecmsalnqxgociwuk.supabase.co/functions/v1/admin-users`;
            
            const response = await fetch(functionUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobmplY21zYWxucXhnb2Npd3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjA0MjcsImV4cCI6MjA2MjM5NjQyN30.5pAIzKeSeIR3zC8DnccQBTh8hQuhU09NCgH4H8xnMt8'
              }
            });

            if (response.ok) {
              const result = await response.json();
              authUsers = result.users || [];
              hasAdminAccess = true;
              console.log('Admin access confirmed via Edge Function. Fetched auth users:', authUsers.length);
            } else {
              const errorText = await response.text();
              console.log('Admin access denied via Edge Function:', response.status, errorText);
            }
          } else {
            console.log('No active session found');
          }
        } catch (adminError) {
          console.log('Edge Function not accessible:', adminError);
        }

        // Always fetch profiles and credits
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*');
        if (profileError) throw profileError;
        console.log('Fetched profiles:', profiles?.length || 0);

        const { data: credits, error: creditsError } = await supabase
          .from('user_credits')
          .select('*');
        if (creditsError) throw creditsError;
        console.log('Fetched credits:', credits?.length || 0);

        // Create lookup maps
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const creditsMap = new Map(credits?.map(c => [c.user_id, c]) || []);

        let combinedUsers: CompleteUser[] = [];

        if (hasAdminAccess && authUsers.length > 0) {
          // If we have admin access, combine auth users with profiles
          console.log('Using auth + profiles mode');
          combinedUsers = authUsers.map(authUser => {
            const profile = profileMap.get(authUser.id);
            const userCredits = creditsMap.get(authUser.id);

            return {
              id: authUser.id,
              email: authUser.email || '',
              first_name: profile?.first_name || authUser.user_metadata?.first_name,
              last_name: profile?.last_name || authUser.user_metadata?.last_name,
              role: profile?.role || 'user',
              user_type: profile?.user_type || 'demo',
              created_at: authUser.created_at,
              email_confirmed_at: authUser.email_confirmed_at,
              last_sign_in_at: authUser.last_sign_in_at,
              credits_remaining: userCredits?.credits_remaining || userCredits?.balance || 0,
              credits_purchased: userCredits?.credits_purchased || userCredits?.total_purchased || 0,
              has_profile: !!profile,
              raw_user_meta_data: authUser.user_metadata
            };
          });
        } else {
          // If no admin access, work with profiles only
          console.log('Using profiles-only mode');
          combinedUsers = (profiles || []).map(profile => {
            const userCredits = creditsMap.get(profile.id);
            return {
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              role: profile.role,
              user_type: profile.user_type || 'demo',
              created_at: profile.created_at,
              email_confirmed_at: undefined, // Not available without auth data
              last_sign_in_at: undefined,
              credits_remaining: userCredits?.credits_remaining || userCredits?.balance || 0,
              credits_purchased: userCredits?.credits_purchased || userCredits?.total_purchased || 0,
              has_profile: true,
              raw_user_meta_data: {}
            };
          });
        }

        console.log('Combined users before filtering:', combinedUsers.length);
        return applyFilters(combinedUsers, searchTerm, roleFilter, userTypeFilter);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    }
  });

  const applyFilters = (userList: CompleteUser[], search: string, role: string, userType: string) => {
    let filteredUsers = userList;

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (userType !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.user_type === userType);
    }

    return filteredUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const stats = {
    total: users?.length || 0,
    with_profiles: users?.filter(u => u.has_profile).length || 0,
    without_profiles: users?.filter(u => !u.has_profile).length || 0,
    admin_users: users?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0,
    confirmed: users?.filter(u => u.email_confirmed_at).length || 0
  };

  return {
    users: users || [],
    isLoading,
    error,
    stats,
    refetch
  };
};
