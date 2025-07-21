import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BillingData {
  availableCredits: number;
  monthlySpent: number;
  usageRate: number;
  totalTransactions: number;
  lastPurchaseDate?: string;
}

export const useBillingData = () => {
  const { data: billingData, isLoading, error } = useQuery({
    queryKey: ['billing-data'],
    queryFn: async (): Promise<BillingData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          availableCredits: 0,
          monthlySpent: 0,
          usageRate: 0,
          totalTransactions: 0
        };
      }

      // Get user credits
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits_remaining, credits_purchased, last_purchase_date')
        .eq('user_id', user.id)
        .single();

      const creditsIsObject = credits !== null && typeof credits === 'object';
      const safeCredits = (creditsIsObject && 'credits_remaining' in credits!)
        ? credits as { credits_remaining: number; credits_purchased: number; last_purchase_date?: string }
        : { credits_remaining: 0, credits_purchased: 0, last_purchase_date: undefined };

      // Get monthly spending (current month)
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const { data: monthlyTransactions, error: monthlyError } = await supabase
        .from('credit_transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString())
        .eq('type', 'purchase');

      // Type guard for transaction objects
      function isValidTransaction(t: any): t is { amount: number } {
        return t && typeof t === 'object' && typeof t.amount === 'number';
      }

      // Fallback if columns are missing or data is not the expected shape
      const safeMonthlyTransactions = Array.isArray(monthlyTransactions)
        ? (monthlyTransactions.filter(isValidTransaction) as unknown as { amount: number }[])
        : [];

      // Get total transaction count
      const { count: totalTransactions } = await supabase
        .from('credit_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate monthly spent
      const monthlySpent = safeMonthlyTransactions.reduce((sum, transaction) => {
        return sum + transaction.amount;
      }, 0) || 0;

      // Calculate usage rate (assuming a monthly plan limit)
      const monthlyPlanLimit = 100; // This could come from user's subscription plan
      const usageRate = monthlyPlanLimit > 0 ? (monthlySpent / monthlyPlanLimit) * 100 : 0;

      return {
        availableCredits: (typeof safeCredits.credits_remaining === 'number') ? safeCredits.credits_remaining : 0,
        monthlySpent,
        usageRate: Math.min(usageRate, 100),
        totalTransactions: totalTransactions || 0,
        lastPurchaseDate: (typeof safeCredits.last_purchase_date === 'string') ? safeCredits.last_purchase_date : undefined
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    billingData,
    isLoading,
    error
  };
};