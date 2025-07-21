
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  usersByRole: Record<string, number>;
  usersByType: Record<string, number>;
}

export const useUserAnalytics = () => {
  return useQuery({
    queryKey: ['user-analytics'],
    queryFn: async (): Promise<UserAnalytics> => {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, role, user_type, created_at');

      if (error) throw error;

      const totalUsers = users?.length || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const newUsersThisMonth = users?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length || 0;

      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const newUsersLastMonth = users?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastMonthYear;
      }).length || 0;

      const userGrowthRate = lastMonthYear > 0 ? 
        ((newUsersThisMonth - newUsersLastMonth) / Math.max(newUsersLastMonth, 1)) * 100 : 0;

      const usersByRole = (users || []).reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const usersByType = (users || []).reduce((acc, user) => {
        const type = user.user_type || 'demo';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalUsers,
        activeUsers: totalUsers, // Simplified - could be enhanced with activity tracking
        newUsersThisMonth,
        userGrowthRate,
        usersByRole,
        usersByType
      };
    }
  });
};
