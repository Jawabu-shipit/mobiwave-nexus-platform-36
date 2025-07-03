import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContactGroup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  contact_count: number;
  created_at: string;
  updated_at: string;
}

interface CreateContactGroupData {
  name: string;
  description?: string;
  contact_count: number;
}

interface UpdateContactGroupData {
  id: string;
  updates: {
    name?: string;
    description?: string;
  };
}

interface AddContactsToGroupData {
  groupId: string;
  contactIds: string[];
}

interface RemoveContactsFromGroupData {
  groupId: string;
  contactIds: string[];
}

export const useContactGroups = () => {
  const queryClient = useQueryClient();

  // Fetch contact groups
  const { data: contactGroups = [], isLoading, error } = useQuery({
    queryKey: ['contact-groups'],
    queryFn: async (): Promise<ContactGroup[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contact_groups')
        .select('id, user_id, name, description, contact_count, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Create contact group
  const createContactGroup = useMutation({
    mutationFn: async (groupData: CreateContactGroupData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contact_groups')
        .insert({
          ...groupData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      toast.success('Contact group created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create group: ${error.message}`);
    }
  });

  // Update contact group
  const updateContactGroup = useMutation({
    mutationFn: async ({ id, updates }: UpdateContactGroupData) => {
      const { data, error } = await supabase
        .from('contact_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      toast.success('Contact group updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update group: ${error.message}`);
    }
  });

  // Delete contact group
  const deleteContactGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      queryClient.invalidateQueries({ queryKey: ['contact-group-members'] });
      toast.success('Contact group deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete group: ${error.message}`);
    }
  });

  // Add contacts to group
  const addContactsToGroup = useMutation({
    mutationFn: async ({ groupId, contactIds }: AddContactsToGroupData) => {
      const members = contactIds.map(contactId => ({
        group_id: groupId,
        contact_id: contactId,
      }));

      const { data, error } = await supabase
        .from('contact_group_members')
        .insert(members)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
      queryClient.invalidateQueries({ queryKey: ['contact-group-members'] });
      toast.success('Contacts added to group successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to add contacts to group: ${error.message}`);
    }
  });

  // Remove contacts from group
  const removeContactsFromGroup = useMutation({
    mutationFn: async ({ groupId, contactIds }: RemoveContactsFromGroupData) => {
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

  // Get contacts in a group
  const getGroupContacts = async (groupId: string) => {
    const { data, error } = await supabase
      .from('contact_group_members')
      .select(`
        contact_id,
        contacts:contact_id (
          id,
          first_name,
          last_name,
          phone,
          email,
          is_active
        )
      `)
      .eq('group_id', groupId);

    if (error) throw error;
    return data?.map(member => member.contacts).filter(Boolean) || [];
  };

  return {
    contactGroups,
    isLoading,
    error,
    createContactGroup: createContactGroup.mutateAsync,
    updateContactGroup: updateContactGroup.mutateAsync,
    deleteContactGroup: deleteContactGroup.mutateAsync,
    addContactsToGroup: addContactsToGroup.mutateAsync,
    removeContactsFromGroup: removeContactsFromGroup.mutateAsync,
    getGroupContacts,
    isCreating: createContactGroup.isPending,
    isUpdating: updateContactGroup.isPending,
    isDeleting: deleteContactGroup.isPending,
  };
};