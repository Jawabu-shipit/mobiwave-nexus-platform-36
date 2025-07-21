import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Crown, Zap, MessageSquare, ArrowRight, Settings, ExternalLink } from 'lucide-react';
import { useUserPlanSubscription } from '@/hooks/useUserPlanSubscription';
import { UserServicesCatalog } from '@/components/services/UserServicesCatalog';

export function PlanManagement() {
  const { userPlan, availablePlans, upgradePlan, isUpgrading } = useUserPlanSubscription();
  const [activeTab, setActiveTab] = React.useState("current-plan");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Plan & Service Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription plans and request access to services
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current-plan">Current Plan</TabsTrigger>
          <TabsTrigger value="available-plans">Available Plans</TabsTrigger>
          <TabsTrigger value="services">Service Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="current-plan" className="space-y-6">
          {userPlan ? (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlanIcon(userPlan.plan.name)}
                    <div>
                      <CardTitle className="text-xl">{userPlan.plan.name}</CardTitle>
                      <p className="text-sm text-gray-600">{userPlan.plan.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">SMS Credits & Features</h4>
                    <ul className="space-y-2">
                      {userPlan.plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Usage Limits</h4>
                    <div className="space-y-2 text-sm">
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
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(userPlan.plan.price)}/{userPlan.plan.billing_cycle}
                    </div>
                    <p className="text-sm text-gray-600">Current Plan Rate</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/my-services'}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Services
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/service-requests'}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Requests
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Plans provide SMS credits only. For additional services (WhatsApp, USSD, M-Pesa, etc.), 
                    request access through the Service Catalog and wait for admin approval.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Plan</h3>
                <p className="text-gray-600 mb-4">You don't have an active subscription plan. Choose a plan to get started.</p>
                <Button onClick={() => setActiveTab("available-plans")}>
                  View Available Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available-plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availablePlans.map((plan) => {
              const isCurrentPlan = userPlan?.plan_id === plan.id;
              const isUpgrade = userPlan && plan.price > userPlan.plan.price;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`h-full transition-shadow hover:shadow-lg ${
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
                      <h4 className="font-medium mb-2 text-sm">Features Included:</h4>
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
                           isUpgrade ? (
                             <>
                               <ArrowRight className="w-4 h-4 mr-2" />
                               Upgrade
                             </>
                           ) : 'Switch Plan'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
            <p className="text-sm text-blue-800 mb-3">
              After selecting a plan, you'll need to request access to specific services. Visit the Service Catalog to browse and request access to additional services.
            </p>
            <Button variant="outline" onClick={() => setActiveTab("services")}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Browse Service Catalog
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <UserServicesCatalog />
        </TabsContent>
      </Tabs>
    </div>
  );
}