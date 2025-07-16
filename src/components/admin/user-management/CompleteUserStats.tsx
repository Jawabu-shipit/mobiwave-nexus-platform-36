
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  Shield, 
  Database, 
  Globe,
  TrendingUp,
  Activity
} from 'lucide-react';

interface CompleteUserStatsProps {
  stats: {
    total: number;
    with_profiles: number;
    without_profiles: number;
    admin_users: number;
    confirmed: number;
  };
}

export function CompleteUserStats({ stats }: CompleteUserStatsProps) {
  const statsCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All registered users'
    },
    {
      title: 'Complete Profiles',
      value: stats.with_profiles,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Users with complete profiles'
    },
    {
      title: 'Missing Profiles',
      value: stats.without_profiles,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Auth users without profiles'
    },
    {
      title: 'Admin Users',
      value: stats.admin_users,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Super admins and admins'
    },
    {
      title: 'Verified Users',
      value: stats.confirmed,
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Email confirmed users'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
