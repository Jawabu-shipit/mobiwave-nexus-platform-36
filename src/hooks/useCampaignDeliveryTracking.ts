
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimeUpdates } from './useRealTimeUpdates';

interface DeliveryMetrics {
  campaignId: string;
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  lastUpdated: Date;
}

export const useCampaignDeliveryTracking = (campaignId?: string) => {
  const [metrics, setMetrics] = useState<DeliveryMetrics[]>([]);

  // Fetch initial delivery data
  const { data: campaignData, isLoading } = useQuery({
    queryKey: ['campaign-delivery', campaignId],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('id, name, sent_count, delivered_count, failed_count, recipient_count, status, updated_at');

      if (campaignId) {
        query = query.eq('id', campaignId);
      } else {
        query = query.in('status', ['sending', 'completed']);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time updates for campaigns
  useRealTimeUpdates({
    onUpdate: (update) => {
      if (update.type === 'campaign' && update.action === 'update') {
        updateMetrics(update.data);
      }
    }
  });

  const updateMetrics = (campaignData: any) => {
    const newMetric: DeliveryMetrics = {
      campaignId: campaignData.id,
      totalSent: campaignData.sent_count || 0,
      delivered: campaignData.delivered_count || 0,
      failed: campaignData.failed_count || 0,
      pending: (campaignData.recipient_count || 0) - (campaignData.sent_count || 0),
      deliveryRate: campaignData.sent_count > 0 
        ? ((campaignData.delivered_count || 0) / campaignData.sent_count) * 100 
        : 0,
      lastUpdated: new Date()
    };

    setMetrics(prev => {
      const existing = prev.findIndex(m => m.campaignId === campaignData.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newMetric;
        return updated;
      }
      return [...prev, newMetric];
    });
  };

  useEffect(() => {
    if (campaignData) {
      campaignData.forEach(updateMetrics);
    }
  }, [campaignData]);

  const getCampaignMetrics = (id: string) => 
    metrics.find(m => m.campaignId === id);

  return {
    metrics,
    getCampaignMetrics,
    isLoading,
    refreshMetrics: () => {
      // Force refresh by updating query
    }
  };
};
