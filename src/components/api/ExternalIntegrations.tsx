
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Globe, 
  Settings, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Zap,
  Mail,
  MessageSquare,
  CreditCard,
  Database
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  is_connected: boolean;
  is_active: boolean;
  last_sync: string;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'error';
}

export function ExternalIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'M-Pesa',
      description: 'Mobile payment integration for Kenya',
      category: 'Payment',
      is_connected: true,
      is_active: true,
      last_sync: '2024-06-15 10:30:00',
      icon: <CreditCard className="w-6 h-6 text-green-600" />,
      status: 'healthy'
    },
    {
      id: '2',
      name: 'Safaricom SMS',
      description: 'SMS delivery through Safaricom network',
      category: 'Messaging',
      is_connected: true,
      is_active: true,
      last_sync: '2024-06-15 10:25:00',
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      status: 'healthy'
    },
    {
      id: '3',
      name: 'SendGrid',
      description: 'Email delivery service',
      category: 'Email',
      is_connected: false,
      is_active: false,
      last_sync: 'Never',
      icon: <Mail className="w-6 h-6 text-gray-400" />,
      status: 'error'
    },
    {
      id: '4',
      name: 'Zapier',
      description: 'Workflow automation platform',
      category: 'Automation',
      is_connected: true,
      is_active: false,
      last_sync: '2024-06-14 08:15:00',
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      status: 'warning'
    },
    {
      id: '5',
      name: 'PostgreSQL',
      description: 'Primary database connection',
      category: 'Database',
      is_connected: true,
      is_active: true,
      last_sync: '2024-06-15 10:35:00',
      icon: <Database className="w-6 h-6 text-purple-600" />,
      status: 'healthy'
    }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, is_active: !integration.is_active }
        : integration
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <XCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">External Integrations</h3>
        <Button>
          <Globe className="w-4 h-4 mr-2" />
          Browse Integrations
        </Button>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">{category}</h4>
          <div className="grid gap-4">
            {integrations
              .filter(integration => integration.category === category)
              .map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {integration.icon}
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                        {getStatusIcon(integration.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-gray-500">Connected:</span>
                          <Badge variant={integration.is_connected ? "default" : "secondary"} className="ml-2">
                            {integration.is_connected ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Last Sync:</span>
                          <span className="ml-2 font-medium">{integration.last_sync}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Active</span>
                        <Switch
                          checked={integration.is_active}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                          disabled={!integration.is_connected}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {integration.is_connected ? (
                        <>
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          <Button size="sm" variant="outline">
                            Test Connection
                          </Button>
                          <Button size="sm" variant="outline">
                            View Logs
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">
                          Connect
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Documentation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
