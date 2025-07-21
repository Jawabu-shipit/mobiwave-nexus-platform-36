
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, CheckCircle, Clock, Crown } from 'lucide-react';
import { useMyActivatedServices } from '@/hooks/useMyActivatedServices';
import { useServiceActivation } from '@/hooks/useServiceActivation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ServiceStatusWidget() {
  const { services: activatedServices = [], isLoading: isLoadingActive } = useMyActivatedServices();
  const { requestServiceActivation, isRequesting } = useServiceActivation();

  // All catalog services
  const { data: services = [], isLoading: isLoadingCatalog } = useQuery({
    queryKey: ['services-catalog-available'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services_catalog')
        .select('*')
        .eq('is_active', true)
        .order('service_name');
      if (error) throw error;
      return data || [];
    }
  });

  // User's pending activation requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['user-pending-requests'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('service_activation_requests')
        .select('service_id, status')
        .eq('user_id', user.user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    }
  });

  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);

  const isServiceActivated = (serviceId: string) =>
    activatedServices.some((s) => s.service_id === serviceId);

  const isServicePending = (serviceId: string) =>
    pendingRequests.some((r) => r.service_id === serviceId);

  const handleRequestAccess = async (serviceId: string) => {
    setPendingServiceId(serviceId);
    try {
      await requestServiceActivation({ serviceId });
    } catch (error) {
      // toast error happens inside hook
    } finally {
      setPendingServiceId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return 'Free';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ussd': return '📱';
      case 'shortcode': return '💬';
      case 'mpesa': return '💳';
      case 'survey': return '📊';
      case 'servicedesk': return '🎫';
      case 'rewards': return '🎁';
      case 'whatsapp': return '💚';
      case 'sms': return '📧';
      default: return '⚙️';
    }
  };

  if (isLoadingActive || isLoadingCatalog) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            My Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            My Services
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              const isActive = isServiceActivated(service.id);
              const isPending = isServicePending(service.id);
              
              return (
                <div key={service.id} className="flex items-start justify-between bg-gray-50 rounded-lg p-3 border">
                  <div className="flex gap-2 items-center">
                    <span className="text-2xl">{getServiceIcon(service.service_type)}</span>
                    <div>
                      <div className="font-medium">{service.service_name} {service.is_premium && <Crown className="w-4 h-4 text-yellow-500 inline-block ml-1" />}</div>
                      <div className="text-xs text-gray-500 capitalize mb-1">{service.service_type}</div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">Setup: {formatCurrency(service.setup_fee)}</Badge>
                        <Badge variant="outline">Monthly: {formatCurrency(service.monthly_fee)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-700 flex items-center gap-1" variant="secondary">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </Badge>
                    ) : isPending ? (
                      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1" variant="secondary">
                        <Clock className="w-4 h-4" />
                        Pending
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isRequesting && pendingServiceId === service.id}
                        className="w-full"
                        onClick={() => handleRequestAccess(service.id)}
                      >
                        {isRequesting && pendingServiceId === service.id ? "Requesting..." : "Request Access"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {services.length === 0 && (
              <div className="text-gray-500 text-center p-4">No available services right now</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
