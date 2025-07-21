import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  status: 'read' | 'unread';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  metadata: any;
  expires_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationFilters {
  status?: string;
  type?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export const useNotifications = (filters?: NotificationFilters) => {
  const queryClient = useQueryClient();

  // Get notifications
  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase.functions.invoke('notifications', {
        body: {
          action: 'list',
          filters
        }
      });

      if (error) throw error;
      return data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create notification
  const createNotification = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'read_at'>) => {
      const { data, error } = await supabase.functions.invoke('notifications', {
        body: {
          action: 'create',
          notification
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create notification: ${error.message}`);
    }
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.functions.invoke('notifications', {
        body: {
          action: 'markRead',
          notification_id: notificationId
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to mark notification as read: ${error.message}`);
    }
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.functions.invoke('notifications', {
        body: {
          action: 'delete',
          notification_id: notificationId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete notification: ${error.message}`);
    }
  });

  // Get unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    createNotification: createNotification.mutateAsync,
    markAsRead: markAsRead.mutateAsync,
    deleteNotification: deleteNotification.mutateAsync,
    isCreating: createNotification.isPending,
    isUpdating: markAsRead.isPending,
    isDeleting: deleteNotification.isPending
  };
};

// Real-time notifications hook
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  React.useEffect(() => {
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification change:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Show toast for new notifications
          if (payload.eventType === 'INSERT' && payload.new) {
            const notification = payload.new as Notification;
            toast(notification.title, {
              description: notification.message,
              action: notification.action_url ? {
                label: 'View',
                onClick: () => window.open(notification.action_url, '_blank')
              } : undefined
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};