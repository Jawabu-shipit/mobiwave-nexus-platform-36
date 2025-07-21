
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Zap, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useMyActivatedServices } from '@/hooks/useMyActivatedServices';
import { USSDServiceConfig } from './configurations/USSDServiceConfig';
import { WhatsAppServiceConfig } from './configurations/WhatsAppServiceConfig';
import { MpesaServiceConfig } from './configurations/MpesaServiceConfig';
import { SMSServiceConfig } from './configurations/SMSServiceConfig';

export function ServiceConfigurationManager() {
  const { data: activatedServices = [], isLoading } = useMyActivatedServices();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ussd': return '📱';
      case 'whatsapp': return '💚';
      case 'mpesa': return '💳';
      case 'sms': return '📧';
      case 'surveys': return '📊';
      case 'servicedesk': return '🎫';
      default: return '⚙️';
    }
  };

  const getConfigurationComponent = (serviceType: string, serviceId: string) => {
    switch (serviceType) {
      case 'ussd':
        return <USSDServiceConfig serviceId={serviceId} />;
      case 'whatsapp':
        return <WhatsAppServiceConfig serviceId={serviceId} />;
      case 'mpesa':
        return <MpesaServiceConfig serviceId={serviceId} />;
      case 'sms':
        return <SMSServiceConfig serviceId={serviceId} />;
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Configuration not available for this service yet.</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activatedServices.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Active Services</h3>
          <p className="text-gray-600 mb-4">
            You don't have any active services to configure yet.
          </p>
          <Button>Request Service Access</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Service Configuration</h2>
        <p className="text-gray-600">
          Configure and manage your active services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activatedServices.map((activation) => (
                <div
                  key={activation.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedService === activation.service_id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedService(activation.service_id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getServiceIcon(activation.service.service_type)}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{activation.service.service_name}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {activation.service.service_type}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          {selectedService ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Service Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const service = activatedServices.find(
                    s => s.service_id === selectedService
                  );
                  return service ? 
                    getConfigurationComponent(service.service.service_type, selectedService) :
                    null;
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Select a Service</h3>
                <p className="text-gray-600">
                  Choose a service from the list to configure its settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
