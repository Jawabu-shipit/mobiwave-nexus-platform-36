
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3
} from 'lucide-react';

interface SystemHealth {
  cpu: { usage: number; temperature: number; status: 'healthy' | 'warning' | 'critical' };
  memory: { used: number; total: number; status: 'healthy' | 'warning' | 'critical' };
  disk: { used: number; total: number; status: 'healthy' | 'warning' | 'critical' };
  network: { latency: number; throughput: number; status: 'healthy' | 'warning' | 'critical' };
  database: { connections: number; queryTime: number; status: 'healthy' | 'warning' | 'critical' };
}

interface DiagnosticTest {
  id: string;
  name: string;
  status: 'running' | 'passed' | 'failed' | 'warning';
  duration: number;
  lastRun: string;
  description: string;
}

export function SystemDiagnostics() {
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  const { data: systemHealth, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      return {
        cpu: { usage: 67, temperature: 58, status: 'healthy' },
        memory: { used: 6.2, total: 8, status: 'warning' },
        disk: { used: 245, total: 500, status: 'healthy' },
        network: { latency: 23, throughput: 89, status: 'healthy' },
        database: { connections: 15, queryTime: 45, status: 'healthy' }
      };
    },
    refetchInterval: 5000
  });

  const { data: diagnosticTests } = useQuery({
    queryKey: ['diagnostic-tests'],
    queryFn: async (): Promise<DiagnosticTest[]> => {
      return [
        {
          id: '1',
          name: 'Database Connectivity',
          status: 'passed',
          duration: 250,
          lastRun: new Date(Date.now() - 300000).toISOString(),
          description: 'Test database connection and query performance'
        },
        {
          id: '2',
          name: 'API Endpoints',
          status: 'passed',
          duration: 180,
          lastRun: new Date(Date.now() - 180000).toISOString(),
          description: 'Verify all API endpoints are responding correctly'
        },
        {
          id: '3',
          name: 'Security Certificates',
          status: 'warning',
          duration: 95,
          lastRun: new Date(Date.now() - 120000).toISOString(),
          description: 'Check SSL certificate validity and expiration'
        },
        {
          id: '4',
          name: 'Service Dependencies',
          status: 'passed',
          duration: 320,
          lastRun: new Date(Date.now() - 240000).toISOString(),
          description: 'Validate external service integrations'
        }
      ];
    }
  });

  const runComprehensiveDiagnostics = async () => {
    setRunningDiagnostics(true);
    // Simulate running diagnostics
    setTimeout(() => {
      setRunningDiagnostics(false);
    }, 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Server className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <div>Loading system diagnostics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Diagnostics</h2>
          <p className="text-gray-600">Real-time system health monitoring and diagnostic tools</p>
        </div>
        <Button 
          onClick={runComprehensiveDiagnostics}
          disabled={runningDiagnostics}
        >
          <Zap className="w-4 h-4 mr-2" />
          {runningDiagnostics ? 'Running...' : 'Run Full Diagnostics'}
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <Badge className={getStatusColor(systemHealth?.cpu.status || 'healthy')}>
                {systemHealth?.cpu.status}
              </Badge>
            </div>
            <h3 className="font-medium">CPU</h3>
            <p className="text-2xl font-bold">{systemHealth?.cpu.usage}%</p>
            <Progress value={systemHealth?.cpu.usage} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Temp: {systemHealth?.cpu.temperature}°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <Badge className={getStatusColor(systemHealth?.memory.status || 'healthy')}>
                {systemHealth?.memory.status}
              </Badge>
            </div>
            <h3 className="font-medium">Memory</h3>
            <p className="text-2xl font-bold">
              {systemHealth?.memory.used}GB/{systemHealth?.memory.total}GB
            </p>
            <Progress 
              value={(systemHealth?.memory.used || 0) / (systemHealth?.memory.total || 1) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Server className="w-5 h-5 text-green-600" />
              <Badge className={getStatusColor(systemHealth?.disk.status || 'healthy')}>
                {systemHealth?.disk.status}
              </Badge>
            </div>
            <h3 className="font-medium">Disk</h3>
            <p className="text-2xl font-bold">
              {systemHealth?.disk.used}GB/{systemHealth?.disk.total}GB
            </p>
            <Progress 
              value={(systemHealth?.disk.used || 0) / (systemHealth?.disk.total || 1) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="w-5 h-5 text-orange-600" />
              <Badge className={getStatusColor(systemHealth?.network.status || 'healthy')}>
                {systemHealth?.network.status}
              </Badge>
            </div>
            <h3 className="font-medium">Network</h3>
            <p className="text-lg font-bold">{systemHealth?.network.latency}ms</p>
            <p className="text-sm text-gray-600">{systemHealth?.network.throughput}% util</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-red-600" />
              <Badge className={getStatusColor(systemHealth?.database.status || 'healthy')}>
                {systemHealth?.database.status}
              </Badge>
            </div>
            <h3 className="font-medium">Database</h3>
            <p className="text-lg font-bold">{systemHealth?.database.connections} conn</p>
            <p className="text-sm text-gray-600">{systemHealth?.database.queryTime}ms avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostic Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Diagnostic Tests
          </CardTitle>
          <CardDescription>
            Automated system health checks and validation tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnosticTests?.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last run: {new Date(test.lastRun).toLocaleString()} • Duration: {test.duration}ms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Run Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              System performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
              <p className="text-gray-600">
                Detailed performance metrics and trend analysis.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Optimization</CardTitle>
            <CardDescription>
              System optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Memory Optimization</p>
                  <p className="text-xs text-gray-600">Consider increasing memory allocation</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">CPU Performance</p>
                  <p className="text-xs text-gray-600">CPU utilization is within optimal range</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
