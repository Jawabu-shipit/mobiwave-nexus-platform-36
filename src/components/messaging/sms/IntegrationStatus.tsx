
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wifi, Database, Cloud, Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationService {
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastCheck: Date;
  responseTime: number;
  uptime: number;
  description: string;
  icon: React.ReactNode;
}

export function IntegrationStatus() {
  const [services, setServices] = useState<IntegrationService[]>([
    {
      name: 'Mspace SMS API',
      status: 'connected',
      lastCheck: new Date(),
      responseTime: 120,
      uptime: 99.9,
      description: 'Primary SMS delivery service',
      icon: <Wifi className="w-4 h-4" />
    },
    {
      name: 'Supabase Database',
      status: 'connected',
      lastCheck: new Date(),
      responseTime: 45,
      uptime: 100,
      description: 'Campaign and contact data storage',
      icon: <Database className="w-4 h-4" />
    },
    {
      name: 'Edge Functions',
      status: 'connected',
      lastCheck: new Date(),
      responseTime: 89,
      uptime: 99.8,
      description: 'Serverless function processing',
      icon: <Cloud className="w-4 h-4" />
    },
    {
      name: 'Security Layer',
      status: 'connected',
      lastCheck: new Date(),
      responseTime: 15,
      uptime: 100,
      description: 'Authentication and encryption',
      icon: <Shield className="w-4 h-4" />
    }
  ]);

  const [isTestingAll, setIsTestingAll] = useState(false);

  const getStatusIcon = (status: IntegrationService['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'testing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: IntegrationService['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
    }
  };

  const testConnection = async (serviceName: string) => {
    setServices(prev => prev.map(s => 
      s.name === serviceName ? { ...s, status: 'testing' } : s
    ));

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));

    setServices(prev => prev.map(s => 
      s.name === serviceName ? { 
        ...s, 
        status: 'connected',
        lastCheck: new Date(),
        responseTime: Math.floor(Math.random() * 200) + 50
      } : s
    ));

    toast.success(`${serviceName} connection test successful`);
  };

  const testAllConnections = async () => {
    setIsTestingAll(true);
    
    for (const service of services) {
      await testConnection(service.name);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    setIsTestingAll(false);
    toast.success('All integration tests completed successfully');
  };

  const overallHealth = services.filter(s => s.status === 'connected').length / services.length * 100;

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              Integration Status
            </CardTitle>
            <CardDescription>
              Monitor the health and performance of all integrated services
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{Math.round(overallHealth)}%</div>
            <div className="text-sm text-gray-600">System Health</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {service.icon}
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Response Time</span>
                  <div className="font-medium">{service.responseTime}ms</div>
                </div>
                <div>
                  <span className="text-gray-500">Uptime</span>
                  <div className="font-medium">{service.uptime}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Last Check</span>
                  <div className="font-medium">
                    {service.lastCheck.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <Progress value={service.uptime} className="h-2" />
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection(service.name)}
                  disabled={service.status === 'testing' || isTestingAll}
                >
                  {service.status === 'testing' ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <h3 className="font-medium">System Integration Health</h3>
            <p className="text-sm text-gray-600">
              Overall health score based on all service integrations
            </p>
          </div>
          <Button
            onClick={testAllConnections}
            disabled={isTestingAll}
            className="flex items-center gap-2"
          >
            {isTestingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing All...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Test All Connections
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
