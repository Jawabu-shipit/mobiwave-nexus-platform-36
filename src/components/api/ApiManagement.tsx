
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Key, 
  Monitor, 
  Globe, 
  Shield,
  Activity,
  Code,
  Webhook
} from 'lucide-react';
import { ApiCredentialsManager } from './ApiCredentialsManager';
import { ApiEndpointsManager } from './ApiEndpointsManager';
import { ApiMonitoringDashboard } from './ApiMonitoringDashboard';
import { WebhookManager } from './WebhookManager';
import { ExternalIntegrations } from './ExternalIntegrations';
import { ApiSecurityCenter } from './ApiSecurityCenter';
import { ApiDocumentation } from './ApiDocumentation';
import { RateLimitingConfig } from './RateLimitingConfig';

export function ApiManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Management</h2>
          <p className="text-gray-600">
            Manage API credentials, endpoints, monitoring, and external integrations.
          </p>
        </div>
      </div>

      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="rate-limiting" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Rate Limiting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          <ApiCredentialsManager />
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <ApiEndpointsManager />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <ApiMonitoringDashboard />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <ExternalIntegrations />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <ApiSecurityCenter />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <ApiDocumentation />
        </TabsContent>

        <TabsContent value="rate-limiting" className="space-y-4">
          <RateLimitingConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
