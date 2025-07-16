
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Cloud, 
  Database, 
  HardDrive, 
  Wifi,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface CloudService {
  id: string;
  name: string;
  provider: string;
  service_type: string;
  status: 'connected' | 'disconnected' | 'error';
  usage: number;
  limit: number;
  cost: number;
  enabled: boolean;
  region: string;
}

export function CloudServiceConnections() {
  const [services, setServices] = useState<CloudService[]>([
    {
      id: '1',
      name: 'Primary Database',
      provider: 'Supabase',
      service_type: 'Database',
      status: 'connected',
      usage: 45,
      limit: 100,
      cost: 25.50,
      enabled: true,
      region: 'us-east-1'
    },
    {
      id: '2',
      name: 'File Storage',
      provider: 'AWS S3',
      service_type: 'Storage',
      status: 'connected',
      usage: 78,
      limit: 1000,
      cost: 12.30,
      enabled: true,
      region: 'us-west-2'
    },
    {
      id: '3',
      name: 'CDN',
      provider: 'Cloudflare',
      service_type: 'CDN',
      status: 'connected',
      usage: 234,
      limit: 1000,
      cost: 8.75,
      enabled: true,
      region: 'global'
    },
    {
      id: '4',
      name: 'Analytics',
      provider: 'Google Analytics',
      service_type: 'Analytics',
      status: 'error',
      usage: 0,
      limit: 1000000,
      cost: 0,
      enabled: false,
      region: 'global'
    }
  ]);

  const toggleService = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, enabled: !service.enabled }
        : service
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'Database': return <Database className="w-5 h-5" />;
      case 'Storage': return <HardDrive className="w-5 h-5" />;
      case 'CDN': return <Wifi className="w-5 h-5" />;
      case 'Analytics': return <Cloud className="w-5 h-5" />;
      default: return <Cloud className="w-5 h-5" />;
    }
  };

  const totalCost = services.reduce((acc, service) => acc + service.cost, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.filter(s => s.status === 'connected').length}
            </div>
            <p className="text-xs text-gray-600">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-gray-600">Current billing cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <Progress value={96} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {services.filter(s => s.status === 'error').length}
            </div>
            <p className="text-xs text-gray-600">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getServiceIcon(service.service_type)}
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-600">{service.provider} • {service.region}</p>
                  </div>
                </div>
                <Switch
                  checked={service.enabled}
                  onCheckedChange={() => toggleService(service.id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">${service.cost}/month</span>
                </div>

                {service.service_type !== 'Analytics' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage</span>
                      <span>{service.usage}{service.service_type === 'Storage' ? 'GB' : '%'} / {service.limit}{service.service_type === 'Storage' ? 'GB' : '%'}</span>
                    </div>
                    <Progress value={(service.usage / service.limit) * 100} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">Database Usage Trending Up</div>
              <div className="text-sm text-blue-700">
                Database usage has increased by 15% this month. Consider upgrading your plan or optimizing queries.
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="font-medium text-yellow-900 mb-2">Storage Nearing Limit</div>
              <div className="text-sm text-yellow-700">
                File storage is at 78% capacity. Consider implementing automatic cleanup or upgrading storage.
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900 mb-2">CDN Performance Excellent</div>
              <div className="text-sm text-green-700">
                CDN is delivering optimal performance with 99.9% uptime and low latency.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
