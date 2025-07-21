
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceStatus } from '@/hooks/useSystemMetrics';
import { toast } from 'sonner';
import { GeneralSettings } from './settings/GeneralSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { ServicesStatus } from './settings/ServicesStatus';
import { IntegrationsSettings } from './settings/IntegrationsSettings';
import { ApiSettings } from './settings/ApiSettings';

export function SystemSettings() {
  const { data: serviceStatus } = useServiceStatus();
  
  const [generalSettings, setGeneralSettings] = useState({
    maintenanceMode: false,
    enableRegistration: true,
    maxCampaignRecipients: 10000
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    rateLimitPerMinute: 100
  });

  const [integrationsSettings, setIntegrationsSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smsProvider: 'mspace'
  });

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
          System Settings
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Configure system-wide settings, monitor service health, and manage platform preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings 
            settings={generalSettings}
            onSettingsChange={setGeneralSettings}
            onSave={handleSaveSettings}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings 
            settings={securitySettings}
            onSettingsChange={setSecuritySettings}
            onSave={handleSaveSettings}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServicesStatus serviceStatus={serviceStatus} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsSettings 
            settings={integrationsSettings}
            onSettingsChange={setIntegrationsSettings}
            onSave={handleSaveSettings}
          />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
