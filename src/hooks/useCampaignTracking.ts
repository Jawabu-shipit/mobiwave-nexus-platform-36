
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMspaceDelivery, DeliveryStatus } from './mspace/useMspaceDelivery';

interface Campaign {
  id: string;
  name: string;
  status: 'preparing' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  startTime: Date;
  estimatedCompletion?: Date;
  deliveryStatuses: DeliveryStatus[];
  messageIds?: string[];
}

export const useCampaignTracking = () => {
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const { getBatchDeliveryReports, isLoading: isDeliveryLoading } = useMspaceDelivery();

  // Fetch campaigns from database
  const { data: dbCampaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .in('status', ['draft', 'scheduled', 'sending', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  // Process database campaigns into our tracking format
  useEffect(() => {
    if (!dbCampaigns) return;

    const processed = dbCampaigns.map(campaign => {
      // Extract message IDs from metadata if available
      const metadata = campaign.metadata as Record<string, any> || {};
      const messages = metadata.messages || [];
      const messageIds = messages.map((msg: any) => msg.provider_message_id).filter(Boolean);

      return {
        id: campaign.id,
        name: campaign.name,
        status: mapCampaignStatus(campaign.status),
        totalRecipients: campaign.recipient_count || 0,
        sent: campaign.sent_count || 0,
        delivered: campaign.delivered_count || 0,
        failed: campaign.failed_count || 0,
        pending: (campaign.recipient_count || 0) - (campaign.sent_count || 0),
        startTime: campaign.sent_at ? new Date(campaign.sent_at) : new Date(campaign.created_at),
        estimatedCompletion: calculateEstimatedCompletion(campaign),
        deliveryStatuses: [],
        messageIds
      };
    });

    setActiveCampaigns(processed);
  }, [dbCampaigns]);

  // Update delivery statuses for the selected campaign
  useEffect(() => {
    if (!autoRefresh || selectedCampaignId === 'all') return;
    
    const selectedCampaign = activeCampaigns.find(c => c.id === selectedCampaignId);
    if (!selectedCampaign || !selectedCampaign.messageIds?.length) return;
    
    const intervalId = setInterval(async () => {
      try {
        const statuses = await getBatchDeliveryReports(selectedCampaign.messageIds || []);
        
        setActiveCampaigns(prev => prev.map(campaign => {
          if (campaign.id === selectedCampaignId) {
            return {
              ...campaign,
              deliveryStatuses: statuses,
              delivered: statuses.filter(s => s.status === 'delivered').length,
              failed: statuses.filter(s => s.status === 'failed' || s.status === 'bounced').length,
              pending: campaign.totalRecipients - statuses.length
            };
          }
          return campaign;
        }));
      } catch (error) {
        console.error('Error fetching delivery statuses:', error);
      }
    }, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedCampaignId, activeCampaigns, autoRefresh, refreshInterval, getBatchDeliveryReports]);

  // Helper function to map database status to our component status
  const mapCampaignStatus = (status: string): 'preparing' | 'sending' | 'completed' | 'failed' => {
    switch (status) {
      case 'draft': return 'preparing';
      case 'scheduled': return 'preparing';
      case 'sending': return 'sending';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      default: return 'preparing';
    }
  };

  // Helper function to calculate estimated completion time
  const calculateEstimatedCompletion = (campaign: any): Date | undefined => {
    if (campaign.status !== 'sending' || !campaign.sent_at) return undefined;
    
    const sentAt = new Date(campaign.sent_at);
    const now = new Date();
    const elapsedTime = now.getTime() - sentAt.getTime();
    const totalTime = elapsedTime / (campaign.sent_count || 1) * campaign.recipient_count;
    const remainingTime = totalTime - elapsedTime;
    
    if (remainingTime <= 0) return undefined;
    
    return new Date(now.getTime() + remainingTime);
  };

  return {
    campaigns: activeCampaigns,
    selectedCampaignId,
    setSelectedCampaignId,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    isLoading: isCampaignsLoading || isDeliveryLoading
  };
};
