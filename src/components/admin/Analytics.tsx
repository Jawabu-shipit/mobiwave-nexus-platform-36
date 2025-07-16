
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PerformanceMetrics } from './analytics/PerformanceMetrics';
import { UserGrowthChart } from './analytics/UserGrowthChart';
import { CampaignTypeChart } from './analytics/CampaignTypeChart';
import { CampaignSummary } from './analytics/CampaignSummary';

export function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');

  const { data: campaignStats } = useQuery({
    queryKey: ['campaign-analytics', timeRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('status, type, created_at, recipient_count, delivered_count, failed_count')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
          console.warn('Error fetching campaigns:', error);
          return {
            totalCampaigns: 0,
            activeCampaigns: 0,
            completedCampaigns: 0,
            totalRecipients: 0,
            totalDelivered: 0,
            deliveryRate: 0
          };
        }

        if (!data || data.length === 0) {
          return {
            totalCampaigns: 0,
            activeCampaigns: 0,
            completedCampaigns: 0,
            totalRecipients: 0,
            totalDelivered: 0,
            deliveryRate: 0
          };
        }

        const totalCampaigns = data.length;
        const activeCampaigns = data.filter(c => c.status === 'sending').length;
        const completedCampaigns = data.filter(c => c.status === 'sent' || c.status === 'completed').length;
        const totalRecipients = data.reduce((sum, c) => sum + (c.recipient_count || 0), 0);
        const totalDelivered = data.reduce((sum, c) => sum + (c.delivered_count || 0), 0);

        return {
          totalCampaigns,
          activeCampaigns,
          completedCampaigns,
          totalRecipients,
          totalDelivered,
          deliveryRate: totalRecipients > 0 ? (totalDelivered / totalRecipients) * 100 : 0
        };
      } catch (error) {
        console.error('Failed to fetch campaign stats:', error);
        return {
          totalCampaigns: 0,
          activeCampaigns: 0,
          completedCampaigns: 0,
          totalRecipients: 0,
          totalDelivered: 0,
          deliveryRate: 0
        };
      }
    }
  });

  const { data: userGrowth } = useQuery({
    queryKey: ['user-growth', timeRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at');

        if (error) {
          console.warn('Error fetching user growth:', error);
          return [];
        }

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          last7Days.push({
            date: date.toISOString().split('T')[0],
            count: 0
          });
        }

        data?.forEach(user => {
          const userDate = new Date(user.created_at || '').toISOString().split('T')[0];
          const dayData = last7Days.find(d => d.date === userDate);
          if (dayData) {
            dayData.count++;
          }
        });

        return last7Days.map(day => ({
          date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: day.count
        }));
      } catch (error) {
        console.error('Failed to fetch user growth:', error);
        return [];
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-green-900 via-green-800 to-green-700 bg-clip-text text-transparent">
              Analytics Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Comprehensive analytics and insights into platform performance and user engagement.
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PerformanceMetrics campaignStats={campaignStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={userGrowth} />
        <CampaignTypeChart />
      </div>

      <CampaignSummary campaignStats={campaignStats} />
    </div>
  );
}
