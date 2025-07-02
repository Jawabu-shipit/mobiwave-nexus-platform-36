
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOptimizedQuery } from '@/hooks/useOptimizedQueries';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { supabase } from '@/integrations/supabase/client';
import { 
  Server, 
  Activity, 
  Users, 
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Mock service status - in production this would come from monitoring
const fetchServiceStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return [
    {
      id: '1',
      service_name: 'SMS Gateway',
      status: 'healthy',
      version: '1.2.3',
      instances: 3,
      cpu_usage: 45,
      memory_usage: 62,
      request_rate: '150 req/min',
      uptime_percentage: 99.8,
      last_health_check: new Date().toISOString()
    },
    {
      id: '2',
      service_name: 'Email Service',
      status: 'healthy',
      version: '2.1.0',
      instances: 2,
      cpu_usage: 23,
      memory_usage: 41,
      request_rate: '89 req/min',
      uptime_percentage: 99.9,
      last_health_check: new Date().toISOString()
    },
    {
      id: '3',
      service_name: 'Database',
      status: 'warning',
      version: '14.2',
      instances: 1,
      cpu_usage: 78,
      memory_usage: 85,
      request_rate: '300 req/min',
      uptime_percentage: 99.5,
      last_health_check: new Date().toISOString()
    },
    {
      id: '4',
      service_name: 'Authentication',
      status: 'healthy',
      version: '1.5.2',
      instances: 2,
      cpu_usage: 34,
      memory_usage: 52,
      request_rate: '75 req/min',
      uptime_percentage: 99.9,
      last_health_check: new Date().toISOString()
    }
  ];
};

const fetchSystemMetrics = async () => {
  try {
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: campaignCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    // Use campaigns table instead of non-existent message_history
    const { count: messageCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent');

    return [
      {
        metric_name: 'total_users',
        metric_value: userCount || 0,
        timestamp: new Date().toISOString()
      },
      {
        metric_name: 'total_campaigns',
        metric_value: campaignCount || 0,
        timestamp: new Date().toISOString()
      },
      {
        metric_name: 'total_messages',
        metric_value: messageCount || 0,
        timestamp: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return [];
  }
};

export function AdminMetrics() {
  const { data: services, isLoading: servicesLoading, error: servicesError } = useOptimizedQuery({
    queryKey: ['service-status'],
    queryFn: fetchServiceStatus,
    staleTime: 30000 // 30 seconds
  });

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useOptimizedQuery({
    queryKey: ['system-metrics'],
    queryFn: fetchSystemMetrics,
    staleTime: 60000 // 1 minute
  });

  // Calculate aggregated metrics
  const healthyServices = services?.filter(s => s.status === 'healthy').length || 0;
  const warningServices = services?.filter(s => s.status === 'warning').length || 0;
  const errorServices = services?.filter(s => s.status === 'error').length || 0;
  const totalServices = services?.length || 0;

  const avgCpu = services?.reduce((sum, s) => sum + s.cpu_usage, 0) / (services?.length || 1) || 0;
  const avgMemory = services?.reduce((sum, s) => sum + s.memory_usage, 0) / (services?.length || 1) || 0;
  const totalInstances = services?.reduce((sum, s) => sum + s.instances, 0) || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle loading states separately for better UX
  if (servicesError || metricsError) {
    return (
      <LoadingWrapper
        isLoading={false}
        error={servicesError || metricsError}
      >
        <></>
      </LoadingWrapper>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview Metrics */}
      <LoadingWrapper 
        isLoading={servicesLoading || metricsLoading}
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{totalServices}</p>
                  <p className="text-sm text-gray-500">{healthyServices} healthy</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Instances</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{totalInstances}</p>
                  <p className="text-sm text-gray-500">Across all services</p>
                </div>
                <div className="p-3 rounded-full bg-green-50">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg CPU Usage</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{Math.round(avgCpu)}%</p>
                  <p className="text-sm text-gray-500">System wide</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Memory</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{Math.round(avgMemory)}%</p>
                  <p className="text-sm text-gray-500">System wide</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LoadingWrapper>

      {/* Service Status Overview */}
      <LoadingWrapper isLoading={servicesLoading}>
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Service Status Overview
            </CardTitle>
            <CardDescription>
              Real-time monitoring of all microservices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services?.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-medium text-gray-900">{service.service_name}</p>
                      <p className="text-sm text-gray-500">
                        {service.version} • {service.instances} instance{service.instances !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">CPU: {service.cpu_usage}%</p>
                      <p className="text-sm text-gray-600">Memory: {service.memory_usage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{service.request_rate}</p>
                      <p className="text-sm text-gray-600">{service.uptime_percentage}% uptime</p>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </LoadingWrapper>

      {/* Alert Cards */}
      {(warningServices > 0 || errorServices > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warningServices > 0 && (
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Services Requiring Attention</p>
                    <p className="text-sm text-yellow-700">
                      {warningServices} service{warningServices !== 1 ? 's' : ''} reporting warnings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {errorServices > 0 && (
            <Card className="border-l-4 border-l-red-500 bg-red-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Critical Issues</p>
                    <p className="text-sm text-red-700">
                      {errorServices} service{errorServices !== 1 ? 's' : ''} reporting errors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
