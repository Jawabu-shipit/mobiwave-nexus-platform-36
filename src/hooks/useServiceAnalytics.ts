import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ServiceMetrics {
  total_services: number;
  active_subscriptions: number;
  average_adoption_rate: number;
}

interface UsageDataPoint {
  date: string;
  usage: number;
  service_type: string;
}

interface StatusDataPoint {
  status: string;
  count: number;
}

interface RevenueDataPoint {
  month: string;
  revenue: number;
  subscriptions: number;
}

interface CreditTransaction {
  amount: number;
  created_at: string;
}

interface UserSubscription {
  created_at: string;
}

interface MessageHistory {
  created_at: string;
  type: string;
}

export const useServiceAnalytics = () => {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['service-analytics-metrics'],
    queryFn: async (): Promise<ServiceMetrics> => {
      const [servicesResult, subscriptionsResult] = await Promise.all([
        supabase.from('services_catalog').select('id').eq('is_active', true),
        supabase.from('user_service_subscriptions').select('id, status').eq('status', 'active')
      ]);

      const totalServices = servicesResult.data?.length || 0;
      const activeSubscriptions = subscriptionsResult.data?.length || 0;
      
      // Calculate adoption rate (active subscriptions / total possible combinations)
      const { data: totalUsers } = await supabase.from('profiles').select('id');
      const totalUsers_ = totalUsers?.length || 1;
      const possibleCombinations = totalServices * totalUsers_;
      const adoptionRate = possibleCombinations > 0 ? (activeSubscriptions / possibleCombinations) * 100 : 0;

      return {
        total_services: totalServices,
        active_subscriptions: activeSubscriptions,
        average_adoption_rate: Math.round(adoptionRate * 100) / 100
      };
    }
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['service-usage-data'],
    queryFn: async (): Promise<UsageDataPoint[]> => {
      // Get real usage data from message_history for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      let messageHistory: MessageHistory[] = [];
      try {
        const response = await supabase
          .from('message_history')
          .select('created_at, type')
          .gte('created_at', thirtyDaysAgo.toISOString());
        
        if (response.data) {
          messageHistory = response.data.map(item => ({
            created_at: item.created_at,
            type: item.type
          }));
        }
      } catch (e) {
        messageHistory = [];
      }

      // Group by date and service type
      const usageMap = new Map<string, Map<string, number>>();
      
      messageHistory?.forEach(message => {
        const date = new Date(message.created_at).toISOString().split('T')[0];
        const serviceType = message.type;
        
        if (!usageMap.has(date)) {
          usageMap.set(date, new Map());
        }
        
        const dateMap = usageMap.get(date)!;
        dateMap.set(serviceType, (dateMap.get(serviceType) || 0) + 1);
      });

      // Convert to array format
      const data: UsageDataPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dateUsage = usageMap.get(dateStr) || new Map();
        ['sms', 'email', 'push', 'in_app'].forEach(serviceType => {
          data.push({
            date: dateStr,
            usage: dateUsage.get(serviceType) || 0,
            service_type: serviceType
          });
        });
      }
      
      return data;
    }
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['service-status-distribution'],
    queryFn: async (): Promise<StatusDataPoint[]> => {
      const { data, error } = await supabase
        .from('user_service_subscriptions')
        .select('status');

      if (error) throw error;

      const statusCounts = (data || []).reduce((acc: Record<string, number>, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
    }
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['service-revenue-data'],
    queryFn: async (): Promise<RevenueDataPoint[]> => {
      // Get real revenue data from credit_transactions for the last 12 months
      let transactions: CreditTransaction[] = [];
      try {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const response = await supabase
          .from('credit_transactions')
          .select('amount, created_at')
          .eq('type', 'purchase')
          .gte('created_at', oneYearAgo);
        
        if (response.data) {
          transactions = response.data.map(item => ({
            amount: item.amount,
            created_at: item.created_at
          }));
        }
      } catch (e) {
        transactions = [];
      }
      // Get subscription counts
      let subscriptions: UserSubscription[] = [];
      try {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const response = await supabase
          .from('user_service_subscriptions')
          .select('created_at')
          .gte('created_at', oneYearAgo);
        
        if (response.data) {
          subscriptions = response.data.map(item => ({
            created_at: item.created_at
          }));
        }
      } catch (e) {
        subscriptions = [];
      }

      // Group by month
      const monthlyData = new Map<string, { revenue: number; subscriptions: number }>();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize all months
      months.forEach(month => {
        monthlyData.set(month, { revenue: 0, subscriptions: 0 });
      });

      // Process transactions
      transactions?.forEach(transaction => {
        const date = new Date(transaction.created_at);
        const monthName = months[date.getMonth()];
        const current = monthlyData.get(monthName) || { revenue: 0, subscriptions: 0 };
        current.revenue += transaction.amount || 0;
        monthlyData.set(monthName, current);
      });

      // Process subscriptions
      subscriptions?.forEach(subscription => {
        const date = new Date(subscription.created_at);
        const monthName = months[date.getMonth()];
        const current = monthlyData.get(monthName) || { revenue: 0, subscriptions: 0 };
        current.subscriptions += 1;
        monthlyData.set(monthName, current);
      });

      // Convert to array
      return months.map(month => ({
        month,
        revenue: monthlyData.get(month)?.revenue || 0,
        subscriptions: monthlyData.get(month)?.subscriptions || 0
      }));
    }
  });

  return {
    metrics,
    usageData: usageData || [],
    statusData: statusData || [],
    revenueData: revenueData || [],
    isLoading: metricsLoading || usageLoading || statusLoading || revenueLoading
  };
};
