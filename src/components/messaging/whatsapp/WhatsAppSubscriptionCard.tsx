
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Settings, BarChart, Phone, Globe } from 'lucide-react';

interface WhatsAppSubscription {
  id: string;
  phone_number_id: string;
  business_account_id: string;
  webhook_url: string;
  message_limit: number;
  current_messages: number;
  status: string;
  created_at: string;
}

interface WhatsAppSubscriptionCardProps {
  subscription: WhatsAppSubscription;
  onSelect?: () => void;
  onConfigure?: () => void;
}

export function WhatsAppSubscriptionCard({ 
  subscription, 
  onSelect, 
  onConfigure 
}: WhatsAppSubscriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = () => {
    return subscription.message_limit > 0 
      ? (subscription.current_messages / subscription.message_limit) * 100 
      : 0;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            WhatsApp Business
          </span>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number ID:
            </p>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">
              {subscription.phone_number_id}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Business Account:</p>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded truncate">
              {subscription.business_account_id}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Webhook URL:
            </p>
            <p className="text-xs font-mono bg-gray-50 p-2 rounded truncate">
              {subscription.webhook_url}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Message Usage:</p>
            <div className="flex items-center justify-between text-sm">
              <span>{subscription.current_messages} / {subscription.message_limit}</span>
              <span className="text-gray-500">
                {getUsagePercentage().toFixed(1)}% used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={onSelect}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Manage
            </Button>
            <Button size="sm" variant="outline" onClick={onConfigure}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button size="sm" variant="outline">
              <BarChart className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
