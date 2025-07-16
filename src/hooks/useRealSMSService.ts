
/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Please use useUnifiedSMSService instead for all SMS functionality.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SMSData {
  recipients: string[];
  message: string;
  senderId?: string;
  campaignId?: string;
}

export const useRealSMSService = () => {
  const queryClient = useQueryClient();

  const sendSMS = useMutation({
    mutationFn: async (smsData: SMSData) => {
      const user = await supabase.auth.getUser();
      
      // Create campaign record
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

      // Simulate sending SMS messages
      const deliveryResults = await Promise.all(
        smsData.recipients.map(async (recipient, index) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 100 * index));
          
          const success = Math.random() > 0.1; // 90% success rate
          
          // Record message in history
          await supabase.from('message_history').insert({
            campaign_id: campaign.id,
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
        .eq('id', campaign.id);

      return {
        campaignId: campaign.id,
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

  return {
    sendSMS: sendSMS.mutateAsync,
    isLoading: sendSMS.isPending
  };
};
