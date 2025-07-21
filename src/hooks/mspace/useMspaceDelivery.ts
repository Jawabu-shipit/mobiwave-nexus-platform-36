
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface MspaceDeliveryMessage {
  messageId: string;
  recipient: string;
  status: number;
  statusDescription: string;
}

interface MspaceDeliveryResponse {
  message: MspaceDeliveryMessage[];
}

export interface DeliveryStatus {
  messageId: string;
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  statusDescription: string;
  timestamp?: string;
}

export const useMspaceDelivery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleRetry } = useErrorHandler();

  const getDeliveryReport = async (messageId: string): Promise<MspaceDeliveryMessage | null> => {
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    setIsLoading(true);
    try {
      const deliveryOperation = async () => {
        const { data, error } = await supabase.functions.invoke('mspace-delivery', {
          body: { messageId }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data.message && Array.isArray(data.message) && data.message.length > 0) {
          return data.message[0];
        }
        
        return null;
      };

      return await handleRetry(deliveryOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Get Delivery Report',
        details: { messageId },
        shouldRetry: true,
        retryFn: () => getDeliveryReport(messageId)
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getBatchDeliveryReports = async (messageIds: string[]): Promise<DeliveryStatus[]> => {
    if (!messageIds || messageIds.length === 0) {
      return [];
    }

    setIsLoading(true);
    try {
      const batchOperation = async () => {
        const { data, error } = await supabase.functions.invoke('mspace-delivery', {
          body: { messageIds, batchMode: true }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data || !Array.isArray(data)) {
          return [];
        }

        return data.map((item: any) => {
          const statusMap: Record<number, 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'> = {
            1: 'pending',
            2: 'sent',
            3: 'delivered',
            4: 'failed',
            5: 'bounced'
          };

          return {
            messageId: item.messageId,
            recipient: item.recipient,
            status: statusMap[item.status] || 'pending',
            statusDescription: item.statusDescription,
            timestamp: new Date().toISOString()
          };
        });
      };

      return await handleRetry(batchOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Get Batch Delivery Reports',
        details: { messageCount: messageIds.length },
        shouldRetry: true,
        retryFn: () => getBatchDeliveryReports(messageIds)
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    getDeliveryReport, 
    getBatchDeliveryReports,
    isLoading 
  };
};
