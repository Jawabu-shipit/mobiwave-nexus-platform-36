
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Send, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { useCampaignDeliveryTracking } from '@/hooks/useCampaignDeliveryTracking';
import { LoadingState } from '@/components/common/LoadingState';

interface CampaignTrackerProps {
  campaignId?: string;
  showAllCampaigns?: boolean;
}

export const CampaignTracker: React.FC<CampaignTrackerProps> = ({
  campaignId,
  showAllCampaigns = false
}) => {
  const { metrics, isLoading } = useCampaignDeliveryTracking(
    showAllCampaigns ? undefined : campaignId
  );

  if (isLoading) {
    return <LoadingState message="Loading campaign metrics..." />;
  }

  const displayMetrics = campaignId 
    ? metrics.filter(m => m.campaignId === campaignId)
    : metrics;

  if (displayMetrics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active campaigns to track</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayMetrics.map((metric) => (
        <Card key={metric.campaignId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Campaign Delivery</span>
              </span>
              <Badge variant="outline">
                Live Tracking
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Overview */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Delivery Progress</span>
                <span>{metric.deliveryRate.toFixed(1)}% success rate</span>
              </div>
              <Progress value={metric.deliveryRate} className="h-2" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Send className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{metric.totalSent}</div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{metric.delivered}</div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>

              <div className="text-center p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{metric.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>

              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{metric.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-gray-500 text-center">
              Last updated: {metric.lastUpdated.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
