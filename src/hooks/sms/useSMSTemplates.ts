import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SMSTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateSMSTemplateData {
  name: string;
  content: string;
  category: string;
  variables?: string[];
  is_active?: boolean;
}

interface UpdateSMSTemplateData {
  id: string;
  name?: string;
  content?: string;
  category?: string;
  variables?: string[];
  is_active?: boolean;
}

export const useSMSTemplates = () => {
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: async (): Promise<SMSTemplate[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Create template
  const createTemplate = useMutation({
    mutationFn: async (templateData: CreateSMSTemplateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Extract variables from content
      const variables = extractVariables(templateData.content);

      const { data, error } = await supabase
        .from('sms_templates')
        .insert({
          ...templateData,
          user_id: user.id,
          variables,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create template: ${error.message}`);
    }
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSMSTemplateData) => {
      // Extract variables if content is being updated
      const updateData: any = { ...updates };
      if (updates.content) {
        updateData.variables = extractVariables(updates.content);
      }

      const { data, error } = await supabase
        .from('sms_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update template: ${error.message}`);
    }
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sms_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete template: ${error.message}`);
    }
  });

  // Utility function to extract variables from template content
  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    return matches ? Array.from(new Set(matches.map(match => match.slice(2, -2).trim()))) : [];
  };

  // Utility function to replace variables in template content
  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    extractVariables,
    replaceVariables,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};