
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Survey {
  id: string;
  title: string;
  description?: string;
  status: string;
  question_flow: any[];
  created_at: string;
  updated_at: string;
  user_id: string;
  expires_at?: string;
  published_at?: string;
  target_audience?: any;
  distribution_channels?: any[];
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_phone: string;
  responses: any;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

export const useSurveys = () => {
  const queryClient = useQueryClient();

  const { data: surveys, isLoading, error } = useQuery({
    queryKey: ['surveys'],
    queryFn: async (): Promise<Survey[]> => {
      // Since surveys table doesn't exist in the database, return empty array
      // This allows the UI to work without breaking
      console.log('Surveys table not found in database schema, returning empty array');
      return [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createSurvey = useMutation({
    mutationFn: async (surveyData: Omit<Survey, 'id' | 'created_at' | 'updated_at'>) => {
      // Since surveys table doesn't exist, simulate creation
      console.log('Creating survey (simulated):', surveyData);
      
      // Return mock data to maintain interface compatibility
      const mockSurvey: Survey = {
        id: crypto.randomUUID(),
        ...surveyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockSurvey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey created successfully (demo mode)');
    },
    onError: (error: any) => {
      toast.error(`Failed to create survey: ${error.message}`);
    }
  });

  const updateSurvey = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Survey> & { id: string }) => {
      // Since surveys table doesn't exist, simulate update
      console.log('Updating survey (simulated):', id, updates);
      
      return {
        id,
        ...updates,
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey updated successfully (demo mode)');
    },
    onError: (error: any) => {
      toast.error(`Failed to update survey: ${error.message}`);
    }
  });

  const publishSurvey = useMutation({
    mutationFn: async (surveyId: string) => {
      // Since surveys table doesn't exist, simulate publish
      console.log('Publishing survey (simulated):', surveyId);
      
      return {
        id: surveyId,
        status: 'active',
        published_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey published successfully (demo mode)');
    },
    onError: (error: any) => {
      toast.error(`Failed to publish survey: ${error.message}`);
    }
  });

  return {
    surveys: surveys || [],
    isLoading,
    error,
    createSurvey: createSurvey.mutateAsync,
    updateSurvey: updateSurvey.mutateAsync,
    publishSurvey: publishSurvey.mutateAsync,
    isCreating: createSurvey.isPending,
    isUpdating: updateSurvey.isPending
  };
};

export const useSurveyResponses = (surveyId?: string) => {
  return useQuery({
    queryKey: ['survey-responses', surveyId],
    queryFn: async (): Promise<SurveyResponse[]> => {
      if (!surveyId) return [];
      
      // Since survey_responses table doesn't exist, return empty array
      console.log('Survey responses table not found in database schema, returning empty array');
      return [];
    },
    enabled: !!surveyId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
