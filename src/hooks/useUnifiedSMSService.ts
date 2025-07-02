
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSMSService } from './useSMSService';
import { useCampaigns } from './useCampaigns';
import { useWorkflows } from './useWorkflows';

interface UnifiedSMSParams {
  recipients: string[];
  message: string;
  senderId?: string;
  campaignName?: string;
  scheduleConfig?: any;
  metadata?: any;
}

interface SMSResult {
  campaignId: string;
  scheduled?: boolean;
  automated?: boolean;
  totalSent?: number;
  delivered?: number;
  failed?: number;
  results?: { recipient: string; success: boolean; }[];
}

export const useUnifiedSMSService = () => {
  const queryClient = useQueryClient();
  const { sendSMS } = useSMSService();
  const { createCampaign } = useCampaigns();
  const { createWorkflow } = useWorkflows();

  const sendUnifiedSMS = useMutation({
    mutationFn: async (params: UnifiedSMSParams): Promise<SMSResult> => {
      const { recipients, message, senderId = 'MOBIWAVE', campaignName, scheduleConfig, metadata } = params;
      
      // Create campaign record
      const campaign = await createCampaign.mutateAsync({
        name: campaignName || `SMS Campaign ${new Date().toLocaleString()}`,
        type: 'sms',
        content: message,
        message: message,
        recipient_count: recipients.length,
        status: scheduleConfig ? 'scheduled' : 'sending',
        scheduled_at: scheduleConfig?.datetime,
        metadata: {
          scheduleConfig,
          ...metadata
        }
      });

      // Handle different scheduling types
      if (scheduleConfig?.type === 'immediate' || !scheduleConfig) {
        // Send immediately
        const result = await sendSMS({
          recipients,
          message,
          senderId,
          campaignId: campaign.id
        });
        
        return {
          campaignId: campaign.id,
          totalSent: result.totalSent,
          delivered: result.delivered,
          failed: result.failed,
          results: result.results
        };
      } else if (scheduleConfig?.type === 'scheduled') {
        // Create scheduled campaign entry
        await supabase.from('scheduled_campaigns').insert({
          campaign_id: campaign.id,
          scheduled_for: scheduleConfig.datetime,
          status: 'pending'
        });
        
        return { 
          campaignId: campaign.id, 
          scheduled: true 
        };
      } else if (scheduleConfig?.type === 'recurring' || scheduleConfig?.type === 'triggered') {
        // Create workflow for automation
        await createWorkflow({
          name: `${campaignName || 'SMS Automation'} - ${new Date().toLocaleString()}`,
          description: `Automated SMS campaign with ${scheduleConfig.type} scheduling`,
          trigger_type: scheduleConfig.type === 'triggered' ? 'event_based' : 'time_based',
          trigger_config: {
            ...scheduleConfig,
            campaign_id: campaign.id
          },
          actions: [
            {
              type: 'send_sms',
              config: {
                message,
                recipients,
                senderId,
                campaign_id: campaign.id
              }
            }
          ],
          is_active: true
        });
        
        return { 
          campaignId: campaign.id, 
          automated: true 
        };
      }

      // Fallback case
      return { campaignId: campaign.id };
    },
    onSuccess: (result: SMSResult) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled_campaigns'] });
      
      if (result.scheduled) {
        toast.success('SMS campaign scheduled successfully!');
      } else if (result.automated) {
        toast.success('Automated SMS workflow created successfully!');
      } else {
        toast.success('SMS campaign sent successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to process SMS campaign: ${error.message}`);
    }
  });

  return {
    sendUnifiedSMS: sendUnifiedSMS.mutateAsync,
    isLoading: sendUnifiedSMS.isPending
  };
};
