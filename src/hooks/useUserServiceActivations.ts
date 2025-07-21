
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserServiceActivation } from '@/types/serviceActivation';

export const useUserServiceActivations = () => {
  return useQuery({
    queryKey: ['user-service-activations'],
    queryFn: async (): Promise<UserServiceActivation[]> => {
      console.log('User service activations table not found, using user_service_subscriptions instead');
      
      try {
        // Use user_service_subscriptions as a proxy for activations
        const { data: subscriptions, error } = await supabase
          .from('user_service_subscriptions')
          .select(`
            id,
            user_id,
            service_id,
            status,
            activated_at,
            created_at
          `)
          .eq('status', 'active')
          .order('activated_at', { ascending: false });

        if (error) {
          console.error('Error fetching user service subscriptions:', error);
          throw error;
        }

        // Get service details separately
        const serviceIds = [...new Set(subscriptions?.map(sub => sub.service_id).filter(Boolean))];
        const { data: services, error: servicesError } = await supabase
          .from('services_catalog')
          .select('id, service_name, service_type')
          .in('id', serviceIds);

        if (servicesError) {
          console.error('Error fetching services:', servicesError);
          throw servicesError;
        }

        // Create a map of services for quick lookup
        const servicesMap = new Map(services?.map(service => [service.id, service]) || []);

        // Transform subscriptions into activations format
        return (subscriptions || []).map(sub => {
          const service = servicesMap.get(sub.service_id);
          
          return {
            id: sub.id,
            user_id: sub.user_id || '',
            service_id: sub.service_id || '',
            is_active: sub.status === 'active',
            activated_at: sub.activated_at || sub.created_at || new Date().toISOString(),
            activated_by: sub.user_id || '',
            service: {
              id: service?.id || '',
              service_name: service?.service_name || 'Unknown Service',
              service_type: service?.service_type || 'unknown'
            }
          };
        });
      } catch (error) {
        console.error('Error in useUserServiceActivations:', error);
        // Return empty array on error
        return [];
      }
    }
  });
};
