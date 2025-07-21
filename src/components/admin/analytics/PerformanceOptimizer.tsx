
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Lightbulb
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function PerformanceOptimizer() {
  const [timeRange, setTimeRange] = useState('24h');
  const [metricType, setMetricType] = useState('response_time');

  const performanceData = [
    { time: '00:00', cpu: 45, memory: 67, disk: 32, network: 23 },
    { time: '04:00', cpu: 52, memory: 71, disk: 35, network: 28 },
    { time: '08:00', cpu: 78, memory: 85, disk: 42, network: 45 },
    { time: '12:00', cpu: 89, memory: 92, disk: 48, network: 67 },
    { time: '16:00', cpu: 76, memory: 88, disk: 44, network: 52 },
    { time: '20:00', cpu: 65, memory: 75, disk: 38, network: 35 }
  ];

  const optimizations = [
    {
      id: 1,
      title: 'Database Query Optimization',
      description: 'Reduce query execution time by 40% with index optimization',
      impact: 'High',
      effort: 'Medium',
      status: 'recommended',
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 2,
      title: 'API Response Caching',
      description: 'Implement Redis caching for frequently accessed endpoints',
      impact: 'High',
      effort: 'Low',
      status: 'in_progress',
      icon: <Server className="w-4 h-4" />
    },
    {
      id: 3,
      title: 'Memory Usage Optimization',
      description: 'Optimize component rendering to reduce memory footprint',
      impact: 'Medium',
      effort: 'High',
      status: 'completed',
      icon: <MemoryStick className="w-4 h-4" />
    }
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: 67, threshold: 80, status: 'good' },
    { name: 'Memory Usage', value: 74, threshold: 85, status: 'warning' },
    { name: 'Disk I/O', value: 42, threshold: 70, status: 'good' },
    { name: 'Network Latency', value: 89, threshold: 75, status: 'critical' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recommended': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Metric:</span>
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="response_time">Response Time</SelectItem>
              <SelectItem value="throughput">Throughput</SelectItem>
              <SelectItem value="error_rate">Error Rate</SelectItem>
              <SelectItem value="resource_usage">Resource Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              System Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="memory" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="disk" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  <Area type="monotone" dataKey="network" stackId="1" stroke="#ff7c7c" fill="#ff7c7c" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}%
                  </span>
                </div>
                <Progress value={metric.value} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Threshold: {metric.threshold}%</span>
                  <Badge 
                    variant={metric.status === 'good' ? 'default' : 
                           metric.status === 'warning' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((opt) => (
              <div key={opt.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(opt.status)}
                        <h4 className="font-medium">{opt.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{opt.description}</p>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                          Impact: {opt.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Effort: {opt.effort}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    {opt.status === 'completed' ? 'View' : 
                     opt.status === 'in_progress' ? 'Monitor' : 'Implement'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Optimization Success</span>
              </div>
              <p className="text-sm text-green-700">
                API response time improved by 35% after implementing caching
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Memory Alert</span>
              </div>
              <p className="text-sm text-yellow-700">
                Memory usage approaching threshold during peak hours
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Growth Trend</span>
              </div>
              <p className="text-sm text-blue-700">
                System load increased 25% over the last month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
