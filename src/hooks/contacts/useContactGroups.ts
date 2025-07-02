
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
}

export const useContactGroups = () => {
  const queryClient = useQueryClient();

  const { data: contactGroups = [], isLoading, error, refetch } = useQuery({
    queryKey: ['contact-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createContactGroup = useMutation({
    mutationFn: async (group: Omit<ContactGroup, 'id' | 'user_id' | 'created_at'>) => {
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

  return {
    contactGroups,
    isLoading,
    error,
    createContactGroup: createContactGroup.mutateAsync,
    refetch
  };
};
