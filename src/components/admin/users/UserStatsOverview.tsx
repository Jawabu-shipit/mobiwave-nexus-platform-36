
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCheck, UserX, TrendingUp, TrendingDown } from 'lucide-react';

interface UserStats {
  total_users: number;
  active_users: number;
  new_users_today: number;
  inactive_users: number;
  growth_rate: number;
}

const fetchUserStats = async (): Promise<UserStats> => {
  // Get total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get users created today
  const today = new Date().toISOString().split('T')[0];
  const { count: newUsersToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00`);

  // For simplicity, we'll calculate some mock stats
  // In a real app, you'd have more sophisticated queries
  const activeUsers = Math.floor((totalUsers || 0) * 0.8);
  const inactiveUsers = (totalUsers || 0) - activeUsers;
  const growthRate = 12.5; // Mock growth rate

  return {
    total_users: totalUsers || 0,
    active_users: activeUsers,
    new_users_today: newUsersToday || 0,
    inactive_users: inactiveUsers,
    growth_rate: growthRate
  };
};

export function UserStatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Users',
      value: stats?.active_users || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'New Today',
      value: stats?.new_users_today || 0,
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Inactive',
      value: stats?.inactive_users || 0,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Growth Rate',
      value: `${stats?.growth_rate || 0}%`,
      icon: stats?.growth_rate && stats.growth_rate > 0 ? TrendingUp : TrendingDown,
      color: stats?.growth_rate && stats.growth_rate > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats?.growth_rate && stats.growth_rate > 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
