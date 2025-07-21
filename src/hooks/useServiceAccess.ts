
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServiceAccess = () => {
  const { data: serviceAccess = {}, isLoading } = useQuery({
    queryKey: ['service-access'],
    queryFn: async (): Promise<Record<string, boolean>> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return {};

      // Get user's active service subscriptions with proper relationship hint
      const { data: subscriptions, error } = await supabase
        .from('user_service_subscriptions')
        .select(`
          service_id,
          status,
          services_catalog!user_service_subscriptions_service_id_fkey(
            service_type
          )
        `)
        .eq('user_id', user.user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching service access:', error);
        return {};
      }

      // Create access map based on active subscriptions only
      const accessMap: Record<string, boolean> = {};
      
      subscriptions?.forEach(sub => {
        const serviceType = sub.services_catalog?.service_type;
        if (serviceType) {
          accessMap[serviceType] = true;
        }
      });

      return accessMap;
    }
  });

  return { serviceAccess, isLoading };
};
