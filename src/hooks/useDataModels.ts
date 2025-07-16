import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type DataModelField = {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'email' | 'phone';
};

export type DataModel = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  fields: DataModelField[];
  created_at: string;
  updated_at: string;
};

export type NewDataModel = {
  name: string;
  description?: string | null;
  fields?: DataModelField[];
  user_id: string;
};

const TABLE_NAME = 'data_models';

// Fetch all data models for the current user
const fetchDataModels = async (): Promise<DataModel[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

// Create a new data model
const createDataModel = async (modelData: NewDataModel): Promise<DataModel> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{
      ...modelData,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Update a data model
const updateDataModel = async (modelId: string, updates: Partial<DataModel>): Promise<DataModel> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', modelId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Delete a data model
const deleteDataModel = async (modelId: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', modelId);

  if (error) {
    throw new Error(error.message);
  }
};

export function useDataModels() {
  const queryClient = useQueryClient();

  const { data: dataModels, isLoading: isLoadingModels, error: modelsError } = useQuery<DataModel[], Error>({
    queryKey: ['dataModels'],
    queryFn: fetchDataModels,
  });

  const createModelMutation = useMutation<DataModel, Error, Omit<NewDataModel, 'user_id'>>({
    mutationFn: (modelData) => createDataModel({ ...modelData, user_id: '' }), // user_id will be set in the function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataModels'] });
      toast.success('Data model created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create data model: ${error.message}`);
    },
  });

  const updateModelMutation = useMutation<DataModel, Error, { id: string; updates: Partial<DataModel> }>({
    mutationFn: ({ id, updates }) => updateDataModel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataModels'] });
      toast.success('Data model updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update data model: ${error.message}`);
    },
  });

  const deleteModelMutation = useMutation<void, Error, string>({
    mutationFn: deleteDataModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataModels'] });
      toast.success('Data model deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete data model: ${error.message}`);
    },
  });

  return {
    dataModels,
    isLoadingModels,
    modelsError,
    createDataModel: createModelMutation.mutate,
    updateDataModel: updateModelMutation.mutate,
    deleteDataModel: deleteModelMutation.mutate,
    isCreatingModel: createModelMutation.isPending,
    isUpdatingModel: updateModelMutation.isPending,
    isDeletingModel: deleteModelMutation.isPending,
  };
}