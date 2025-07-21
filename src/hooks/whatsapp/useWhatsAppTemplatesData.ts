
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppTemplate {
  id: string;
  subscription_id: string;
  name: string;
  category: string;
  language: string;
  header_type?: string;
  header_text?: string;
  body_text: string;
  footer_text?: string;
  buttons: any;
  variables: any;
  status: string;
  whatsapp_template_id?: string;
  created_at: string;
}

const fetchWhatsAppTemplates = async (subscriptionId?: string): Promise<WhatsAppTemplate[]> => {
  if (!subscriptionId) return [];

  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching WhatsApp templates:', error);
      return [];
    }
    return (data || []) as WhatsAppTemplate[];
  } catch (error) {
    console.error('Error fetching WhatsApp templates:', error);
    return [];
  }
};

export const useWhatsAppTemplatesData = (subscriptionId?: string) => {
  return useQuery({
    queryKey: ['whatsapp-templates', subscriptionId],
    queryFn: () => fetchWhatsAppTemplates(subscriptionId),
    enabled: !!subscriptionId
  });
};
