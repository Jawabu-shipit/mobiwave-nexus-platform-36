
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users,
  Zap,
  CheckCircle, 
  XCircle, 
  TrendingUp
} from 'lucide-react';

interface DeliveryStatsCardsProps {
  totalStats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  overallDeliveryRate: number;
}

export function DeliveryStatsCards({ totalStats, overallDeliveryRate }: DeliveryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Recipients</p>
              <p className="text-xl font-bold">{totalStats.totalRecipients.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-xl font-bold">{totalStats.sent.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-xl font-bold">{totalStats.delivered.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xl font-bold">{totalStats.failed.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-xl font-bold">{overallDeliveryRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
