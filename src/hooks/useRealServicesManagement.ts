
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Service {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  transaction_fee_type: string;
  transaction_fee_amount: number;
  is_active: boolean;
  is_premium: boolean;
  provider: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  activated_at: string;
  configuration: any;
  setup_fee_paid: boolean;
  monthly_billing_active: boolean;
  service: Service;
}

export const useRealServicesManagement = () => {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services-catalog'],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from('services_catalog')
        .select('*')
        .order('service_name');

      if (error) throw error;
      return data || [];
    }
  });

  const { data: userSubscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async (): Promise<UserSubscription[]> => {
      // Get subscriptions first
      const { data: subscriptions, error: subError } = await supabase
        .from('user_service_subscriptions')
        .select('*');

      if (subError) throw subError;
      if (!subscriptions || subscriptions.length === 0) return [];

      // Get service details separately
      const serviceIds = [...new Set(subscriptions.map(sub => sub.service_id).filter(Boolean))];
      if (serviceIds.length === 0) return [];

      const { data: services, error: servicesError } = await supabase
        .from('services_catalog')
        .select('*')
        .in('id', serviceIds);

      if (servicesError) throw servicesError;

      // Create a map of services for quick lookup
      const servicesMap = new Map(services?.map(service => [service.id, service]) || []);

      // Transform the data to match expected interface
      const transformedData: UserSubscription[] = subscriptions.map(subscription => {
        const service = servicesMap.get(subscription.service_id);
        
        return {
          ...subscription,
          service: service ? {
            id: service.id,
            service_name: service.service_name,
            service_type: service.service_type,
            description: service.description || '',
            setup_fee: service.setup_fee || 0,
            monthly_fee: service.monthly_fee || 0,
            transaction_fee_type: service.transaction_fee_type || 'none',
            transaction_fee_amount: service.transaction_fee_amount || 0,
            is_active: service.is_active || false,
            is_premium: service.is_premium || false,
            provider: service.provider || 'mspace'
          } : {
            id: '',
            service_name: 'Unknown Service',
            service_type: 'unknown',
            description: '',
            setup_fee: 0,
            monthly_fee: 0,
            transaction_fee_type: 'none',
            transaction_fee_amount: 0,
            is_active: false,
            is_premium: false,
            provider: 'mspace'
          }
        };
      });

      return transformedData;
    }
  });

  const toggleServiceStatus = useMutation({
    mutationFn: async ({ subscriptionId, newStatus }: { subscriptionId: string; newStatus: string }) => {
      const { data, error } = await supabase
        .from('user_service_subscriptions')
        .update({ status: newStatus })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      toast.success('Service status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update service status: ${error.message}`);
    }
  });

  return {
    services,
    userSubscriptions,
    isLoading: servicesLoading || subscriptionsLoading,
    toggleServiceStatus: toggleServiceStatus.mutateAsync,
    isUpdating: toggleServiceStatus.isPending
  };
};
