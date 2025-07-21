
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWhatsAppSubscriptionMutations = () => {
  const queryClient = useQueryClient();

  const createSubscription = useMutation({
    mutationFn: async (subscriptionData: {
      phone_number_id: string;
      business_account_id: string;
      webhook_url: string;
      verify_token: string;
      access_token: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find an active WhatsApp service subscription
      const { data: subscription } = await supabase
        .from('user_service_subscriptions')
        .select(`
          id,
          services_catalog!inner(service_type)
        `)
        .eq('user_id', user.id)
        .eq('services_catalog.service_type', 'whatsapp')
        .eq('status', 'active')
        .single();

      if (!subscription) {
        throw new Error('You need an active WhatsApp service subscription to create integrations');
      }

      const { data, error } = await supabase
        .from('whatsapp_subscriptions')
        .insert({
          subscription_id: subscription.id,
          phone_number_id: subscriptionData.phone_number_id,
          business_account_id: subscriptionData.business_account_id,
          webhook_url: subscriptionData.webhook_url,
          verify_token: subscriptionData.verify_token,
          access_token_encrypted: subscriptionData.access_token,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-subscriptions'] });
      toast.success('WhatsApp integration created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create integration: ${error.message}`);
    }
  });

  return {
    createSubscription: createSubscription.mutateAsync,
    isCreating: createSubscription.isPending
  };
};
