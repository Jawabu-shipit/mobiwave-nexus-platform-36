
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Server, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Settings,
  Plus
} from 'lucide-react';

interface ServerNode {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  load: number;
  connections: number;
  responseTime: number;
  enabled: boolean;
}

export function LoadBalancingConfig() {
  const [servers, setServers] = useState<ServerNode[]>([
    {
      id: '1',
      name: 'Primary Server (us-east-1)',
      status: 'healthy',
      load: 45,
      connections: 234,
      responseTime: 89,
      enabled: true
    },
    {
      id: '2',
      name: 'Secondary Server (us-west-2)',
      status: 'healthy',
      load: 32,
      connections: 156,
      responseTime: 102,
      enabled: true
    },
    {
      id: '3',
      name: 'Backup Server (eu-west-1)',
      status: 'warning',
      load: 78,
      connections: 89,
      responseTime: 145,
      enabled: false
    }
  ]);

  const [balancingAlgorithm, setBalancingAlgorithm] = useState('round-robin');

  const toggleServer = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, enabled: !server.enabled } : server
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const totalConnections = servers.reduce((acc, server) => acc + server.connections, 0);
  const avgResponseTime = servers.reduce((acc, server) => acc + server.responseTime, 0) / servers.length;
  const enabledServers = servers.filter(server => server.enabled).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" />
              Active Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledServers}/{servers.length}</div>
            <p className="text-xs text-gray-600">Servers online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnections}</div>
            <p className="text-xs text-gray-600">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-gray-600">Across all servers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Server Status</CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Server
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servers.map((server) => (
              <div key={server.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(server.status)}
                    <div>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-sm text-gray-600">
                        {server.connections} connections • {server.responseTime}ms avg
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(server.status)}>
                      {server.status}
                    </Badge>
                    <Switch
                      checked={server.enabled}
                      onCheckedChange={() => toggleServer(server.id)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Load</span>
                    <span>{server.load}%</span>
                  </div>
                  <Progress value={server.load} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Load Balancing Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Balancing Algorithm
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['round-robin', 'least-connections', 'weighted'].map((algorithm) => (
                  <Button
                    key={algorithm}
                    variant={balancingAlgorithm === algorithm ? "default" : "outline"}
                    onClick={() => setBalancingAlgorithm(algorithm)}
                    className="capitalize"
                  >
                    {algorithm.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">Health Check Interval</div>
                <div className="text-sm text-blue-700">30 seconds</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">Timeout Threshold</div>
                <div className="text-sm text-blue-700">5 seconds</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">Max Retries</div>
                <div className="text-sm text-blue-700">3 attempts</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">Session Persistence</div>
                <div className="text-sm text-blue-700">IP Hash</div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
