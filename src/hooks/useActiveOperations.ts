import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActiveOperation {
  id: string;
  type: 'campaign' | 'bulk_sms' | 'survey' | 'import';
  status: 'running' | 'queued' | 'processing';
  created_at: string;
  progress?: number;
}

export const useActiveOperations = () => {
  const { data: operations, isLoading, error } = useQuery({
    queryKey: ['active-operations'],
    queryFn: async (): Promise<ActiveOperation[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get active campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, status, created_at')
        .eq('user_id', user.id)
        .in('status', ['sending', 'scheduled', 'processing'])
        .order('created_at', { ascending: false });

      // Get active bulk operations (if you have a bulk_operations table)
      // For now, we'll simulate with campaigns
      const activeOps: ActiveOperation[] = [];

      if (campaigns) {
        campaigns.forEach(campaign => {
          activeOps.push({
            id: campaign.id,
            type: 'campaign',
            status: campaign.status === 'sending' ? 'running' : 
                   campaign.status === 'scheduled' ? 'queued' : 'processing',
            created_at: campaign.created_at
          });
        });
      }

      return activeOps;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });

  const activeCount = operations?.length || 0;
  const runningCount = operations?.filter(op => op.status === 'running').length || 0;
  const queuedCount = operations?.filter(op => op.status === 'queued').length || 0;

  return {
    operations,
    activeCount,
    runningCount,
    queuedCount,
    isLoading,
    error
  };
};