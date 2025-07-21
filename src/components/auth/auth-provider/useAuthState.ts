
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for:', userId);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (!retryError && retryProfile) {
          console.log('Role found on retry:', retryProfile.role);
          return retryProfile.role || 'user';
        }
        
        console.log('No profile found after retry, defaulting to user');
        return 'user';
      }

      if (profile && profile.role) {
        console.log('Role from profiles table:', profile.role);
        return profile.role;
      }

      console.log('No role found in profile, defaulting to user');
      return 'user';
    } catch (error) {
      console.error('Role fetch failed:', error);
      return 'user';
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const role = await fetchUserRole(session.user.id);
            setUserRole(role);
            console.log('User role set to:', role);
          }, 100);
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    const getSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Existing session found:', !!session);
          setSession(session);
          setUser(session.user);
          
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          console.log('Existing user role:', role);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    userRole,
    setUser,
    setSession,
    setUserRole,
    setIsLoading
  };
}
