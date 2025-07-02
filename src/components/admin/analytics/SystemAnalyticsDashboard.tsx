import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Database, 
  Globe, 
  Zap, 
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { LoadingState } from '@/components/common/LoadingState';

export function SystemAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const { data: systemMetrics, isLoading } = useSystemMetrics();

  if (isLoading) {
    return <LoadingState message="Loading system analytics..." />;
  }

  const systemOverview = [
    {
      title: 'Server Uptime',
      value: '99.97%',
      status: 'healthy',
      details: '743 days, 14 hours',
      icon: <Server className="w-4 h-4" />
    },
    {
      title: 'Response Time',
      value: '89ms',
      status: 'good',
      details: 'Avg last 24h',
      icon: <Zap className="w-4 h-4" />
    },
    {
      title: 'Error Rate',
      value: '0.12%',
      status: 'healthy',
      details: '12 errors/10k requests',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      title: 'Throughput',
      value: '2.4K/s',
      status: 'good',
      details: 'Requests per second',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  const infrastructureData = [
    { time: '00:00', cpu: 45, memory: 62, disk: 35, network: 78 },
    { time: '04:00', cpu: 38, memory: 58, disk: 32, network: 65 },
    { time: '08:00', cpu: 72, memory: 78, disk: 48, network: 89 },
    { time: '12:00', cpu: 85, memory: 82, disk: 52, network: 95 },
    { time: '16:00', cpu: 91, memory: 85, disk: 58, network: 98 },
    { time: '20:00', cpu: 76, memory: 71, disk: 45, network: 82 }
  ];

  const databaseMetrics = [
    { metric: 'Query Performance', value: 92, target: 90, status: 'good' },
    { metric: 'Connection Pool', value: 68, target: 80, status: 'good' },
    { metric: 'Cache Hit Ratio', value: 89, target: 95, status: 'warning' },
    { metric: 'Replication Lag', value: 15, target: 10, status: 'warning' }
  ];

  const apiEndpoints = [
    { endpoint: '/api/users', requests: 45600, avgTime: 89, errorRate: 0.08 },
    { endpoint: '/api/services', requests: 32400, avgTime: 156, errorRate: 0.12 },
    { endpoint: '/api/billing', requests: 18200, avgTime: 234, errorRate: 0.05 },
    { endpoint: '/api/analytics', requests: 12800, avgTime: 445, errorRate: 0.15 }
  ];

  const securityMetrics = [
    { metric: 'Failed Login Attempts', value: 127, trend: '+12%' },
    { metric: 'Blocked IPs', value: 23, trend: '+5%' },
    { metric: 'SSL Certificate', value: 'Valid', trend: '89 days left' },
    { metric: 'Security Score', value: '94/100', trend: '+2 points' }
  ];

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemOverview.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {metric.icon}
                    <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.details}</div>
                </div>
                <Badge 
                  variant={
                    metric.status === 'healthy' ? 'default' : 
                    metric.status === 'good' ? 'secondary' : 'destructive'
                  }
                  className="text-xs"
                >
                  {metric.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="infrastructure" className="w-full">
        <TabsList>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Infrastructure Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={infrastructureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory %" />
                    <Line type="monotone" dataKey="disk" stroke="#f59e0b" name="Disk %" />
                    <Line type="monotone" dataKey="network" stroke="#ef4444" name="Network %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <div className="text-2xl font-bold">{systemMetrics?.cpuUsage || 0}%</div>
                <Progress value={systemMetrics?.cpuUsage || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <div className="text-2xl font-bold">{systemMetrics?.memoryUsage || 0}%</div>
                <Progress value={systemMetrics?.memoryUsage || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <div className="text-2xl font-bold">45%</div>
                <Progress value={45} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <div className="text-2xl font-bold">82%</div>
                <Progress value={82} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {databaseMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{metric.value}%</span>
                        <Badge 
                          variant={metric.status === 'good' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="text-xs text-gray-500">Target: {metric.target}%</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Total Queries</span>
                    <span className="text-lg font-bold">2.4M</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Slow Queries</span>
                    <span className="text-lg font-bold text-yellow-600">127</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Active Connections</span>
                    <span className="text-lg font-bold">68/100</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Database Size</span>
                    <span className="text-lg font-bold">45.2 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                API Endpoint Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Endpoint</th>
                      <th className="text-right py-2">Requests</th>
                      <th className="text-right py-2">Avg Response</th>
                      <th className="text-right py-2">Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpoints.map((endpoint, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 font-mono text-sm">{endpoint.endpoint}</td>
                        <td className="text-right py-3">{endpoint.requests.toLocaleString()}</td>
                        <td className="text-right py-3">{endpoint.avgTime}ms</td>
                        <td className="text-right py-3">
                          <Badge 
                            variant={endpoint.errorRate < 0.1 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {endpoint.errorRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityMetrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="text-right">
                        <div className="font-bold">{metric.value}</div>
                        <div className="text-xs text-gray-500">{metric.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">SSL/TLS Encryption</div>
                      <div className="text-xs text-gray-600">All traffic encrypted</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">Firewall Active</div>
                      <div className="text-xs text-gray-600">23 IPs blocked today</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-medium text-sm">Certificate Renewal</div>
                      <div className="text-xs text-gray-600">Due in 89 days</div>
                    </div>
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
