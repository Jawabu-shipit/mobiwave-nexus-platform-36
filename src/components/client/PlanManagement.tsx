
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Zap, MessageSquare } from 'lucide-react';
import { useUserPlanSubscription } from '@/hooks/useUserPlanSubscription';

export function PlanManagement() {
  const { userPlan, availablePlans, upgradePlan, isUpgrading } = useUserPlanSubscription();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('enterprise')) return <Crown className="w-6 h-6 text-purple-600" />;
    if (planName.toLowerCase().includes('business')) return <Zap className="w-6 h-6 text-blue-600" />;
    return <MessageSquare className="w-6 h-6 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">SMS Credit Plans</h2>
        <p className="text-gray-600">
          Choose the SMS credit plan that best fits your messaging needs. Service access requires separate approval through your dashboard.
        </p>
      </div>

      {userPlan && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanIcon(userPlan.plan.name)}
              Current Plan: {userPlan.plan.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">SMS Credits & Features:</h4>
                <ul className="space-y-1">
                  {userPlan.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">SMS Usage Limits:</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(userPlan.plan.service_limits).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">
                        {value === -1 ? 'Unlimited' : value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Plans provide SMS credits only. For service access (WhatsApp, USSD, M-Pesa, etc.), 
                request access through your dashboard and wait for admin approval.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {availablePlans.map((plan) => {
          const isCurrentPlan = userPlan?.plan_id === plan.id;
          const isUpgrade = userPlan && plan.price > userPlan.plan.price;
          
          return (
            <Card 
              key={plan.id} 
              className={`h-full ${
                isCurrentPlan 
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : plan.name.toLowerCase().includes('business')
                    ? 'border-2 border-orange-200 bg-orange-50'
                    : ''
              }`}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                  <span className="text-sm font-normal text-gray-600">
                    /{plan.billing_cycle}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">SMS Credits & Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-gray-500">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => upgradePlan(plan.id)}
                      disabled={isUpgrading}
                      variant={isUpgrade ? "default" : "outline"}
                    >
                      {isUpgrading ? 'Processing...' : 
                       isUpgrade ? 'Upgrade' : 'Switch Plan'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
