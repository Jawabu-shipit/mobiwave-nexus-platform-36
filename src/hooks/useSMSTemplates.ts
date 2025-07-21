/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Please use the hook from 'src/hooks/sms/useSMSTemplates.ts' instead.
 */

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

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: async (): Promise<SMSTemplate[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createTemplate = useMutation({
    mutationFn: async (templateData: CreateSMSTemplateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Extract variables from content
      const variables = templateData.variables || extractVariables(templateData.content);

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

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSMSTemplateData) => {
      // Extract variables if content is being updated
      if (updates.content) {
        updates.variables = extractVariables(updates.content);
      }

      const { data, error } = await supabase
        .from('sms_templates')
        .update(updates)
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

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sms_templates')
        .update({ is_active: false })
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

  const processTemplate = (template: SMSTemplate, variables: Record<string, string>): string => {
    let content = template.content;
    
    // Replace variables in the format {{variable}}
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`;
      content = content.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
    });
    
    return content;
  };

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    processTemplate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};

// Helper function to extract variables from template content
function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g);
  return matches ? matches.map(match => match.slice(2, -2).trim()) : [];
}