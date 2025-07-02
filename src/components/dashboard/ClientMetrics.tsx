
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaigns } from '@/hooks/useCampaigns';
import { useUserCredits } from '@/hooks/useUserCredits';
import { MessageSquare, Send, CheckCircle, CreditCard } from 'lucide-react';

export function ClientMetrics() {
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: credits, isLoading: creditsLoading } = useUserCredits();

  const totalCampaigns = campaigns?.length || 0;
  const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
  const totalDelivered = campaigns?.reduce((sum, c) => sum + (c.delivered_count || 0), 0) || 0;
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

  if (campaignsLoading || creditsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Campaigns</p>
              <p className="text-3xl font-bold">{totalCampaigns}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Messages Sent</p>
              <p className="text-3xl font-bold">{totalSent.toLocaleString()}</p>
            </div>
            <Send className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Delivery Rate</p>
              <p className="text-3xl font-bold">{deliveryRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Credits Remaining</p>
              <p className="text-3xl font-bold">{credits?.credits_remaining?.toLocaleString() || '0'}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
