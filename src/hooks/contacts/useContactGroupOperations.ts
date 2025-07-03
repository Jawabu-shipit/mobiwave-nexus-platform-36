import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddContactToGroupData {
  contactId: string;
  groupId: string;
}

interface RemoveContactFromGroupData {
  contactId: string;
  groupId: string;
}

interface MoveContactsBetweenGroupsData {
  contactIds: string[];
  fromGroupId: string;
  toGroupId: string;
}

interface BulkAddContactsToGroupData {
  contactIds: string[];
  groupId: string;
}

export const useContactGroupOperations = () => {
  const queryClient = useQueryClient();

  const addContactToGroup = useMutation({
    mutationFn: async ({ contactId, groupId }: AddContactToGroupData) => {
      const { data, error } = await supabase
        .from('contact_group_members')
        .insert({
          contact_id: contactId,
          group_id: groupId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      queryClient.invalidateQueries({ queryKey: ['contact-group-members'] });
      toast.success('Contact added to group successfully');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Contact is already in this group');
      } else {
        toast.error(`Failed to add contact to group: ${error.message}`);
      }
    }
  });

  const removeContactFromGroup = useMutation({
    mutationFn: async ({ contactId, groupId }: RemoveContactFromGroupData) => {
      const { error } = await supabase
        .from('contact_group_members')
        .delete()
        .eq('contact_id', contactId)
        .eq('group_id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      queryClient.invalidateQueries({ queryKey: ['contact-group-members'] });
      toast.success('Contact removed from group successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove contact from group: ${error.message}`);
    }
  });

  const bulkAddContactsToGroup = useMutation({
    mutationFn: async ({ contactIds, groupId }: BulkAddContactsToGroupData) => {
      const insertData = contactIds.map(contactId => ({
        contact_id: contactId,
        group_id: groupId,
      }));

      const { data, error } = await supabase
        .from('contact_group_members')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      queryClient.invalidateQueries({ queryKey: ['contact-group-members'] });
      toast.success(`Added ${data?.length || 0} contacts to group successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to add contacts to group: ${error.message}`);
    }
  });

  const moveContactsBetweenGroups = useMutation({
    mutationFn: async ({ contactIds, fromGroupId, toGroupId }: MoveContactsBetweenGroupsData) => {
      // Remove from source group
      const { error: removeError } = await supabase
        .from('contact_group_members')
        .delete()
        .eq('group_id', fromGroupId)
        .in('contact_id', contactIds);

      if (removeError) throw removeError;

      // Add to destination group
      const insertData = contactIds.map(contactId => ({
        contact_id: contactId,
        group_id: toGroupId,
      }));

      const { data, error: addError } = await supabase
        .from('contact_group_members')
        .insert(insertData)
        .select();

      if (addError) throw addError;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      queryClient.invalidateQueries({ queryKey: ['contact-group-members'] });
      toast.success(`Moved ${data?.length || 0} contacts between groups successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to move contacts: ${error.message}`);
    }
  });

  const bulkRemoveContactsFromGroup = useMutation({
    mutationFn: async ({ contactIds, groupId }: { contactIds: string[]; groupId: string }) => {
      const { error } = await supabase
        .from('contact_group_members')
        .delete()
        .eq('group_id', groupId)
        .in('contact_id', contactIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      queryClient.invalidateQueries({ queryKey: ['contact-group-members'] });
      toast.success('Contacts removed from group successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove contacts from group: ${error.message}`);
    }
  });

  return {
    addContactToGroup: addContactToGroup.mutateAsync,
    removeContactFromGroup: removeContactFromGroup.mutateAsync,
    bulkAddContactsToGroup: bulkAddContactsToGroup.mutateAsync,
    moveContactsBetweenGroups: moveContactsBetweenGroups.mutateAsync,
    bulkRemoveContactsFromGroup: bulkRemoveContactsFromGroup.mutateAsync,
    isAddingToGroup: addContactToGroup.isPending,
    isRemovingFromGroup: removeContactFromGroup.isPending,
    isBulkAdding: bulkAddContactsToGroup.isPending,
    isMoving: moveContactsBetweenGroups.isPending,
    isBulkRemoving: bulkRemoveContactsFromGroup.isPending,
  };
};