
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ExternalLink, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  enabled: boolean;
  icon: string;
  webhook_url?: string;
  api_version: string;
}

export function ThirdPartyIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      status: 'connected',
      lastSync: '2 minutes ago',
      enabled: true,
      icon: '💳',
      api_version: 'v1'
    },
    {
      id: '2',
      name: 'Twilio',
      description: 'SMS and voice communication platform',
      status: 'connected',
      lastSync: '5 minutes ago',
      enabled: true,
      icon: '📱',
      api_version: 'v2'
    },
    {
      id: '3',
      name: 'SendGrid',
      description: 'Email delivery and marketing platform',
      status: 'error',
      lastSync: '2 hours ago',
      enabled: false,
      icon: '📧',
      api_version: 'v3'
    },
    {
      id: '4',
      name: 'Slack',
      description: 'Team communication and notifications',
      status: 'disconnected',
      lastSync: 'Never',
      enabled: false,
      icon: '💬',
      api_version: 'v1'
    }
  ]);

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, enabled: !integration.enabled }
        : integration
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Third-Party Integrations</h3>
          <p className="text-gray-600">Manage external service connections and API integrations</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <Switch
                  checked={integration.enabled}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    API {integration.api_version}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  Last sync: {integration.lastSync}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
              <div className="text-sm text-green-600">Connected</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {integrations.filter(i => i.status === 'error').length}
              </div>
              <div className="text-sm text-red-600">Errors</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {integrations.filter(i => i.status === 'disconnected').length}
              </div>
              <div className="text-sm text-gray-600">Disconnected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
