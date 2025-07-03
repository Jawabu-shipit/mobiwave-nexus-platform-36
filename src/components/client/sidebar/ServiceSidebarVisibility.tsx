
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns a set of service_types that the user has access to based on their plan and subscriptions.
 */
export function useActivatedServiceTypes() {
  const { data: activatedTypes, isLoading } = useQuery({
    queryKey: ['activated-service-types'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set<string>();

      // Get active service subscriptions and approved activation requests
      const [subscriptionsResponse, activationRequestsResponse] = await Promise.all([
        supabase
          .from('user_service_subscriptions')
          .select(`
            services_catalog!inner(service_type)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active'),
        
        supabase
          .from('service_activation_requests')
          .select(`
            services_catalog!inner(service_type)
          `)
          .eq('user_id', user.id)
          .eq('status', 'approved')
      ]);

      const activatedServiceTypes = new Set<string>();

      // Add services from active subscriptions
      if (subscriptionsResponse.data) {
        subscriptionsResponse.data.forEach((sub: any) => {
          if (sub.services_catalog?.service_type) {
            activatedServiceTypes.add(sub.services_catalog.service_type);
          }
        });
      }

      // Add services from approved activation requests
      if (activationRequestsResponse.data) {
        activationRequestsResponse.data.forEach((req: any) => {
          if (req.services_catalog?.service_type) {
            activatedServiceTypes.add(req.services_catalog.service_type);
          }
        });
      }

      // Always show SMS service (it's available by default)
      activatedServiceTypes.add('sms');

      return activatedServiceTypes;
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  return {
    activatedTypes: activatedTypes || new Set<string>(),
    isLoading
  };
}
