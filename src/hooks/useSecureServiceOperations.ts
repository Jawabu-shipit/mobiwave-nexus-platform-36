
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EnhancedSecurityManager from '@/lib/enhanced-security';

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

export const useSecureServiceOperations = () => {
  const queryClient = useQueryClient();
  const securityManager = EnhancedSecurityManager.getInstance();

  const updateService = useMutation({
    mutationFn: async (service: ServiceCatalog) => {
      // Security validation
      const sanitizedService = {
        ...service,
        service_name: securityManager.sanitizeInput(service.service_name),
        description: securityManager.sanitizeInput(service.description),
        setup_fee: Number(service.setup_fee),
        monthly_fee: Number(service.monthly_fee),
        transaction_fee_amount: Number(service.transaction_fee_amount)
      };

      const { data, error } = await supabase
        .from('services_catalog')
        .update(sanitizedService)
        .eq('id', service.id)
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await securityManager.logSecurityEvent('service_updated', 'low', {
        serviceId: service.id,
        serviceName: service.service_name
      });

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

      // Log security event
      await securityManager.logSecurityEvent('service_status_changed', 'low', {
        serviceId,
        newStatus: isActive ? 'active' : 'inactive'
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-catalog'] });
      toast.success('Service status updated successfully');
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
};
