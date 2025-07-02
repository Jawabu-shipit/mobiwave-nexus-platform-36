
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare, DollarSign } from 'lucide-react';

interface PerformanceMetricsProps {
  campaignStats?: {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    totalRecipients: number;
    totalDelivered: number;
    deliveryRate: number;
  };
}

export function PerformanceMetrics({ campaignStats }: PerformanceMetricsProps) {
  const metrics = [
    {
      title: 'Total Campaigns',
      value: campaignStats?.totalCampaigns || 0,
      change: '+12%',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Messages Sent',
      value: (campaignStats?.totalRecipients || 0).toLocaleString(),
      change: '+23%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Delivery Rate',
      value: `${(campaignStats?.deliveryRate || 0).toFixed(1)}%`,
      change: '+5%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Revenue',
      value: '$12,430',
      change: '+18%',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-sm text-green-600 font-medium">{metric.change} from last month</p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
