
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from './useContactsData';

export const useContactMutations = () => {
  const queryClient = useQueryClient();

  const createContact = useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated');
      }

      const contactData = {
        ...contact,
        user_id: user.id
      };

      console.log('Creating contact with data:', contactData);

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create contact: ${error.message}`);
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
    },
    onError: (error: any) => {
      toast.error(`Failed to update contact: ${error.message}`);
    }
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    }
  });

  const importContacts = useMutation({
    mutationFn: async (contacts: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const contactsWithUserId = contacts.map(contact => ({
        ...contact,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsWithUserId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      throw error;
    }
  });

  const mergeContacts = useMutation({
    mutationFn: async ({ keepContact, duplicateIds }: { keepContact: Contact; duplicateIds: string[] }) => {
      // Delete duplicate contacts
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', duplicateIds);

      if (error) throw error;
      return { mergedCount: duplicateIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (error: any) => {
      console.error('Merge error:', error);
      throw error;
    }
  });

  return {
    createContact: createContact.mutateAsync,
    updateContact: updateContact.mutateAsync,
    deleteContact: deleteContact.mutateAsync,
    importContacts: importContacts.mutateAsync,
    mergeContacts: mergeContacts.mutateAsync,
  };
};
