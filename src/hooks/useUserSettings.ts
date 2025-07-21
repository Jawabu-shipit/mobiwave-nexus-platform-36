import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  timezone: string;
  language: string;
  dashboard_layout: any;
  auto_save: boolean;
  two_factor_enabled: boolean;
  session_timeout: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_notifications: boolean;
  notification_types: {
    system: boolean;
    billing: boolean;
    security: boolean;
    campaigns: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const queryClient = useQueryClient();

  // Get user settings
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async (): Promise<UserSettings> => {
      const { data, error } = await supabase.functions.invoke('user-settings', {
        body: {
          action: 'get'
        }
      });

      if (error) throw error;
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get notification preferences
  const { data: notificationPreferences, isLoading: preferencesLoading, error: preferencesError } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async (): Promise<NotificationPreferences> => {
      const { data, error } = await supabase.functions.invoke('user-settings', {
        body: {
          action: 'getNotificationPreferences'
        }
      });

      if (error) throw error;
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update settings
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase.functions.invoke('user-settings', {
        body: {
          action: 'update',
          settings: updates
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  // Update notification preferences
  const updateNotificationPreferences = useMutation({
    mutationFn: async (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase.functions.invoke('user-settings', {
        body: {
          action: 'updateNotificationPreferences',
          notification_preferences: updates
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update notification preferences: ${error.message}`);
    }
  });

  return {
    settings,
    notificationPreferences,
    isLoading: settingsLoading || preferencesLoading,
    error: settingsError || preferencesError,
    updateSettings: updateSettings.mutateAsync,
    updateNotificationPreferences: updateNotificationPreferences.mutateAsync,
    isUpdatingSettings: updateSettings.isPending,
    isUpdatingPreferences: updateNotificationPreferences.isPending
  };
};