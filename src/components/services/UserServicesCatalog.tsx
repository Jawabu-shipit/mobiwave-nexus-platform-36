import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { CsvExportButton } from "@/components/common/CsvExportButton";
import { ServiceRequestForm } from './ServiceRequestForm';

interface ServiceCatalog {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  transaction_fee_type: string;
  transaction_fee_amount: number;
  is_premium: boolean;
  provider: string;
}

interface UserSubscription {
  id: string;
  service_id: string;
  status: string;
}

const fetchServices = async (): Promise<ServiceCatalog[]> => {
  const { data, error } = await supabase
    .from('services_catalog')
    .select('*')
    .eq('is_active', true)
    .order('service_name');

  if (error) throw error;
  return data || [];
};

const fetchUserSubscriptions = async (): Promise<UserSubscription[]> => {
  const { data, error } = await supabase
    .from('user_service_subscriptions')
    .select('id, service_id, status');

  if (error) throw error;
  return data || [];
};

export function UserServicesCatalog() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services-catalog'],
    queryFn: fetchServices
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: fetchUserSubscriptions
  });

  const subscribeToService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_service_subscriptions')
        .insert({
          user_id: user.id,
          service_id: serviceId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      toast.success('Service subscription request submitted successfully');
      setSelectedService(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to subscribe: ${error.message}`);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSubscriptionStatus = (serviceId: string) => {
    return subscriptions.find(sub => sub.service_id === serviceId);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  // CSV data for export
  const csvData = services.map((service) => ({
    Name: service.service_name,
    Type: service.service_type,
    Description: service.description,
    "Setup Fee": service.setup_fee,
    "Monthly Fee": service.monthly_fee,
    "Transaction Fee Type": service.transaction_fee_type,
    "Transaction Fee Amount": service.transaction_fee_amount,
    Premium: service.is_premium ? "Yes" : "No",
    Provider: service.provider,
  }));

  const isLoading = servicesLoading || subscriptionsLoading;

  if (isLoading) {
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
          <h2 className="text-3xl font-bold tracking-tight mb-3">Available Services</h2>
          <p className="text-gray-600 mb-2">
            Browse and subscribe to MSpace services to enhance your business communication.
          </p>
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <strong>Two ways to get access:</strong>
            <br />
            • <strong>Quick Subscribe:</strong> Instant subscription (requires admin approval)
            <br />
            • <strong>Request Access:</strong> Submit detailed request with business justification
          </div>
        </div>
        <CsvExportButton data={csvData} filename="available_services.csv" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const subscription = getSubscriptionStatus(service.id);
          const isSubscribed = !!subscription;

          return (
            <Card key={service.id} className="relative border border-gray-200 hover:shadow-lg transition-shadow">
              {service.is_premium && (
                <div className="absolute top-3 right-3">
                  <Crown className="w-5 h-5 text-yellow-600" />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getServiceIcon(service.service_type)}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.service_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {service.service_type}
                      </Badge>
                      {subscription && (
                        <div className="flex items-center gap-1">
                          {getStatusIcon(subscription.status)}
                          <span className="text-xs text-gray-600 capitalize">
                            {subscription.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  {service.setup_fee > 0 && (
                    <div className="flex justify-between">
                      <span>Setup Fee:</span>
                      <span className="font-medium">{formatCurrency(service.setup_fee)}</span>
                    </div>
                  )}
                  {service.monthly_fee > 0 && (
                    <div className="flex justify-between">
                      <span>Monthly Fee:</span>
                      <span className="font-medium">{formatCurrency(service.monthly_fee)}</span>
                    </div>
                  )}
                  {service.transaction_fee_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Transaction Fee:</span>
                      <span className="font-medium">
                        {service.transaction_fee_type === 'percentage' 
                          ? `${service.transaction_fee_amount}%`
                          : formatCurrency(service.transaction_fee_amount)
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {isSubscribed ? (
                    <Button variant="outline" disabled className="w-full">
                      {subscription?.status === 'active' ? 'Active Service' : 
                       subscription?.status === 'pending' ? 'Subscription Pending' : 
                       subscription?.status === 'rejected' ? 'Subscription Rejected' :
                       'Subscription Inactive'}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => subscribeToService.mutate(service.id)}
                        disabled={subscribeToService.isPending}
                        className="flex-1"
                        size="sm"
                      >
                        {subscribeToService.isPending ? 'Subscribing...' : 'Quick Subscribe'}
                      </Button>
                      <Dialog open={requestDialogOpen === service.id} onOpenChange={(open) => setRequestDialogOpen(open ? service.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <FileText className="w-4 h-4 mr-1" />
                            Request Access
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Request Service Access</DialogTitle>
                          </DialogHeader>
                          <ServiceRequestForm
                            serviceId={service.id}
                            serviceName={service.service_name}
                            serviceType={service.service_type}
                            onRequestSubmitted={() => setRequestDialogOpen(null)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                  >
                    {selectedService === service.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>

                {selectedService === service.id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Service Details</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Provider: {service.provider}</div>
                      <div>Service Type: {service.service_type}</div>
                      {service.is_premium && <div>Premium Service ⭐</div>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
