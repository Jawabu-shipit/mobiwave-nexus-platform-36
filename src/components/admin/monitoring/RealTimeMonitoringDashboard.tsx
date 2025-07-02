
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  MessageSquare, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

export function RealTimeMonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { id: 'cpu', name: 'CPU Usage', value: 45, unit: '%', status: 'healthy', threshold: 80 },
    { id: 'memory', name: 'Memory Usage', value: 68, unit: '%', status: 'healthy', threshold: 85 },
    { id: 'disk', name: 'Disk Usage', value: 72, unit: '%', status: 'warning', threshold: 85 },
    { id: 'network', name: 'Network I/O', value: 23, unit: 'MB/s', status: 'healthy', threshold: 100 }
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { id: 'sms', name: 'SMS Service', status: 'online', uptime: 99.8, responseTime: 120, lastCheck: '2 min ago' },
    { id: 'whatsapp', name: 'WhatsApp API', status: 'online', uptime: 99.9, responseTime: 85, lastCheck: '1 min ago' },
    { id: 'mpesa', name: 'M-Pesa Integration', status: 'online', uptime: 99.5, responseTime: 340, lastCheck: '3 min ago' },
    { id: 'ussd', name: 'USSD Gateway', status: 'degraded', uptime: 98.2, responseTime: 580, lastCheck: '5 min ago' },
    { id: 'database', name: 'Database', status: 'online', uptime: 99.99, responseTime: 15, lastCheck: '30 sec ago' }
  ]);

  const [performanceData] = useState([
    { time: '00:00', requests: 245, responseTime: 120, errors: 2 },
    { time: '01:00', requests: 189, responseTime: 115, errors: 1 },
    { time: '02:00', requests: 156, responseTime: 110, errors: 0 },
    { time: '03:00', requests: 134, responseTime: 125, errors: 1 },
    { time: '04:00', requests: 178, responseTime: 130, errors: 3 },
    { time: '05:00', requests: 223, responseTime: 118, errors: 1 },
    { time: '06:00', requests: 298, responseTime: 135, errors: 4 }
  ]);

  const [activeUsers] = useState([
    { time: '00:00', users: 1245 },
    { time: '01:00', users: 989 },
    { time: '02:00', users: 756 },
    { time: '03:00', users: 634 },
    { time: '04:00', users: 778 },
    { time: '05:00', users: 1023 },
    { time: '06:00', users: 1456 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Monitoring</h1>
          <p className="text-muted-foreground">Monitor system performance and service health in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(1)}{metric.unit}
                  </div>
                  <Progress 
                    value={metric.value} 
                    className="mt-2"
                    // @ts-ignore
                    indicatorClassName={
                      metric.value > metric.threshold ? 'bg-red-500' :
                      metric.value > metric.threshold * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Threshold: {metric.threshold}{metric.unit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Requests and response times over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="requests"
                      stroke="#8884d8"
                      name="Requests/hour"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#82ca9d"
                      name="Avg Response Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Real-time user activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activeUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="text-2xl font-bold">{service.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Response Time</p>
                      <p className="text-2xl font-bold">{service.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Check</p>
                      <p className="text-sm">{service.lastCheck}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
                <CardDescription>Comprehensive system performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#8884d8"
                      name="Requests"
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="#ff7300"
                      name="Errors"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">High disk usage detected</p>
                      <p className="text-sm text-muted-foreground">Disk usage is at 72% - consider cleanup</p>
                    </div>
                    <span className="text-xs text-muted-foreground">5 min ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">All services operational</p>
                      <p className="text-sm text-muted-foreground">System health check completed successfully</p>
                    </div>
                    <span className="text-xs text-muted-foreground">10 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
