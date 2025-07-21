
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Zap, Wrench, Bot } from 'lucide-react';
import { ServiceConfigurationWizard } from './ServiceConfigurationWizard';
import { ServiceTemplateManager } from './ServiceTemplateManager';
import { ServiceSetupWorkflow } from './ServiceSetupWorkflow';
import { ServiceAutomationHub } from './ServiceAutomationHub';

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

interface ServiceConfigurationManagerProps {
  services: ServiceCatalog[];
  onServiceConfigured: (serviceId: string, configuration: any) => Promise<void>;
  isLoading: boolean;
}

export function ServiceConfigurationManager({ 
  services, 
  onServiceConfigured, 
  isLoading 
}: ServiceConfigurationManagerProps) {
  const [selectedService, setSelectedService] = useState<ServiceCatalog | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Service Configuration</h3>
          <p className="text-gray-600">
            Configure service settings, manage templates, and automate workflows
          </p>
        </div>
        <Button 
          onClick={() => setActiveWorkflow('setup')}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          New Setup Workflow
        </Button>
      </div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Setup Workflows
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <ServiceConfigurationWizard
            services={services}
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
            onServiceConfigured={onServiceConfigured}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <ServiceTemplateManager services={services} />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <ServiceSetupWorkflow
            services={services}
            activeWorkflow={activeWorkflow}
            onWorkflowComplete={() => setActiveWorkflow(null)}
          />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <ServiceAutomationHub />
        </TabsContent>
      </Tabs>
    </div>
  );
}
