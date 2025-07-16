import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UsageAnalytics {
  smsSent: number;
  whatsappMessages: number;
  ussdSessions: number;
  mpesaTransactions: number;
  emailsSent: number;
  totalCost: number;
}

export const useUsageAnalytics = () => {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ['usage-analytics'],
    queryFn: async (): Promise<UsageAnalytics> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          smsSent: 0,
          whatsappMessages: 0,
          ussdSessions: 0,
          mpesaTransactions: 0,
          emailsSent: 0,
          totalCost: 0
        };
      }

      // Get current month data
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      // Get SMS messages
      const { data: smsMessagesRaw } = await supabase
        .from('message_history')
        .select('id, user_id, type, created_at')
        .eq('user_id', user.id)
        .eq('type', 'sms')
        .gte('created_at', firstDayOfMonth.toISOString());
      const smsMessages = (smsMessagesRaw as any[]) || [];

      // Get WhatsApp messages
      const { data: whatsappMessagesRaw } = await supabase
        .from('message_history')
        .select('id, user_id, type, created_at')
        .eq('user_id', user.id)
        .eq('type', 'whatsapp')
        .gte('created_at', firstDayOfMonth.toISOString());
      const whatsappMessages = (whatsappMessagesRaw as any[]) || [];

      // Get Email messages
      const { data: emailMessagesRaw } = await supabase
        .from('message_history')
        .select('id, user_id, type, created_at')
        .eq('user_id', user.id)
        .eq('type', 'email')
        .gte('created_at', firstDayOfMonth.toISOString());
      const emailMessages = (emailMessagesRaw as any[]) || [];

      // Get USSD sessions (if you have a ussd_sessions table)
      //let ussdSessions: any[] = [];
     // try {
      //  const { data } = await supabase
      //    .from('ussd_sessions')
      //    .select('*')
      //    .eq('user_id', user.id)
      //    .gte('created_at', firstDayOfMonth.toISOString());
      //  ussdSessions = (data as any[]) || [];
    //  } catch (e) {
     //   ussdSessions = [];
    //  }

     // let mpesaTransactions: any[] = [];
    //  try {
   //     const { data } = await (supabase
    //      .from('mpesa_transactions')
    //      .select('*')
    //      .eq('user_id', user.id)
    //      .gte('created_at', firstDayOfMonth.toISOString()) as any);
     //   mpesaTransactions = data || [];
     // } catch (e) {
     //   mpesaTransactions = [];
    //  }
      // const mpesaTransactions: any[] = []; // Set to empty until table is added

      // Calculate costs (example rates)
      const smsCount = smsMessages?.length || 0;
      const whatsappCount = whatsappMessages?.length || 0;
      const emailCount = emailMessages?.length || 0;
      const ussdCount = 0; // Placeholder since ussd_sessions is not implemented
      const mpesaCount = 0; // mpesaTransactions?.length || 0;

      const totalCost = (smsCount * 0.05) + (whatsappCount * 0.03) + (emailCount * 0.01) + (ussdCount * 0.10) + (mpesaCount * 0.02);

      return {
        smsSent: smsCount,
        whatsappMessages: whatsappCount,
        ussdSessions: ussdCount,
        mpesaTransactions: mpesaCount,
        emailsSent: emailCount,
        totalCost
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    usageData,
    isLoading,
    error
  };
};