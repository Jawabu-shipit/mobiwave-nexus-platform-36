
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserServiceActivation {
  id: string;
  user_id: string;
  service_id: string;
  is_active: boolean;
  activated_at: string;
  activated_by: string;
  service: {
    id: string;
    service_name: string;
    service_type: string;
  };
}

export const useMyActivatedServices = () => {
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['my-activated-services'],
    queryFn: async (): Promise<UserServiceActivation[]> => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return [];

      // Get user subscriptions first
      const { data: subscriptions, error: subError } = await supabase
        .from('user_service_subscriptions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('status', 'active');

      if (subError) throw subError;
      if (!subscriptions || subscriptions.length === 0) return [];

      // Get service details separately
      const serviceIds = subscriptions.map(sub => sub.service_id).filter(Boolean);
      if (serviceIds.length === 0) return [];

      const { data: services, error: servicesError } = await supabase
        .from('services_catalog')
        .select('id, service_name, service_type')
        .in('id', serviceIds);

      if (servicesError) throw servicesError;

      // Create a map of services for quick lookup
      const servicesMap = new Map(services?.map(service => [service.id, service]) || []);

      // Transform subscriptions into activations format
      const activations: UserServiceActivation[] = subscriptions.map(sub => {
        const service = servicesMap.get(sub.service_id);
        
        return {
          id: sub.id,
          user_id: sub.user_id || '',
          service_id: sub.service_id || '',
          is_active: sub.status === 'active',
          activated_at: sub.activated_at || sub.created_at,
          activated_by: sub.user_id || '',
          service: {
            id: service?.id || '',
            service_name: service?.service_name || 'Unknown Service',
            service_type: service?.service_type || 'unknown'
          }
        };
      });

      return activations;
    }
  });

  return {
    services,
    data: services, // Alias for backward compatibility
    isLoading,
    error
  };
};
