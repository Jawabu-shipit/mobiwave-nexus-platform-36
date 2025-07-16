
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  message: string;
  content?: string;
  metadata?: any;
  recipient_count: number;
  delivered_count: number;
  failed_count: number;
  sent_count: number;
  created_at: string;
}

export function RealTimeTracker() {
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['real-time-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .in('status', ['sending', 'active', 'pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }

      return (data || []) as Campaign[];
    },
    refetchInterval: refreshInterval
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sending':
      case 'active':
        return 'secondary';
      case 'completed':
      case 'sent':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getDeliveryProgress = (campaign: Campaign) => {
    if (campaign.recipient_count === 0) return 0;
    const total = campaign.delivered_count + campaign.failed_count;
    return (total / campaign.recipient_count) * 100;
  };

  const getSuccessRate = (campaign: Campaign) => {
    const total = campaign.delivered_count + campaign.failed_count;
    if (total === 0) return 0;
    return (campaign.delivered_count / total) * 100;
  };

  const getCampaignContent = (campaign: Campaign) => {
    return campaign.content || campaign.message || 'No content';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Live Campaign Tracking
          </h3>
          <p className="text-sm text-gray-600">Real-time delivery status updates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshInterval(2000)}
            className={`px-3 py-1 rounded text-sm ${refreshInterval === 2000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            2s
          </button>
          <button
            onClick={() => setRefreshInterval(5000)}
            className={`px-3 py-1 rounded text-sm ${refreshInterval === 5000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            5s
          </button>
          <button
            onClick={() => setRefreshInterval(10000)}
            className={`px-3 py-1 rounded text-sm ${refreshInterval === 10000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            10s
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(campaign.status)}
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {getCampaignContent(campaign)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Recipients:</span>
                    <p className="text-lg font-bold">{campaign.recipient_count}</p>
                  </div>
                  <div>
                    <span className="font-medium">Delivered:</span>
                    <p className="text-lg font-bold text-green-600">{campaign.delivered_count}</p>
                  </div>
                  <div>
                    <span className="font-medium">Failed:</span>
                    <p className="text-lg font-bold text-red-600">{campaign.failed_count}</p>
                  </div>
                  <div>
                    <span className="font-medium">Success Rate:</span>
                    <p className="text-lg font-bold">{getSuccessRate(campaign).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Delivery Progress</span>
                    <span>{getDeliveryProgress(campaign).toFixed(1)}%</span>
                  </div>
                  <Progress value={getDeliveryProgress(campaign)} className="h-2" />
                </div>

                <div className="text-xs text-gray-500">
                  Started: {new Date(campaign.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Campaigns</h3>
            <p className="text-gray-500">Start a new SMS campaign to see real-time tracking data here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
