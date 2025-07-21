import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkContactAction {
  action: 'delete' | 'activate' | 'suspend' | 'move' | 'email';
  contactIds: string[];
  groupId?: string;
  emailContent?: string;
}

export const useAdminContactOperations = () => {
  const queryClient = useQueryClient();

  const bulkContactAction = useMutation({
    mutationFn: async (actionData: BulkContactAction) => {
      const { data, error } = await supabase.functions.invoke('admin-contacts', {
        body: actionData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      
      const { action, contactIds } = variables;
      const count = contactIds.length;
      
      switch (action) {
        case 'delete':
          toast.success(`Successfully deleted ${count} contacts`);
          break;
        case 'activate':
          toast.success(`Successfully activated ${count} contacts`);
          break;
        case 'suspend':
          toast.success(`Successfully suspended ${count} contacts`);
          break;
        case 'move':
          toast.success(`Successfully moved ${count} contacts to group`);
          break;
        case 'email':
          toast.success(`Successfully sent emails to ${count} contacts`);
          break;
      }
    },
    onError: (error: any) => {
      console.error('Admin contact operation failed:', error);
      toast.error(`Operation failed: ${error.message}`);
    }
  });

  const bulkDeleteContacts = async (contactIds: string[]) => {
    return bulkContactAction.mutateAsync({
      action: 'delete',
      contactIds
    });
  };

  const bulkActivateContacts = async (contactIds: string[]) => {
    return bulkContactAction.mutateAsync({
      action: 'activate',
      contactIds
    });
  };

  const bulkSuspendContacts = async (contactIds: string[]) => {
    return bulkContactAction.mutateAsync({
      action: 'suspend',
      contactIds
    });
  };

  const bulkMoveContacts = async (contactIds: string[], groupId: string) => {
    return bulkContactAction.mutateAsync({
      action: 'move',
      contactIds,
      groupId
    });
  };

  const bulkEmailContacts = async (contactIds: string[], emailContent: string) => {
    return bulkContactAction.mutateAsync({
      action: 'email',
      contactIds,
      emailContent
    });
  };

  const bulkValidateContacts = useMutation({
    mutationFn: async ({ contactIds, validationType }: { contactIds: string[]; validationType: 'phone' | 'email' | 'all' }) => {
      const { data, error } = await supabase.functions.invoke('contact-validation', {
        body: {
          contactIds,
          validationType
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const { summary, results } = data;
      toast.success(`Validation complete: ${summary.valid}/${summary.total} contacts valid`);
      
      if (summary.invalid > 0) {
        console.log('Invalid contacts:', results.filter((r: any) => !r.isValid));
      }
    },
    onError: (error: any) => {
      console.error('Contact validation failed:', error);
      toast.error(`Validation failed: ${error.message}`);
    }
  });

  return {
    bulkDeleteContacts,
    bulkActivateContacts,
    bulkSuspendContacts,
    bulkMoveContacts,
    bulkEmailContacts,
    bulkValidateContacts: (contactIds: string[], validationType: 'phone' | 'email' | 'all') => 
      bulkValidateContacts.mutateAsync({ contactIds, validationType }),
    isProcessing: bulkContactAction.isPending || bulkValidateContacts.isPending,
  };
};