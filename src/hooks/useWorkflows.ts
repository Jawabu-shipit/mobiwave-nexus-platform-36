
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateWorkflowData {
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: any;
  actions: any[];
  is_active?: boolean;
}

export const useWorkflows = () => {
  const queryClient = useQueryClient();

  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflowData: CreateWorkflowData) => {
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflowData,
          user_id: user.data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    }
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateWorkflowData> }) => {
      const { error } = await supabase
        .from('workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update workflow: ${error.message}`);
    }
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete workflow: ${error.message}`);
    }
  });

  return {
    workflows,
    isLoading,
    error,
    createWorkflow: createWorkflow.mutateAsync,
    updateWorkflow,
    deleteWorkflow,
    isCreating: createWorkflow.isPending,
    isUpdating: updateWorkflow.isPending,
    isDeleting: deleteWorkflow.isPending
  };
};
