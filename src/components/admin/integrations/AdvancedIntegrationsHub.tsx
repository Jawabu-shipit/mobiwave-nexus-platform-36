
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, 
  Database, 
  Cloud, 
  Zap,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { ThirdPartyIntegrations } from './ThirdPartyIntegrations';
import { APIGatewayManager } from './APIGatewayManager';
import { CloudServiceConnections } from './CloudServiceConnections';
import { MessagingPlatforms } from './MessagingPlatforms';

export function AdvancedIntegrationsHub() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Advanced Integrations</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Manage third-party integrations, API gateways, and external service connections.
        </p>
      </div>

      <Tabs defaultValue="third-party" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="third-party" className="flex items-center gap-2">
            <Plug className="w-4 h-4" />
            Third Party
          </TabsTrigger>
          <TabsTrigger value="api-gateway" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            API Gateway
          </TabsTrigger>
          <TabsTrigger value="cloud-services" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Cloud Services
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messaging
          </TabsTrigger>
        </TabsList>

        <TabsContent value="third-party" className="space-y-4">
          <ThirdPartyIntegrations />
        </TabsContent>

        <TabsContent value="api-gateway" className="space-y-4">
          <APIGatewayManager />
        </TabsContent>

        <TabsContent value="cloud-services" className="space-y-4">
          <CloudServiceConnections />
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <MessagingPlatforms />
        </TabsContent>
      </Tabs>
    </div>
  );
}
