
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Server, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useServiceStatus } from '@/hooks/useSystemMetrics';

export function Monitoring() {
  const { data: services, isLoading } = useServiceStatus();

  const systemMetrics = [
    { time: '00:00', cpu: 45, memory: 62, network: 78 },
    { time: '04:00', cpu: 52, memory: 58, network: 82 },
    { time: '08:00', cpu: 72, memory: 75, network: 85 },
    { time: '12:00', cpu: 89, memory: 82, network: 90 },
    { time: '16:00', cpu: 67, memory: 68, network: 75 },
    { time: '20:00', cpu: 55, memory: 65, network: 80 },
  ];

  const alerts = [
    { id: 1, service: 'Database Service', message: 'High CPU usage detected', severity: 'warning', time: '5 min ago' },
    { id: 2, service: 'Email Service', message: 'SMTP connection issues', severity: 'error', time: '12 min ago' },
    { id: 3, service: 'File Storage', message: 'Disk space above 85%', severity: 'warning', time: '23 min ago' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const healthyServices = services?.filter(s => s.status === 'healthy').length || 0;
  const warningServices = services?.filter(s => s.status === 'warning').length || 0;
  const errorServices = services?.filter(s => s.status === 'error').length || 0;
  const totalServices = services?.length || 0;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-orange-900 via-orange-800 to-orange-700 bg-clip-text text-transparent">
          System Monitoring
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Real-time monitoring of system health, performance metrics, and service status.
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Services Online</p>
                <p className="text-3xl font-bold text-green-600">{healthyServices}/{totalServices}</p>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Server className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">CPU Usage</p>
                <p className="text-3xl font-bold text-blue-600">67%</p>
                <p className="text-sm text-gray-500">Across all nodes</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Cpu className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Memory Usage</p>
                <p className="text-3xl font-bold text-purple-600">68%</p>
                <p className="text-sm text-gray-500">Available: 32GB</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <HardDrive className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Network I/O</p>
                <p className="text-3xl font-bold text-orange-600">80%</p>
                <p className="text-sm text-gray-500">1.2GB/s throughput</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Wifi className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Performance Chart */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              System Performance
            </CardTitle>
            <CardDescription>
              Real-time system resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={systemMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="memory" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="network" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Active Alerts
                </CardTitle>
                <CardDescription>
                  Current system alerts requiring attention
                </CardDescription>
              </div>
              <Badge className="bg-red-100 text-red-800">{alerts.length} Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg border-l-4 border-l-red-500 bg-red-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{alert.service}</Badge>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Grid */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Service Status Dashboard
          </CardTitle>
          <CardDescription>
            Detailed health status of all microservices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services?.map((service) => (
              <div key={service.id} className="p-4 rounded-lg border bg-white/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{service.service_name}</h3>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(service.status)}
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">{service.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instances:</span>
                    <span className="font-medium">{service.instances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPU:</span>
                    <span className="font-medium">{service.cpu_usage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-medium">{service.memory_usage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">{service.uptime_percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
