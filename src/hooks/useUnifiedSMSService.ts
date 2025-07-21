
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCampaigns } from './useCampaigns';
import { useWorkflows } from './useWorkflows';
import { useMspaceApi } from './useMspaceApi';

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

interface SMSData {
  recipients: string[];
  message: string;
  senderId?: string;
  campaignId?: string;
}

export const useUnifiedSMSService = () => {
  const queryClient = useQueryClient();
  const { createCampaign } = useCampaigns();
  const { createWorkflow } = useWorkflows();
  const mspaceApi = useMspaceApi();
  
  // Basic SMS sending functionality (previously in useRealSMSService)
  const sendSMSMutation = useMutation({
    mutationFn: async (smsData: SMSData) => {
      const user = await supabase.auth.getUser();
      
      // Create campaign record if no campaignId provided
      let campaignId = smsData.campaignId;
      
      if (!campaignId) {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            name: `SMS Campaign ${new Date().toLocaleString()}`,
            type: 'sms',
            content: smsData.message,
            message: smsData.message, // Required field
            recipient_count: smsData.recipients.length,
            status: 'sending',
            user_id: user.data.user?.id
          })
          .select()
          .single();

        if (campaignError) throw campaignError;
        campaignId = campaign.id;
      }

      // Simulate sending SMS messages
      const deliveryResults = await Promise.all(
        smsData.recipients.map(async (recipient, index) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 100 * index));
          
          const success = Math.random() > 0.1; // 90% success rate
          
          // Record message in history
          await supabase.from('message_history').insert({
            campaign_id: campaignId,
            user_id: user.data.user?.id,
            recipient,
            content: smsData.message,
            type: 'sms',
            sender: smsData.senderId || 'SYSTEM',
            status: success ? 'delivered' : 'failed',
            cost: 0.05, // Simulate cost per SMS
            sent_at: success ? new Date().toISOString() : null,
            delivered_at: success ? new Date().toISOString() : null,
            failed_at: !success ? new Date().toISOString() : null,
            error_message: !success ? 'Delivery failed' : null
          });

          return { recipient, success };
        })
      );

      const successCount = deliveryResults.filter(r => r.success).length;
      const failedCount = deliveryResults.length - successCount;

      // Update campaign with results
      await supabase
        .from('campaigns')
        .update({
          status: 'completed',
          sent_count: deliveryResults.length,
          delivered_count: successCount,
          failed_count: failedCount,
          cost: deliveryResults.length * 0.05
        })
        .eq('id', campaignId);

      return {
        campaignId,
        totalSent: deliveryResults.length,
        delivered: successCount,
        failed: failedCount,
        results: deliveryResults
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
      toast.success(`SMS sent! ${result.delivered} delivered, ${result.failed} failed`);
    },
    onError: (error: any) => {
      toast.error(`Failed to send SMS: ${error.message}`);
    }
  });
  
  // Check balance functionality (previously in useSMSService)
  const checkBalance = async () => {
    try {
      const { data: credits } = await supabase
        .from('user_credits')
        .select('credits_remaining')
        .single();
      
      return { balance: credits?.credits_remaining || 0 };
    } catch (error) {
      console.error('Error checking balance:', error);
      return { balance: 0 };
    }
  };

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
        const result = await sendSMSMutation.mutateAsync({
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

  // Get delivery report functionality (previously in useSMSService)
  const getDeliveryReport = async (messageId: string) => {
    try {
      // Try to get delivery report from Mspace API first
      if (mspaceApi.hasCredentials) {
        const result = await mspaceApi.getDeliveryReport.mutateAsync(messageId);
        if (result) {
          return {
            messageId: result.messageId,
            recipient: result.recipient,
            status: result.status === 3 ? 'delivered' : 'failed',
            statusDescription: result.statusDescription,
            deliveryTime: new Date().toISOString()
          };
        }
      }

      // Fallback to checking campaigns metadata
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('metadata')
        .neq('metadata', null);

      // Search through campaign metadata for the message
      for (const campaign of campaigns || []) {
        const metadata = campaign.metadata as any;
        const messages = metadata?.messages || [];
        const message = messages.find((m: any) => m.provider_message_id === messageId);
        if (message) {
          return message;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting delivery report:', error);
      throw error;
    }
  };

  return {
    // Unified SMS functionality
    sendUnifiedSMS: sendUnifiedSMS.mutateAsync,
    isLoading: sendUnifiedSMS.isPending,
    
    // Basic SMS functionality (from useRealSMSService)
    sendSMS: sendSMSMutation.mutateAsync,
    isSendingSMS: sendSMSMutation.isPending,
    
    // Additional SMS functionality (from useSMSService)
    checkBalance,
    getDeliveryReport
  };
};
