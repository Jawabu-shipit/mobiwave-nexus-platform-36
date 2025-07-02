
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealTimeUpdate {
  type: 'campaign' | 'survey' | 'system' | 'message';
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

interface UseRealTimeUpdatesOptions {
  userId?: string;
  onUpdate?: (update: RealTimeUpdate) => void;
  enableNotifications?: boolean;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const { userId, onUpdate, enableNotifications = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);

  useEffect(() => {
    // Campaign status updates
    const campaignChannel = supabase
      .channel('campaign-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaigns',
        filter: userId ? `user_id=eq.${userId}` : undefined
      }, (payload) => {
        const update: RealTimeUpdate = {
          type: 'campaign',
          action: payload.eventType as any,
          data: payload.new || payload.old,
          timestamp: new Date().toISOString()
        };

        setUpdates(prev => [update, ...prev.slice(0, 49)]);
        onUpdate?.(update);

        if (enableNotifications && payload.eventType === 'UPDATE') {
          const campaign = payload.new as any;
          if (campaign.status === 'completed') {
            toast.success(`Campaign "${campaign.name}" completed successfully`);
          } else if (campaign.status === 'failed') {
            toast.error(`Campaign "${campaign.name}" failed`);
          }
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Survey responses updates
    const surveyChannel = supabase
      .channel('survey-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'surveys',
        filter: userId ? `user_id=eq.${userId}` : undefined
      }, (payload) => {
        const update: RealTimeUpdate = {
          type: 'survey',
          action: payload.eventType as any,
          data: payload.new || payload.old,
          timestamp: new Date().toISOString()
        };

        setUpdates(prev => [update, ...prev.slice(0, 49)]);
        onUpdate?.(update);

        if (enableNotifications && payload.eventType === 'INSERT') {
          const survey = payload.new as any;
          if (survey.status === 'active') {
            toast.success(`Survey "${survey.title}" is now live`);
          }
        }
      })
      .subscribe();

    // Survey responses
    const responseChannel = supabase
      .channel('response-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'survey_responses'
      }, (payload) => {
        const update: RealTimeUpdate = {
          type: 'survey',
          action: 'insert',
          data: { type: 'new_response', ...payload.new },
          timestamp: new Date().toISOString()
        };

        setUpdates(prev => [update, ...prev.slice(0, 49)]);
        onUpdate?.(update);

        if (enableNotifications) {
          toast.success('New survey response received');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(campaignChannel);
      supabase.removeChannel(surveyChannel);
      supabase.removeChannel(responseChannel);
    };
  }, [userId, onUpdate, enableNotifications]);

  const clearUpdates = () => setUpdates([]);

  return {
    isConnected,
    updates,
    clearUpdates,
    latestUpdate: updates[0] || null
  };
};
