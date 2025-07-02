
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserServicesData {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
  };
  services: Array<{
    id: string;
    service_name: string;
    service_type: string;
    is_activated: boolean;
    is_eligible: boolean;
    status: string;
  }>;
}

export const useUserServicesOverview = () => {
  const queryClient = useQueryClient();

  const { data: groupedByUser = [], isLoading } = useQuery({
    queryKey: ['user-services-overview'],
    queryFn: async (): Promise<UserServicesData[]> => {
      console.log('Fetching user services overview...');
      
      try {
        // Get all users
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role');
          
        if (usersError) throw usersError;
        
        // Get all services
        const { data: services, error: servicesError } = await supabase
          .from('services_catalog')
          .select('*')
          .eq('is_active', true);
          
        if (servicesError) throw servicesError;
        
        // Get all user service subscriptions (using this as proxy for activations)
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('user_service_subscriptions')
          .select('*')
          .eq('status', 'active');
          
        if (subscriptionsError) throw subscriptionsError;
        
        console.log('Manual join data:', { 
          users: users?.length || 0, 
          services: services?.length || 0, 
          subscriptions: subscriptions?.length || 0 
        });
        
        // Combine the data
        const result = (users || []).map(user => ({
          user: {
            id: user.id,
            email: user.email || '',
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role || 'user'
          },
          services: (services || []).map(service => {
            const subscription = subscriptions?.find(s => s.user_id === user.id && s.service_id === service.id);
            
            // Fix eligibility logic
            const isEligible = !service.is_premium || ['admin', 'super_admin'].includes(user.role || 'user');
            
            return {
              id: service.id,
              service_name: service.service_name,
              service_type: service.service_type,
              is_activated: subscription?.status === 'active' || false,
              is_eligible: isEligible,
              status: subscription?.status === 'active' ? 'active' : 'available'
            };
          })
        }));
        
        return result;
        
      } catch (error) {
        console.error('Error in user services overview:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 30000
  });

  const toggleService = useMutation({
    mutationFn: async ({ userId, serviceId, operation }: { userId: string; serviceId: string; operation: 'activate' | 'deactivate' }) => {
      console.log('Toggling service:', { userId, serviceId, operation });
      
      if (operation === 'activate') {
        const { data, error } = await supabase
          .from('user_service_subscriptions')
          .upsert({
            user_id: userId,
            service_id: serviceId,
            status: 'active',
            activated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('user_service_subscriptions')
          .update({ 
            status: 'inactive'
          })
          .eq('user_id', userId)
          .eq('service_id', serviceId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-services-overview'] });
      toast.success('Service status updated successfully');
    },
    onError: (error: any) => {
      console.error('Toggle service error:', error);
      toast.error(`Failed to update service: ${error.message}`);
    }
  });

  const bulkServiceOperation = useMutation({
    mutationFn: async ({ userIds, serviceId, operation }: { userIds: string[]; serviceId: string; operation: 'activate' | 'deactivate' }) => {
      console.log('Bulk operation:', { userIds, serviceId, operation });
      
      const promises = userIds.map(userId => {
        if (operation === 'activate') {
          return supabase
            .from('user_service_subscriptions')
            .upsert({
              user_id: userId,
              service_id: serviceId,
              status: 'active',
              activated_at: new Date().toISOString()
            });
        } else {
          return supabase
            .from('user_service_subscriptions')
            .update({ status: 'inactive' })
            .eq('user_id', userId)
            .eq('service_id', serviceId);
        }
      });

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Bulk operation failed for ${errors.length} users`);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-services-overview'] });
      toast.success('Bulk operation completed successfully');
    },
    onError: (error: any) => {
      console.error('Bulk operation error:', error);
      toast.error(`Bulk operation failed: ${error.message}`);
    }
  });

  return {
    groupedByUser,
    isLoading,
    toggleService: toggleService.mutateAsync,
    bulkServiceOperation: bulkServiceOperation.mutateAsync,
    isUpdating: toggleService.isPending || bulkServiceOperation.isPending
  };
};
