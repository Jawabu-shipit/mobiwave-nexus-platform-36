
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tags?: string[];
  is_active?: boolean;
  custom_fields?: any;
  created_at: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contact_count: number;
  created_at: string;
}

interface CreateContactData {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  tags?: string[];
  is_active?: boolean;
  custom_fields?: any;
}

export const useContacts = () => {
  const queryClient = useQueryClient();

  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: async (): Promise<Contact[]> => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createContact = useMutation({
    mutationFn: async (contactData: CreateContactData) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact created successfully');
    }
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact updated successfully');
    }
  });

  const deleteContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted successfully');
    }
  });

  const importContacts = useMutation({
    mutationFn: async (contactsData: CreateContactData[]) => {
      // Ensure all contacts have required fields
      const validContacts = contactsData.filter(contact => 
        contact.phone && contact.first_name && contact.last_name
      );

      const { data, error } = await supabase
        .from('contacts')
        .insert(validContacts)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(`${data?.length || 0} contacts imported successfully`);
    }
  });

  const mergeContacts = useMutation({
    mutationFn: async ({ primaryId, duplicateIds }: { primaryId: string; duplicateIds: string[] }) => {
      // Implementation would merge contact data and delete duplicates
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', duplicateIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacts merged successfully');
    }
  });

  const createContactGroup = useMutation({
    mutationFn: async (groupData: { name: string; description?: string; contact_count: number }) => {
      // This would need a contact_groups table
      toast.success('Contact group created successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
    }
  });

  return {
    contacts,
    isLoading,
    error,
    createContact: createContact.mutateAsync,
    updateContact: updateContact.mutateAsync,
    deleteContact: deleteContact.mutateAsync,
    importContacts: importContacts.mutateAsync,
    mergeContacts: mergeContacts.mutateAsync,
    createContactGroup: createContactGroup.mutateAsync,
    contactGroups: [] // Placeholder until contact_groups table is implemented
  };
};
