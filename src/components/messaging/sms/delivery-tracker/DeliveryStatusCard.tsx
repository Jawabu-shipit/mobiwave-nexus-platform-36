
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye
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
  deliveryStatuses: any[];
}

interface DeliveryStatusCardProps {
  delivery: CampaignDelivery;
}

export function DeliveryStatusCard({ delivery }: DeliveryStatusCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'sending': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    return (delivery.sent / delivery.totalRecipients) * 100;
  };

  const calculateDeliveryRate = () => {
    if (delivery.sent === 0) return 0;
    return (delivery.delivered / delivery.sent) * 100;
  };

  const formatTimeRemaining = (estimatedCompletion?: Date) => {
    if (!estimatedCompletion) return 'N/A';
    const remaining = estimatedCompletion.getTime() - Date.now();
    if (remaining <= 0) return 'Completed';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(delivery.status)}
            <div>
              <CardTitle className="text-lg">{delivery.name}</CardTitle>
              <CardDescription>
                Started {delivery.startTime.toLocaleTimeString()}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(delivery.status)}>
            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{calculateProgress().toFixed(1)}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-600">Total</p>
              <p className="font-bold">{delivery.totalRecipients.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-blue-600">Sent</p>
              <p className="font-bold text-blue-800">{delivery.sent.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-green-600">Delivered</p>
              <p className="font-bold text-green-800">{delivery.delivered.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <p className="text-red-600">Failed</p>
              <p className="font-bold text-red-800">{delivery.failed.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <p className="text-yellow-600">Pending</p>
              <p className="font-bold text-yellow-800">{delivery.pending.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <p className="text-purple-600">Rate</p>
              <p className="font-bold text-purple-800">{calculateDeliveryRate().toFixed(1)}%</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex gap-4">
              {delivery.status === 'sending' && (
                <span>Time remaining: {formatTimeRemaining(delivery.estimatedCompletion)}</span>
              )}
              <span>Delivery rate: {calculateDeliveryRate().toFixed(1)}%</span>
            </div>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
