
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  type: string;
  content: string;
  recipients: string[];
  status: string;
  created_at: string;
  scheduled_at?: string;
  user_id?: string;
}

interface CreateCampaignData {
  name: string;
  type: string;
  content: string;
  recipients: string[];
}

export const useCampaignManagement = () => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type || 'sms',
        content: campaign.content || campaign.message,
        recipients: [], // Recipients would need to be stored separately
        status: campaign.status || 'draft',
        created_at: campaign.created_at || '',
        scheduled_at: campaign.scheduled_at,
        user_id: campaign.user_id
      }));
    }
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
          message: campaignData.content, // Required field in schema
          status: 'draft',
          user_id: user.data.user?.id,
          recipient_count: campaignData.recipients.length
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

  const updateCampaign = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Campaign> }) => {
      const { error } = await supabase
        .from('campaigns')
        .update({
          name: updates.name,
          type: updates.type,
          content: updates.content,
          message: updates.content, // Keep message in sync with content
          status: updates.status
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
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

  return {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign
  };
};
