
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

interface Subscription {
  id: string;
  userId: string;
  serviceName: string;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  renewalDate: string;
  amount: number;
  autoRenewal: boolean;
  usagePercent: number;
}

interface SubscriptionLifecycleManagerProps {
  subscriptions: Subscription[];
  onRenewSubscription: (subscriptionId: string) => Promise<void>;
  onUpgradeSubscription: (subscriptionId: string, newPlan: string) => Promise<void>;
  onDowngradeSubscription: (subscriptionId: string, newPlan: string) => Promise<void>;
  onCancelSubscription: (subscriptionId: string) => Promise<void>;
}

export function SubscriptionLifecycleManager({
  subscriptions,
  onRenewSubscription,
  onUpgradeSubscription,
  onDowngradeSubscription,
  onCancelSubscription
}: SubscriptionLifecycleManagerProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expiring': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleAction = async (action: string, subscriptionId: string, params?: any) => {
    setIsLoading(subscriptionId);
    try {
      switch (action) {
        case 'renew':
          await onRenewSubscription(subscriptionId);
          break;
        case 'upgrade':
          await onUpgradeSubscription(subscriptionId, params.newPlan);
          break;
        case 'downgrade':
          await onDowngradeSubscription(subscriptionId, params.newPlan);
          break;
        case 'cancel':
          await onCancelSubscription(subscriptionId);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} subscription:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  const expiringSubscriptions = subscriptions.filter(s => s.status === 'expiring');
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired');
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-blue-600" />
          Subscription Lifecycle Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expiring">
              Expiring ({expiringSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({expiredSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="renewals">Auto-Renewals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeSubscriptions.length}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{expiringSubscriptions.length}</div>
                <div className="text-sm text-gray-600">Expiring Soon</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{expiredSubscriptions.length}</div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {subscriptions.filter(s => s.autoRenewal).length}
                </div>
                <div className="text-sm text-gray-600">Auto-Renewal</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expiring" className="space-y-4">
            {expiringSubscriptions.map((subscription) => (
              <div key={subscription.id} className="border rounded-lg p-4 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusIcon(subscription.status)}
                      <span className="ml-1">{subscription.status}</span>
                    </Badge>
                    <div>
                      <div className="font-medium">{subscription.serviceName}</div>
                      <div className="text-sm text-gray-600">
                        Expires: {new Date(subscription.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction('renew', subscription.id)}
                      disabled={isLoading === subscription.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Renew
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction('upgrade', subscription.id, { newPlan: 'premium' })}
                      disabled={isLoading === subscription.id}
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-1" />
                      Upgrade
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Usage</span>
                    <span>{subscription.usagePercent}%</span>
                  </div>
                  <Progress value={subscription.usagePercent} className="h-2" />
                </div>
              </div>
            ))}
            {expiringSubscriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No subscriptions expiring soon.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            {expiredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="border rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusIcon(subscription.status)}
                      <span className="ml-1">{subscription.status}</span>
                    </Badge>
                    <div>
                      <div className="font-medium">{subscription.serviceName}</div>
                      <div className="text-sm text-gray-600">
                        Expired: {new Date(subscription.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction('renew', subscription.id)}
                      disabled={isLoading === subscription.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reactivate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {expiredSubscriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No expired subscriptions.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="renewals" className="space-y-4">
            {subscriptions.filter(s => s.autoRenewal).map((subscription) => (
              <div key={subscription.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusIcon(subscription.status)}
                      <span className="ml-1">Auto-Renewal</span>
                    </Badge>
                    <div>
                      <div className="font-medium">{subscription.serviceName}</div>
                      <div className="text-sm text-gray-600">
                        Next billing: {new Date(subscription.renewalDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        ${subscription.amount}/month
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction('upgrade', subscription.id, { newPlan: 'premium' })}
                      disabled={isLoading === subscription.id}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Upgrade
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction('downgrade', subscription.id, { newPlan: 'basic' })}
                      disabled={isLoading === subscription.id}
                    >
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Downgrade
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
