
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MessageSquare, Mail, Phone, Users } from 'lucide-react';

interface UsageData {
  date: string;
  sms_count: number;
  email_count: number;
  users_active: number;
}

const fetchUsageData = async (): Promise<UsageData[]> => {
  // This would typically fetch from your analytics tables
  // For now, we'll return mock data
  const mockData: UsageData[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      sms_count: Math.floor(Math.random() * 1000) + 500,
      email_count: Math.floor(Math.random() * 500) + 200,
      users_active: Math.floor(Math.random() * 100) + 50
    });
  }
  
  return mockData;
};

export function UsageAnalytics() {
  const { data: usageData = [], isLoading } = useQuery({
    queryKey: ['usage-analytics'],
    queryFn: fetchUsageData
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalStats = usageData.reduce((acc, day) => ({
    sms: acc.sms + day.sms_count,
    email: acc.email + day.email_count,
    activeUsers: Math.max(acc.activeUsers, day.users_active)
  }), { sms: 0, email: 0, activeUsers: 0 });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total SMS Sent</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.sms.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.email.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.activeUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Message Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sms_count" fill="#3B82F6" name="SMS" />
                <Bar dataKey="email_count" fill="#10B981" name="Email" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users_active" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
