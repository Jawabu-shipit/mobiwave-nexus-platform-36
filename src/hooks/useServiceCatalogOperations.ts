
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServiceCatalog {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  transaction_fee_type: string;
  transaction_fee_amount: number;
  is_premium: boolean;
  is_active: boolean;
  provider: string;
}

export function useServiceCatalogOperations() {
  const queryClient = useQueryClient();

  const updateService = useMutation({
    mutationFn: async (service: ServiceCatalog) => {
      const { data, error } = await supabase
        .from('services_catalog')
        .update({
          service_name: service.service_name,
          service_type: service.service_type,
          description: service.description,
          setup_fee: service.setup_fee,
          monthly_fee: service.monthly_fee,
          transaction_fee_type: service.transaction_fee_type,
          transaction_fee_amount: service.transaction_fee_amount,
          is_premium: service.is_premium,
          is_active: service.is_active,
          provider: service.provider
        })
        .eq('id', service.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-catalog'] });
      toast.success('Service updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update service: ${error.message}`);
    }
  });

  const toggleServiceStatus = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('services_catalog')
        .update({ is_active: isActive })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services-catalog'] });
      toast.success(`Service ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update service status: ${error.message}`);
    }
  });

  return {
    updateService: updateService.mutateAsync,
    toggleServiceStatus: toggleServiceStatus.mutateAsync,
    isUpdating: updateService.isPending || toggleServiceStatus.isPending
  };
}
