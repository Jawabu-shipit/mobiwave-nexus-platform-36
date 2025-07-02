
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealSMSService } from './useRealSMSService';
import { useMspaceApi } from './useMspaceApi';

interface SendSMSParams {
  recipients: string[];
  message: string;
  senderId?: string;
  campaignId?: string;
}

interface BulkSMSParams extends SendSMSParams {
  campaignName: string;
}

export const useSMSService = () => {
  const realSMSService = useRealSMSService();
  const mspaceApi = useMspaceApi();
  
  // Add missing sendBulkSMS function
  const sendBulkSMS = async (params: BulkSMSParams) => {
    return realSMSService.sendSMS(params);
  };

  // Add missing checkBalance function
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
  
  return {
    sendSMS: realSMSService.sendSMS,
    sendBulkSMS,
    checkBalance,
    isLoading: realSMSService.isLoading,
    getDeliveryReport: async (messageId: string) => {
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
    }
  };
};
