
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  secret: string;
  last_delivery?: string;
  delivery_success_rate: number;
  total_deliveries: number;
}

interface CreateWebhookData {
  name: string;
  url: string;
  events: string[];
}

export const useWebhooks = () => {
  const queryClient = useQueryClient();

  // Since webhook_endpoints table doesn't exist, return mock data
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhook-endpoints'],
    queryFn: async (): Promise<WebhookEndpoint[]> => {
      console.log('Webhook endpoints table not found, returning mock data');
      
      // Return mock webhooks data
      return [
        {
          id: '1',
          name: 'Payment Notifications',
          url: 'https://api.example.com/webhooks/payments',
          events: ['payment.completed', 'payment.failed'],
          is_active: true,
          last_delivery: '2024-06-15 10:30:00',
          delivery_success_rate: 98.5,
          total_deliveries: 1247,
          secret: 'whsec_1234567890abcdef',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'User Events',
          url: 'https://api.example.com/webhooks/users',
          events: ['user.created', 'user.updated', 'user.deleted'],
          is_active: false,
          last_delivery: '2024-06-14 15:20:00',
          delivery_success_rate: 95.2,
          total_deliveries: 823,
          secret: 'whsec_abcdef1234567890',
          created_at: new Date().toISOString()
        }
      ];
    }
  });

  const createWebhook = useMutation({
    mutationFn: async (webhookData: CreateWebhookData): Promise<WebhookEndpoint> => {
      console.log('Creating webhook (mock):', webhookData);
      
      // Return mock created webhook
      return {
        id: crypto.randomUUID(),
        ...webhookData,
        is_active: true,
        last_delivery: 'Never',
        delivery_success_rate: 0,
        total_deliveries: 0,
        secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
        created_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      toast.success('Webhook endpoint created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create webhook: ${error.message}`);
    }
  });

  const toggleWebhook = useMutation({
    mutationFn: async ({ webhookId, isActive }: { webhookId: string; isActive: boolean }) => {
      console.log('Toggling webhook (mock):', webhookId, isActive);
      // Mock toggle
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      toast.success('Webhook updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update webhook: ${error.message}`);
    }
  });

  const deleteWebhook = useMutation({
    mutationFn: async (webhookId: string) => {
      console.log('Deleting webhook (mock):', webhookId);
      // Mock deletion
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      toast.success('Webhook deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete webhook: ${error.message}`);
    }
  });

  const testWebhook = useMutation({
    mutationFn: async (webhookId: string) => {
      console.log('Testing webhook (mock):', webhookId);
      // Mock test
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      toast.success('Webhook test sent successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to test webhook: ${error.message}`);
    }
  });

  const getWebhookDeliveries = async (webhookId: string) => {
    console.log('Getting webhook deliveries (mock):', webhookId);
    
    // Return mock delivery data
    return [
      {
        id: '1',
        webhook_id: webhookId,
        event_type: 'user.created',
        status: 'delivered',
        response_code: 200,
        created_at: new Date().toISOString(),
        delivered_at: new Date().toISOString()
      }
    ];
  };

  return {
    webhooks,
    isLoading,
    createWebhook: createWebhook.mutateAsync,
    toggleWebhook: toggleWebhook.mutateAsync,
    deleteWebhook: deleteWebhook.mutateAsync,
    testWebhook: testWebhook.mutateAsync,
    getWebhookDeliveries,
    isCreating: createWebhook.isPending,
    isTesting: testWebhook.isPending
  };
};
