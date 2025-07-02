
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppMessage {
  id: string;
  subscription_id: string;
  recipient_phone: string;
  message_type: string;
  content: string;
  template_name?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_reason?: string;
  created_at: string;
}

const fetchWhatsAppMessages = async (subscriptionId?: string): Promise<WhatsAppMessage[]> => {
  if (!subscriptionId) return [];

  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }
    return (data || []) as WhatsAppMessage[];
  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return [];
  }
};

export const useWhatsAppMessagesData = (subscriptionId?: string) => {
  return useQuery({
    queryKey: ['whatsapp-messages', subscriptionId],
    queryFn: () => fetchWhatsAppMessages(subscriptionId),
    enabled: !!subscriptionId
  });
};
