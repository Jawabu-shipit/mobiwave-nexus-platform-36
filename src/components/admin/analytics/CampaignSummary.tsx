
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from 'lucide-react';

interface CampaignStats {
  deliveryRate: number;
  activeCampaigns: number;
  totalDelivered: number;
}

interface CampaignSummaryProps {
  campaignStats?: CampaignStats;
}

export function CampaignSummary({ campaignStats }: CampaignSummaryProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Campaign Performance Summary
        </CardTitle>
        <CardDescription>
          Key performance indicators for recent campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              {campaignStats?.deliveryRate.toFixed(1) || 0}%
            </h3>
            <p className="text-blue-700 font-medium">Delivery Rate</p>
            <p className="text-sm text-blue-600 mt-1">Average across all campaigns</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              {campaignStats?.activeCampaigns || 0}
            </h3>
            <p className="text-green-700 font-medium">Active Campaigns</p>
            <p className="text-sm text-green-600 mt-1">Currently running</p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <h3 className="text-2xl font-bold text-purple-900 mb-2">
              {((campaignStats?.totalDelivered || 0) / 1000).toFixed(1)}K
            </h3>
            <p className="text-purple-700 font-medium">Messages Delivered</p>
            <p className="text-sm text-purple-600 mt-1">This period</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
