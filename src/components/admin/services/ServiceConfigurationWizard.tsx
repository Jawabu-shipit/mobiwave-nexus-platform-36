
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ServiceSelectionPanel } from './ServiceSelectionPanel';
import { ServiceDetailsCard } from './ServiceDetailsCard';
import { ServiceLoadingWrapper } from './ServiceLoadingWrapper';
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';
import { USSDConfigurationForm } from './configuration/USSDConfigurationForm';
import { MpesaConfigurationForm } from './configuration/MpesaConfigurationForm';
import { ShortCodeConfigurationForm } from './configuration/ShortCodeConfigurationForm';
import { Card, CardContent } from "@/components/ui/card";

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
  is_active: boolean;
  provider: string;
}

interface ServiceConfigurationWizardProps {
  services: ServiceCatalog[];
  selectedService: ServiceCatalog | null;
  onServiceSelect: (service: ServiceCatalog | null) => void;
  onServiceConfigured: (serviceId: string, configuration: any) => Promise<void>;
}

export function ServiceConfigurationWizard({
  services,
  selectedService,
  onServiceSelect,
  onServiceConfigured
}: ServiceConfigurationWizardProps) {
  const {
    configuration,
    isConfiguring,
    updateConfiguration,
    resetConfiguration,
    saveConfiguration
  } = useServiceConfiguration();

  const handleSubmitConfiguration = async () => {
    if (!selectedService) return;
    
    const success = await saveConfiguration(
      selectedService.id, 
      configuration, 
      onServiceConfigured
    );
    
    if (success) {
      onServiceSelect(null);
    }
  };

  const handleCancel = () => {
    onServiceSelect(null);
    resetConfiguration();
  };

  const renderConfigurationForm = () => {
    if (!selectedService) return null;

    switch (selectedService.service_type) {
      case 'ussd':
        return (
          <USSDConfigurationForm
            configuration={configuration}
            onConfigurationChange={updateConfiguration}
          />
        );
      case 'mpesa':
        return (
          <MpesaConfigurationForm
            configuration={configuration}
            onConfigurationChange={updateConfiguration}
          />
        );
      case 'shortcode':
        return (
          <ShortCodeConfigurationForm
            configuration={configuration}
            onConfigurationChange={updateConfiguration}
          />
        );
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Configuration Form Coming Soon</h3>
                <p className="text-gray-600">
                  A specialized configuration form for {selectedService.service_type} services will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <ServiceLoadingWrapper isLoading={false}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="space-y-4">
          <ServiceSelectionPanel
            services={services}
            selectedService={selectedService}
            onServiceSelect={onServiceSelect}
          />
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-2 space-y-4">
          {selectedService ? (
            <>
              <ServiceDetailsCard service={selectedService} />
              {renderConfigurationForm()}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitConfiguration}
                  disabled={isConfiguring}
                >
                  {isConfiguring ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Select a Service</h3>
                <p className="text-gray-600">
                  Choose a service from the left panel to configure its settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ServiceLoadingWrapper>
  );
}
