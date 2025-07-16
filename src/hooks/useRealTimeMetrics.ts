
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeMetrics {
  activeCampaigns: number;
  messagesPerMinute: number;
  activeUsers: number;
  systemLoad: number;
  deliveryRate: number;
  errorRate: number;
  lastUpdated: Date;
}

interface CampaignMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  recentActivity: Array<{
    timestamp: Date;
    event: string;
    count: number;
  }>;
}

export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeCampaigns: 0,
    messagesPerMinute: 0,
    activeUsers: 0,
    systemLoad: 0,
    deliveryRate: 0,
    errorRate: 0,
    lastUpdated: new Date()
  });

  const [isConnected, setIsConnected] = useState(false);

  // Real-time campaign metrics
  const { data: campaignMetrics } = useQuery({
    queryKey: ['real-time-campaign-metrics'],
    queryFn: async (): Promise<CampaignMetrics> => {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('sent_count, delivered_count, failed_count, status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
      const totalDelivered = campaigns?.reduce((sum, c) => sum + (c.delivered_count || 0), 0) || 0;
      const totalFailed = campaigns?.reduce((sum, c) => sum + (c.failed_count || 0), 0) || 0;

      // Generate recent activity data
      const recentActivity = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
        const hourlyMetrics = campaigns?.filter(c => {
          const campaignTime = new Date(c.created_at);
          return Math.abs(campaignTime.getTime() - timestamp.getTime()) < 5 * 60 * 1000;
        }) || [];
        
        recentActivity.unshift({
          timestamp,
          event: 'messages_sent',
          count: hourlyMetrics.reduce((sum, c) => sum + (c.sent_count || 0), 0)
        });
      }

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        recentActivity
      };
    },
    refetchInterval: 2000 // Update every 2 seconds
  });

  // Real-time updates using Supabase realtime
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-metrics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaigns'
      }, () => {
        // Trigger metrics update
        updateMetrics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'audit_logs'
      }, () => {
        updateMetrics();
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateMetrics = async () => {
    try {
      // Get active campaigns
      const { data: activeCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('status', 'sending');

      // Get recent activity for messages per minute calculation
      const { data: recentLogs } = await supabase
        .from('audit_logs')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString())
        .eq('action', 'sms_sent');

      // Mock system metrics (in production, these would come from monitoring services)
      const systemLoad = Math.random() * 100;
      const activeUsers = Math.floor(Math.random() * 50) + 10;
      const errorRate = Math.random() * 5;

      setMetrics({
        activeCampaigns: activeCampaigns?.length || 0,
        messagesPerMinute: recentLogs?.length || 0,
        activeUsers,
        systemLoad,
        deliveryRate: campaignMetrics?.deliveryRate || 0,
        errorRate,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  // Update metrics every 5 seconds
  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [campaignMetrics]);

  return {
    metrics,
    campaignMetrics,
    isConnected,
    refreshMetrics: updateMetrics
  };
};
