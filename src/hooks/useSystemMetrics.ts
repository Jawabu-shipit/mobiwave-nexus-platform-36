import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetrics {
  performanceData: any[];
  totalUsers: number;
  activeCampaigns: number;
  totalMessages: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
}

interface ServiceStatus {
  id: string;
  service_name: string;
  status: 'healthy' | 'warning' | 'error';
  version: string;
  uptime_percentage: number;
  instances: number;
  cpu_usage: number;
  memory_usage: number;
}

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async (): Promise<SystemMetrics> => {
      try {
        // Get total users count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get active campaigns count
        const { count: activeCampaigns } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sending');

        // Get total messages from recent campaigns
        const { data: recentCampaigns } = await supabase
          .from('campaigns')
          .select('sent_count')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const totalMessages = recentCampaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;

        // Enhanced system health calculation
        const errorRate = Math.random() * 2; // Mock error rate
        const responseTime = Math.random() * 100 + 50;
        const systemLoad = Math.random() * 60 + 20;
        
        let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (errorRate > 5 || responseTime > 200 || systemLoad > 80) {
          systemHealth = 'critical';
        } else if (errorRate > 2 || responseTime > 150 || systemLoad > 60) {
          systemHealth = 'warning';
        }

        const uptime = '99.9%';

        // --- PLACEHOLDER: Replace with real data fetching logic below ---
        // Example: Fetch from a monitoring API, Prometheus, or your backend
        const cpuUsage = Math.round(Math.random() * 60 + 20); // Replace with real CPU usage
        const memoryUsage = Math.round(Math.random() * 60 + 20); // Replace with real memory usage
        // --- END PLACEHOLDER ---
        return {
          performanceData: [], // Add an empty array or fetch real performance data here
          totalUsers: totalUsers || 0,
          activeCampaigns: activeCampaigns || 0,
          totalMessages,
          systemHealth,
          uptime,
          responseTime,
          cpuUsage,
          memoryUsage
        };
      } catch (error) {
        console.error('Error fetching system metrics:', error);
        return {
          performanceData: [],
          totalUsers: 0,
          activeCampaigns: 0,
          totalMessages: 0,
          systemHealth: 'critical',
          uptime: '0%',
          responseTime: 0,
          cpuUsage: 0,
          memoryUsage: 0
        };
        }
      }
    });
};

// Add the missing useServiceStatus hook
export const useServiceStatus = () => {
  return useQuery({
    queryKey: ['service-status'],
    queryFn: async (): Promise<ServiceStatus[]> => {
      // Mock service status data since we don't have a services table
      return [
        {
          id: '1',
          service_name: 'Database',
          status: 'healthy',
          version: '14.2',
          uptime_percentage: 99.9,
          instances: 3,
          cpu_usage: 45,
          memory_usage: 68
        },
        {
          id: '2',
          service_name: 'SMS Gateway',
          status: 'healthy',
          version: '2.1.0',
          uptime_percentage: 99.8,
          instances: 2,
          cpu_usage: 32,
          memory_usage: 55
        },
        {
          id: '3',
          service_name: 'Email Service',
          status: 'warning',
          version: '1.5.3',
          uptime_percentage: 98.2,
          instances: 1,
          cpu_usage: 78,
          memory_usage: 85
        },
        {
          id: '4',
          service_name: 'API Gateway',
          status: 'healthy',
          version: '3.0.1',
          uptime_percentage: 99.95,
          instances: 4,
          cpu_usage: 52,
          memory_usage: 71
        }
      ];
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};

// Additional hook for real-time metrics monitoring
export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      // Get recent campaigns
      const { data: recentCampaigns } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent audit logs for activity
      const { data: recentActivity } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      return {
        recentCampaigns: recentCampaigns || [],
        recentActivity: recentActivity || []
      };
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });
};
