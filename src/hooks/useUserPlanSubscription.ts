
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  service_limits: Record<string, number>;
  is_active: boolean;
}

export interface UserPlanSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  plan: SubscriptionPlan;
}

export const useUserPlanSubscription = () => {
  const queryClient = useQueryClient();

  const { data: userPlan, isLoading } = useQuery({
    queryKey: ['user-plan-subscription'],
    queryFn: async (): Promise<UserPlanSubscription | null> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      // Get user's plan subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_plan_subscriptions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      if (!subscription) return null;

      // Get plan details separately
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscription.plan_id)
        .single();

      if (planError) throw planError;

      // Transform the data to match expected interface
      const transformedData: UserPlanSubscription = {
        ...subscription,
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description || '',
          price: plan.price || 0,
          billing_cycle: plan.billing_cycle,
          features: Array.isArray(plan.features) 
            ? (plan.features as any[]).map(f => String(f))
            : [],
          service_limits: typeof plan.service_limits === 'object' 
            ? plan.service_limits as Record<string, number>
            : {},
          is_active: plan.is_active || false
        }
      };

      return transformedData;
    }
  });

  const { data: availablePlans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      
      // Transform the data to match expected interface
      const transformedData: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price: plan.price || 0,
        billing_cycle: plan.billing_cycle,
        features: Array.isArray(plan.features) 
          ? (plan.features as any[]).map(f => String(f))
          : [],
        service_limits: typeof plan.service_limits === 'object' 
          ? plan.service_limits as Record<string, number>
          : {},
        is_active: plan.is_active || false
      }));

      return transformedData;
    }
  });

  const upgradePlan = useMutation({
    mutationFn: async (planId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Deactivate current plan
      if (userPlan) {
        await supabase
          .from('user_plan_subscriptions')
          .update({ status: 'inactive' })
          .eq('id', userPlan.id);
      }

      // Create new plan subscription
      const { data, error } = await supabase
        .from('user_plan_subscriptions')
        .insert({
          user_id: user.user.id,
          plan_id: planId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-plan-subscription'] });
      toast.success('Plan upgraded successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to upgrade plan: ${error.message}`);
    }
  });

  return {
    userPlan,
    availablePlans,
    isLoading,
    upgradePlan: upgradePlan.mutateAsync,
    isUpgrading: upgradePlan.isPending
  };
};
