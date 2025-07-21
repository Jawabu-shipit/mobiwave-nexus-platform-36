
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface ServiceHealth {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  incidents: number;
  lastIncident?: string;
}

export function SystemHealthDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 45,
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '2 min ago'
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 68,
      status: 'healthy',
      trend: 'up',
      lastUpdated: '2 min ago'
    },
    {
      id: 'disk',
      name: 'Disk Usage',
      value: 72,
      status: 'warning',
      trend: 'up',
      lastUpdated: '2 min ago'
    },
    {
      id: 'network',
      name: 'Network Latency',
      value: 23,
      status: 'healthy',
      trend: 'down',
      lastUpdated: '2 min ago'
    }
  ]);

  const [services, setServices] = useState<ServiceHealth[]>([
    {
      id: 'api',
      name: 'API Gateway',
      status: 'operational',
      uptime: 99.9,
      incidents: 0,
    },
    {
      id: 'database',
      name: 'Database',
      status: 'operational',
      uptime: 99.99,
      incidents: 0,
    },
    {
      id: 'sms',
      name: 'SMS Service',
      status: 'operational',
      uptime: 99.8,
      incidents: 1,
      lastIncident: '2 days ago'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp API',
      status: 'degraded',
      uptime: 98.5,
      incidents: 3,
      lastIncident: '4 hours ago'
    }
  ]);

  const [performanceData] = useState([
    { time: '00:00', cpu: 45, memory: 62, disk: 70 },
    { time: '04:00', cpu: 38, memory: 65, disk: 71 },
    { time: '08:00', cpu: 52, memory: 70, disk: 72 },
    { time: '12:00', cpu: 48, memory: 68, disk: 72 },
    { time: '16:00', cpu: 55, memory: 72, disk: 73 },
    { time: '20:00', cpu: 42, memory: 66, disk: 72 },
    { time: '24:00', cpu: 45, memory: 68, disk: 72 }
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
      case 'down':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const overallHealth = () => {
    const criticalCount = healthMetrics.filter(m => m.status === 'critical').length;
    const warningCount = healthMetrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Monitor infrastructure health and performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(overallHealth())}
            <Badge className={getStatusColor(overallHealth())}>
              {overallHealth()}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center gap-1">
                {getTrendIcon(metric.trend)}
                {getStatusIcon(metric.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}%</div>
              <Progress 
                value={metric.value} 
                className="mt-2"
                // @ts-ignore
                indicatorClassName={
                  metric.status === 'critical' ? 'bg-red-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Updated {metric.lastUpdated}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Trends</CardTitle>
          <CardDescription>24-hour performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#8884d8"
                strokeWidth={2}
                name="CPU %"
              />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Memory %"
              />
              <Line
                type="monotone"
                dataKey="disk"
                stroke="#ffc658"
                strokeWidth={2}
                name="Disk %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Current status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    {service.lastIncident && (
                      <p className="text-sm text-muted-foreground">
                        Last incident: {service.lastIncident}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.uptime}% uptime</p>
                    <p className="text-xs text-muted-foreground">
                      {service.incidents} incidents this month
                    </p>
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

      {/* System Information */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Load</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.85</div>
            <p className="text-xs text-muted-foreground">
              Load average (1m)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Connections</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45/100</div>
            <p className="text-xs text-muted-foreground">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94/100</div>
            <p className="text-xs text-muted-foreground">
              Security rating
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
}
