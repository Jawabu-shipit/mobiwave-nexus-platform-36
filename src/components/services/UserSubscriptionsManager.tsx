import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { CsvExportButton } from "@/components/common/CsvExportButton";

interface UserPlanSubscriptionWithPlan {
  id: string;
  plan_id: string;
  status: string;
  started_at: string;
  plan: {
    name: string;
    description: string;
    price: number;
  };
}

interface UserServiceSubscriptionWithService {
  id: string;
  service_id: string;
  status: string;
  setup_fee_paid: boolean;
  monthly_billing_active: boolean;
  created_at: string;
  activated_at: string | null;
  service: {
    service_name: string;
    service_type: string;
    setup_fee: number;
    monthly_fee: number;
  };
}

const fetchUserServiceSubscriptions = async (): Promise<UserServiceSubscriptionWithService[]> => {
  const { data: subscriptions, error: subError } = await supabase
    .from('user_service_subscriptions')
    .select(`
      id,
      service_id,
      status,
      setup_fee_paid,
      monthly_billing_active,
      created_at,
      activated_at,
      services_catalog!user_service_subscriptions_service_id_fkey(
        service_name,
        service_type,
        setup_fee,
        monthly_fee
      )
    `)
    .order('created_at', { ascending: false });

  if (subError) throw subError;
  if (!subscriptions || !Array.isArray(subscriptions)) return [];

  const transformedData: UserServiceSubscriptionWithService[] = subscriptions.map((subscription: any) => {
    const service = subscription.services_catalog;
    return {
      id: subscription.id,
      service_id: subscription.service_id,
      status: subscription.status,
      setup_fee_paid: subscription.setup_fee_paid,
      monthly_billing_active: subscription.monthly_billing_active,
      created_at: subscription.created_at,
      activated_at: subscription.activated_at,
      service: {
        service_name: service?.service_name || 'Unknown Service',
        service_type: service?.service_type || 'unknown',
        setup_fee: service?.setup_fee || 0,
        monthly_fee: service?.monthly_fee || 0
      }
    };
  });
  return transformedData;
};

const fetchUserPlanSubscriptions = async (): Promise<UserPlanSubscriptionWithPlan[]> => {
  const { data: subscriptions, error: subError } = await supabase
    .from('user_plan_subscriptions')
    .select(`
      id,
      plan_id,
      status,
      started_at,
      subscription_plans!user_plan_subscriptions_plan_id_fkey(
        name,
        description,
        price
      )
    `)
    .order('started_at', { ascending: false });

  if (subError) throw subError;
  if (!subscriptions || !Array.isArray(subscriptions)) return [];

  const transformedData: UserPlanSubscriptionWithPlan[] = subscriptions.map((subscription: any) => {
    const plan = subscription.subscription_plans;
    return {
      id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      started_at: subscription.started_at,
      plan: {
        name: plan?.name || 'Unknown Plan',
        description: plan?.description || '',
        price: plan?.price || 0
      }
    };
  });
  return transformedData;
};

export function UserSubscriptionsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('services');

  const { data: serviceSubscriptions = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['user-service-subscriptions-detailed'],
    queryFn: fetchUserServiceSubscriptions
  });

  const { data: planSubscriptions = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['user-plan-subscriptions-detailed'],
    queryFn: fetchUserPlanSubscriptions
  });

  const cancelServiceSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { data, error } = await supabase
        .from('user_service_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-service-subscriptions-detailed'] });
      toast.success('Service subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel service subscription: ${error.message}`);
    }
  });

  const cancelPlanSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { data, error } = await supabase
        .from('user_plan_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-plan-subscriptions-detailed'] });
      toast.success('Plan subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel plan subscription: ${error.message}`);
    }
  });

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ussd': return '📱';
      case 'shortcode': return '💬';
      case 'mpesa': return '💳';
      case 'survey': return '📊';
      case 'servicedesk': return '🎫';
      case 'rewards': return '🎁';
      case 'whatsapp': return '💚';
      default: return '⚙️';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const serviceCsvData = serviceSubscriptions.map(sub => ({
    Service: sub.service.service_name,
    Type: sub.service.service_type,
    Status: sub.status,
    "Setup Fee Paid": sub.setup_fee_paid ? "Yes" : "No",
    "Monthly Billing": sub.monthly_billing_active ? "Active" : "Inactive",
    "Created": sub.created_at,
    "Activated At": sub.activated_at,
  }));

  const planCsvData = planSubscriptions.map(sub => ({
    Plan: sub.plan.name,
    Status: sub.status,
    "Started At": sub.started_at,
    Price: formatCurrency(sub.plan.price)
  }));

  if (isLoadingServices || isLoadingPlans) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">My Subscriptions</h2>
          <p className="text-gray-600">
            Manage your service and plan subscriptions.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Service Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Plan Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Subscriptions</CardTitle>
              <CsvExportButton data={serviceCsvData} filename="my_service_subscriptions.csv" />
            </CardHeader>
            <CardContent>
              {serviceSubscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <Settings className="w-12 h-12 mx-auto mb-2" />
                    <p>No service subscriptions found</p>
                    <p className="text-sm">Request service access to get started</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getServiceIcon(subscription.service.service_type)}</span>
                            <div>
                              <div className="font-medium">{subscription.service.service_name}</div>
                              <div className="text-sm text-gray-500 capitalize">
                                {subscription.service.service_type}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(subscription.status)}
                            <Badge className={`text-xs ${getStatusColor(subscription.status)}`}>
                              {subscription.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Setup: {subscription.setup_fee_paid ? '✓ Paid' : '✗ Pending'}</div>
                            <div>Monthly: {subscription.monthly_billing_active ? '✓ Active' : '✗ Inactive'}</div>
                            {subscription.service.setup_fee > 0 && (
                              <div className="text-xs text-gray-500">
                                Setup: {formatCurrency(subscription.service.setup_fee)}
                              </div>
                            )}
                            {subscription.service.monthly_fee > 0 && (
                              <div className="text-xs text-gray-500">
                                Monthly: {formatCurrency(subscription.service.monthly_fee)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(subscription.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              Configure
                            </Button>
                            {subscription.status !== 'cancelled' && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => cancelServiceSubscription.mutate(subscription.id)}
                                disabled={cancelServiceSubscription.isPending}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plan Subscriptions</CardTitle>
              <CsvExportButton data={planCsvData} filename="my_plan_subscriptions.csv" />
            </CardHeader>
            <CardContent>
              {planSubscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <Settings className="w-12 h-12 mx-auto mb-2" />
                    <p>No plan subscriptions found</p>
                    <p className="text-sm">Subscribe to a plan to get started</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="font-medium">{subscription.plan.name}</div>
                          <div className="text-sm text-gray-500">{subscription.plan.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(subscription.status)}
                            <Badge className={`text-xs ${getStatusColor(subscription.status)}`}>
                              {subscription.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(subscription.plan.price)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(subscription.started_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {subscription.status !== 'cancelled' && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => cancelPlanSubscription.mutate(subscription.id)}
                                disabled={cancelPlanSubscription.isPending}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
