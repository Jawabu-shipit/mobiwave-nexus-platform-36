
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  user_count: number;
  created_at: string;
  created_by: string;
  is_active: boolean;
}

interface CreateSegmentData {
  name: string;
  description: string;
  criteria: any;
}

export const useUserSegmentation = () => {
  const queryClient = useQueryClient();

  // Since user_segments table doesn't exist, return mock data
  const { data: segments = [], isLoading } = useQuery({
    queryKey: ['user-segments'],
    queryFn: async (): Promise<UserSegment[]> => {
      console.log('User segments table not found, returning mock data');
      
      // Return mock segments data
      return [
        {
          id: '1',
          name: 'Premium Users',
          description: 'Users with premium service subscriptions',
          criteria: { service_type: 'premium', status: 'active' },
          user_count: 45,
          created_at: new Date().toISOString(),
          created_by: 'system',
          is_active: true
        },
        {
          id: '2',
          name: 'High Usage',
          description: 'Users with high message volume',
          criteria: { monthly_messages: { gte: 1000 } },
          user_count: 23,
          created_at: new Date().toISOString(),
          created_by: 'system',
          is_active: true
        }
      ];
    }
  });

  const createSegment = useMutation({
    mutationFn: async (segmentData: CreateSegmentData): Promise<UserSegment> => {
      console.log('Creating segment (mock):', segmentData);
      
      // Return mock created segment
      return {
        id: crypto.randomUUID(),
        ...segmentData,
        user_count: 0,
        created_at: new Date().toISOString(),
        created_by: 'current_user',
        is_active: true
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-segments'] });
      toast.success('User segment created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create segment: ${error.message}`);
    }
  });

  const deleteSegment = useMutation({
    mutationFn: async (segmentId: string) => {
      console.log('Deleting segment (mock):', segmentId);
      // Mock deletion
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-segments'] });
      toast.success('Segment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete segment: ${error.message}`);
    }
  });

  const getSegmentUsers = async (segmentId: string) => {
    console.log('Getting segment users (mock):', segmentId);
    
    // Return mock user data
    return [
      {
        id: '1',
        segment_id: segmentId,
        user_id: 'user1',
        added_at: new Date().toISOString(),
        profiles: {
          id: 'user1',
          email: 'user1@example.com',
          first_name: 'John',
          last_name: 'Doe'
        }
      }
    ];
  };

  return {
    segments,
    isLoading,
    createSegment: createSegment.mutateAsync,
    deleteSegment: deleteSegment.mutateAsync,
    getSegmentUsers,
    isCreating: createSegment.isPending,
    isDeleting: deleteSegment.isPending
  };
};
