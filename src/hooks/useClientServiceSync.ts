
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface ClientServiceData {
  id: string;
  service_name: string;
  service_type: string;
  is_active: boolean;
  activated_at: string;
  configuration: any;
  setup_fee_paid: boolean;
  monthly_billing_active: boolean;
}

export const useClientServiceSync = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-services', user?.id],
    queryFn: async (): Promise<ClientServiceData[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_service_subscriptions')
        .select(`
          id,
          service_id,
          status,
          activated_at,
          configuration,
          setup_fee_paid,
          monthly_billing_active,
          service:services_catalog!user_service_subscriptions_service_id_fkey(
            id,
            service_name,
            service_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('activated_at', { ascending: false });

      if (error) {
        console.error('Error fetching client services:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        service_name: item.service?.service_name || '',
        service_type: item.service?.service_type || '',
        is_active: item.status === 'active',
        activated_at: item.activated_at || '',
        configuration: item.configuration || {},
        setup_fee_paid: item.setup_fee_paid || false,
        monthly_billing_active: item.monthly_billing_active || false
      }));
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });
};
