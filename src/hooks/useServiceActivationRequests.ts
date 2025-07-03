
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceActivationRequest {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  business_justification: string;
  expected_usage: string;
  priority: string;
  created_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
  service: {
    service_name: string;
    service_type: string;
  };
}

export const useServiceActivationRequests = () => {
  const queryClient = useQueryClient();

  // For admin - get all requests
  const { data: allRequests = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['service-activation-requests-all'],
    queryFn: async (): Promise<ServiceActivationRequest[]> => {
      // Get requests first
      const { data: requests, error: requestsError } = await supabase
        .from('service_activation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      if (!requests || requests.length === 0) return [];

      // Get user profiles separately
      const userIds = [...new Set(requests.map(req => req.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get service details separately
      const serviceIds = [...new Set(requests.map(req => req.service_id).filter(Boolean))];
      const { data: services, error: servicesError } = await supabase
        .from('services_catalog')
        .select('id, service_name, service_type')
        .in('id', serviceIds);

      if (servicesError) throw servicesError;

      // Create maps for quick lookup
      const profilesMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);
      const servicesMap = new Map(services?.map(service => [service.id, service]) || []);

      // Transform the data to match expected interface
      const transformedData: ServiceActivationRequest[] = requests.map(request => {
        const profile = profilesMap.get(request.user_id);
        const service = servicesMap.get(request.service_id);
        
        return {
          ...request,
          user: {
            email: profile?.email || '',
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || ''
          },
          service: {
            service_name: service?.service_name || '',
            service_type: service?.service_type || ''
          }
        };
      });

      return transformedData;
    }
  });

  // For users - get their own requests
  const { data: userRequests = [], isLoading: isLoadingUser } = useQuery({
    queryKey: ['service-activation-requests-user'],
    queryFn: async (): Promise<Partial<ServiceActivationRequest>[]> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Get user's requests
      const { data: requests, error: requestsError } = await supabase
        .from('service_activation_requests')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      if (!requests || requests.length === 0) return [];

      // Get service details separately
      const serviceIds = [...new Set(requests.map(req => req.service_id).filter(Boolean))];
      const { data: services, error: servicesError } = await supabase
        .from('services_catalog')
        .select('id, service_name, service_type')
        .in('id', serviceIds);

      if (servicesError) throw servicesError;

      // Create map for quick lookup
      const servicesMap = new Map(services?.map(service => [service.id, service]) || []);

      // Transform the data to match expected interface
      const transformedData = requests.map(request => {
        const service = servicesMap.get(request.service_id);
        
        return {
          ...request,
          service: {
            service_name: service?.service_name || '',
            service_type: service?.service_type || ''
          }
        };
      });

      return transformedData;
    }
  });

  const submitRequest = useMutation({
    mutationFn: async ({
      serviceId,
      businessJustification,
      expectedUsage,
      priority = 'medium'
    }: {
      serviceId: string;
      businessJustification: string;
      expectedUsage: string;
      priority?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('service_activation_requests')
        .insert({
          user_id: user.user.id,
          service_id: serviceId,
          business_justification: businessJustification,
          expected_usage: expectedUsage,
          priority,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-activation-requests-user'] });
      toast.success('Service activation request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to submit request: ${error.message}`);
    }
  });

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, adminNotes }: { requestId: string; adminNotes?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('service_activation_requests')
        .select('user_id, service_id')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Create the service subscription
      const { error: subscriptionError } = await supabase
        .from('user_service_subscriptions')
        .insert({
          user_id: request.user_id,
          service_id: request.service_id,
          status: 'active',
          activated_at: new Date().toISOString()
        });

      if (subscriptionError) throw subscriptionError;

      // Update the request status
      const { data, error } = await supabase
        .from('service_activation_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          approved_by: user.user.id,
          admin_notes: adminNotes
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-activation-requests-all'] });
      queryClient.invalidateQueries({ queryKey: ['user-service-access'] });
      queryClient.invalidateQueries({ queryKey: ['activated-service-types'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      toast.success('Request approved and service activated!');
    },
    onError: (error: any) => {
      toast.error(`Failed to approve request: ${error.message}`);
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, adminNotes }: { requestId: string; adminNotes: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('service_activation_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-activation-requests-all'] });
      toast.success('Request rejected.');
    },
    onError: (error: any) => {
      toast.error(`Failed to reject request: ${error.message}`);
    }
  });

  return {
    allRequests,
    userRequests,
    isLoadingAll,
    isLoadingUser,
    submitRequest: submitRequest.mutateAsync,
    approveRequest: approveRequest.mutateAsync,
    rejectRequest: rejectRequest.mutateAsync,
    isSubmitting: submitRequest.isPending,
    isProcessing: approveRequest.isPending || rejectRequest.isPending
  };
};
