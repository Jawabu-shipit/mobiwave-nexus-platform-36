
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppSubscription {
  id: string;
  subscription_id: string;
  phone_number_id: string;
  business_account_id: string;
  webhook_url: string;
  verify_token: string;
  message_limit: number;
  current_messages: number;
  status: string;
  created_at: string;
}

const fetchWhatsAppSubscriptions = async (): Promise<WhatsAppSubscription[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // First get user's service subscriptions
    const { data: userSubscriptions, error: subsError } = await supabase
      .from('user_service_subscriptions')
      .select('id')
      .eq('user_id', user.id);

    if (subsError || !userSubscriptions) {
      console.error('Error fetching user subscriptions:', subsError);
      return [];
    }

    const subscriptionIds = userSubscriptions.map(sub => sub.id);

    if (subscriptionIds.length === 0) return [];

    // Then get WhatsApp subscriptions for those service subscriptions
    const { data, error } = await supabase
      .from('whatsapp_subscriptions')
      .select('*')
      .in('subscription_id', subscriptionIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching WhatsApp subscriptions:', error);
      return [];
    }
    return (data || []) as WhatsAppSubscription[];
  } catch (error) {
    console.error('Error fetching WhatsApp subscriptions:', error);
    return [];
  }
};

export const useWhatsAppSubscriptionsData = () => {
  return useQuery({
    queryKey: ['whatsapp-subscriptions'],
    queryFn: fetchWhatsAppSubscriptions
  });
};
