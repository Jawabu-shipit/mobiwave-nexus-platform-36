
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Campaign {
  id: string;
  name: string;
  status: string;
  type: string;
  recipient_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  cost?: number;
  created_at: string;
  updated_at: string;
  content: string;
  message: string;
  subject?: string;
  metadata?: any;
  scheduled_at?: string;
}

interface CreateCampaignData {
  name: string;
  type: string;
  content: string;
  message: string;
  recipient_count?: number;
  status?: string;
  scheduled_at?: string;
  metadata?: any;
}

export const useCampaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createCampaign = useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: campaignData.name,
          type: campaignData.type,
          content: campaignData.content,
          message: campaignData.message || campaignData.content,
          status: campaignData.status || 'draft',
          recipient_count: campaignData.recipient_count || 0,
          scheduled_at: campaignData.scheduled_at,
          metadata: campaignData.metadata,
          user_id: user.data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    }
  });

  const updateCampaignStatus = useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: string; status: string }) => {
      const { error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    }
  });

  const deleteCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    }
  });

  const getCampaignStats = () => {
    if (!campaigns) return { 
      total: 0, 
      active: 0, 
      completed: 0, 
      failed: 0,
      activeCampaigns: 0,
      totalCampaigns: 0,
      totalDelivered: 0,
      deliveryRate: 0
    };
    
    const totalDelivered = campaigns.reduce((sum, c) => sum + (c.delivered_count || 0), 0);
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    
    return {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      failed: campaigns.filter(c => c.status === 'failed').length,
      activeCampaigns: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
      totalCampaigns: campaigns.length,
      totalDelivered,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
    };
  };

  return {
    campaigns,
    isLoading,
    campaignsLoading: isLoading, // Add alias for backwards compatibility
    error,
    createCampaign,
    updateCampaignStatus,
    deleteCampaign,
    getCampaignStats
  };
};
