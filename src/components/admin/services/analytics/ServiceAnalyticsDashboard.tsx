
import React from 'react';
import { Users, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { ServiceMetricsCard } from './ServiceMetricsCard';
import { ServiceUsageChart } from './ServiceUsageChart';
import { ServiceRevenueChart } from './ServiceRevenueChart';
import { ServiceStatusDistribution } from './ServiceStatusDistribution';
import { useServiceAnalytics } from '@/hooks/useServiceAnalytics';

export function ServiceAnalyticsDashboard() {
  const { metrics, usageData, statusData, revenueData, isLoading } = useServiceAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ServiceMetricsCard
          title="Total Services"
          value={metrics?.total_services || 0}
          icon={<Activity className="w-4 h-4 text-muted-foreground" />}
        />
        <ServiceMetricsCard
          title="Active Subscriptions"
          value={metrics?.active_subscriptions || 0}
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
        />
        <ServiceMetricsCard
          title="Average Adoption"
          value={metrics?.average_adoption_rate || 0}
          format="percentage"
          icon={<TrendingUp className="w-4 h-4 text-muted-foreground" />}
        />
        <ServiceMetricsCard
          title="Monthly Revenue"
          value={435000}
          format="currency"
          previousValue={380000}
          icon={<DollarSign className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceUsageChart data={usageData} />
        <ServiceStatusDistribution data={statusData} />
      </div>

      {/* Revenue Chart */}
      <ServiceRevenueChart data={revenueData} />
    </div>
  );
}
