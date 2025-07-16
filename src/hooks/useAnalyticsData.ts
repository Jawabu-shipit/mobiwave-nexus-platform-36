import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalMessages: number;
  deliveryRate: number;
  openRate: number;
  totalCost: number;
  activeCampaigns: number;
  scheduledCampaigns: number;
  previousPeriodComparison: {
    messagesGrowth: number;
    deliveryRateGrowth: number;
    costGrowth: number;
  };
}

export const useAnalyticsData = () => {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          totalMessages: 0,
          deliveryRate: 0,
          openRate: 0,
          totalCost: 0,
          activeCampaigns: 0,
          scheduledCampaigns: 0,
          previousPeriodComparison: {
            messagesGrowth: 0,
            deliveryRateGrowth: 0,
            costGrowth: 0,
          }
        };
      }

      // Get current period data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Get message history for current period - handle missing columns gracefully
      const { data: currentMessages, error: currentError } = await supabase
        .from('message_history')
        .select('id, user_id, status, cost, created_at, type')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // If there's a column error, try with basic columns only
      let messagesData = currentMessages || [];
      if (currentError && currentError.message.includes('does not exist')) {
        const { data: fallbackMessages } = await supabase
          .from('message_history')
          .select('id, user_id, status, cost, created_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString());
        
        messagesData = fallbackMessages?.map(msg => ({
          ...msg,
          campaign_id: null,
          content: 'Legacy message',
          delivered_at: null,
          error_message: null,
          failed_at: null,
          metadata: null,
          provider: null,
          provider_message_id: null,
          recipient: 'N/A',
          retry_count: null,
          sender: 'System',
          sent_at: null,
          subject: null,
          type: 'sms',
          updated_at: null
        })) || [];
      }

      // Get message history for previous period (for comparison)
      const { data: previousMessages } = await supabase
        .from('message_history')
        .select('id, user_id, status, cost, created_at, type')
        .eq('user_id', user.id)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      // Get campaigns data
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, user_id, status, created_at')
        .eq('user_id', user.id);

      // Calculate current period metrics
      const totalMessages = messagesData?.length || 0;
      const deliveredMessages = messagesData?.filter(m => m.status === 'delivered').length || 0;
      const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;
      
      // Calculate open rate (mock calculation based on delivered messages)
      const openRate = deliveredMessages > 0 ? (deliveredMessages * 0.35) : 0; // 35% average open rate
      
      // Calculate cost (assuming $0.05 per message)
      const totalCost = totalMessages * 0.05;

      // Campaign counts
      const activeCampaigns = campaigns?.filter(c => 
        c.status === 'sending' || c.status === 'active'
      ).length || 0;
      
      const scheduledCampaigns = campaigns?.filter(c => 
        c.status === 'scheduled'
      ).length || 0;

      // Calculate previous period metrics for comparison
      const previousTotalMessages = previousMessages?.length || 0;
      const previousDeliveredMessages = previousMessages?.filter(m => m.status === 'delivered').length || 0;
      const previousDeliveryRate = previousTotalMessages > 0 ? (previousDeliveredMessages / previousTotalMessages) * 100 : 0;
      const previousTotalCost = previousTotalMessages * 0.05;

      // Calculate growth percentages
      const messagesGrowth = previousTotalMessages > 0 
        ? ((totalMessages - previousTotalMessages) / previousTotalMessages) * 100 
        : 0;
      
      const deliveryRateGrowth = previousDeliveryRate > 0 
        ? ((deliveryRate - previousDeliveryRate) / previousDeliveryRate) * 100 
        : 0;
      
      const costGrowth = previousTotalCost > 0 
        ? ((totalCost - previousTotalCost) / previousTotalCost) * 100 
        : 0;

      return {
        totalMessages,
        deliveryRate,
        openRate,
        totalCost,
        activeCampaigns,
        scheduledCampaigns,
        previousPeriodComparison: {
          messagesGrowth,
          deliveryRateGrowth,
          costGrowth,
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analyticsData,
    isLoading,
    error
  };
};