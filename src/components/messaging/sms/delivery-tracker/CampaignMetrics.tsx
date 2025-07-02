
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Target,
  Timer
} from 'lucide-react';

interface CampaignDelivery {
  id: string;
  name: string;
  status: 'preparing' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  startTime: Date;
  estimatedCompletion?: Date;
  deliveryRate?: number;
  avgDeliveryTime?: number;
}

interface CampaignMetricsProps {
  delivery: CampaignDelivery;
}

export function CampaignMetrics({ delivery }: CampaignMetricsProps) {
  const completionRate = (delivery.sent / delivery.totalRecipients) * 100;
  const deliveryRate = delivery.sent > 0 ? (delivery.delivered / delivery.sent) * 100 : 0;
  const failureRate = delivery.sent > 0 ? (delivery.failed / delivery.sent) * 100 : 0;
  
  const timeElapsed = new Date().getTime() - delivery.startTime.getTime();
  const timeElapsedMinutes = Math.floor(timeElapsed / (1000 * 60));
  
  const estimatedTimeRemaining = delivery.estimatedCompletion 
    ? Math.max(0, delivery.estimatedCompletion.getTime() - new Date().getTime())
    : 0;
  const estimatedMinutesRemaining = Math.floor(estimatedTimeRemaining / (1000 * 60));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'sending': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'sending': return <Timer className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Campaign Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaign Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Completion</span>
            <span className="font-medium">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon(delivery.status)}
            <span className={getStatusColor(delivery.status)}>
              {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Delivery Rate</span>
            <span className={`font-medium ${deliveryRate >= 95 ? 'text-green-600' : deliveryRate >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
              {deliveryRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Failure Rate</span>
            <span className={`font-medium ${failureRate <= 5 ? 'text-green-600' : failureRate <= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
              {failureRate.toFixed(1)}%
            </span>
          </div>
          
          {delivery.avgDeliveryTime && (
            <div className="flex justify-between text-sm">
              <span>Avg. Delivery</span>
              <span className="font-medium">{delivery.avgDeliveryTime}s</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timing Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Time Elapsed</span>
            <span className="font-medium">
              {timeElapsedMinutes < 60 
                ? `${timeElapsedMinutes}m` 
                : `${Math.floor(timeElapsedMinutes / 60)}h ${timeElapsedMinutes % 60}m`}
            </span>
          </div>
          
          {delivery.status === 'sending' && estimatedMinutesRemaining > 0 && (
            <div className="flex justify-between text-sm">
              <span>Est. Remaining</span>
              <span className="font-medium text-blue-600">
                {estimatedMinutesRemaining < 60 
                  ? `${estimatedMinutesRemaining}m` 
                  : `${Math.floor(estimatedMinutesRemaining / 60)}h ${estimatedMinutesRemaining % 60}m`}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>Started</span>
            <span className="font-medium">
              {delivery.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
