
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

export interface ContactGroupMember {
  id: string;
  group_id: string;
  contact_id: string;
  added_at: string;
  contacts: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
}

export const useContactGroups = () => {
  const queryClient = useQueryClient();

  const { data: contactGroups = [], isLoading, error, refetch } = useQuery({
    queryKey: ['contact-groups'],
    queryFn: async (): Promise<ContactGroup[]> => {
      const { data, error } = await supabase
        .from('contact_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createContactGroup = useMutation({
    mutationFn: async (group: Omit<ContactGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contact_groups')
        .insert([{
          name: group.name,
          description: group.description,
          contact_count: group.contact_count || 0,
          user_id: user.id
        }])
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
      toast.error(`Failed to create contact group: ${error.message}`);
    }
  });

  const updateContactGroup = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContactGroup> }) => {
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
      toast.error(`Failed to update contact group: ${error.message}`);
    }
  });

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
      toast.success('Contact group deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete contact group: ${error.message}`);
    }
  });

  const addContactToGroup = useMutation({
    mutationFn: async ({ groupId, contactId }: { groupId: string; contactId: string }) => {
      const { data, error } = await supabase
        .from('contact_group_members')
        .insert([{
          group_id: groupId,
          contact_id: contactId
        }])
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
      toast.error(`Failed to add contact to group: ${error.message}`);
    }
  });

  const removeContactFromGroup = useMutation({
    mutationFn: async ({ groupId, contactId }: { groupId: string; contactId: string }) => {
      const { error } = await supabase
        .from('contact_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('contact_id', contactId);

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

  return {
    contactGroups,
    isLoading,
    error,
    createContactGroup: createContactGroup.mutateAsync,
    updateContactGroup: updateContactGroup.mutateAsync,
    deleteContactGroup: deleteContactGroup.mutateAsync,
    addContactToGroup: addContactToGroup.mutateAsync,
    removeContactFromGroup: removeContactFromGroup.mutateAsync,
    refetch
  };
};

export const useContactGroupMembers = (groupId?: string) => {
  return useQuery({
    queryKey: ['contact-group-members', groupId],
    queryFn: async (): Promise<ContactGroupMember[]> => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('contact_group_members')
        .select(`
          *,
          contacts:contact_id (
            id,
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId
  });
};
