
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Shield, 
  Activity, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: string;
  status: 'active' | 'inactive' | 'maintenance';
  requestCount: number;
  avgResponseTime: number;
  errorRate: number;
  lastUsed: string;
}

interface RateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  limit: number;
  window: string;
  status: 'active' | 'inactive';
}

export function APIGatewayManager() {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data
  const endpoints: APIEndpoint[] = [
    {
      id: '1',
      name: 'User Authentication',
      path: '/api/auth',
      method: 'POST',
      status: 'active',
      requestCount: 15240,
      avgResponseTime: 156,
      errorRate: 0.8,
      lastUsed: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'SMS Service',
      path: '/api/sms/send',
      method: 'POST',
      status: 'active',
      requestCount: 8960,
      avgResponseTime: 89,
      errorRate: 1.2,
      lastUsed: '2024-01-15T10:25:00Z'
    },
    {
      id: '3',
      name: 'User Profile',
      path: '/api/users/:id',
      method: 'GET',
      status: 'maintenance',
      requestCount: 3200,
      avgResponseTime: 234,
      errorRate: 5.4,
      lastUsed: '2024-01-14T16:45:00Z'
    }
  ];

  const rateLimitRules: RateLimitRule[] = [
    {
      id: '1',
      name: 'Standard Rate Limit',
      endpoint: '/api/*',
      limit: 1000,
      window: '1 hour',
      status: 'active'
    },
    {
      id: '2',
      name: 'Auth Rate Limit',
      endpoint: '/api/auth',
      limit: 10,
      window: '1 minute',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            API Gateway Management
          </h3>
          <p className="text-gray-600">Configure and monitor API endpoints, rate limiting, and security</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Endpoint
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Endpoints</p>
                <p className="text-3xl font-bold">{endpoints.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold">
                  {endpoints.reduce((sum, e) => sum + e.requestCount, 0).toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Response Time</p>
                <p className="text-3xl font-bold">
                  {Math.round(endpoints.reduce((sum, e) => sum + e.avgResponseTime, 0) / endpoints.length)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Error Rate</p>
                <p className="text-3xl font-bold">
                  {(endpoints.reduce((sum, e) => sum + e.errorRate, 0) / endpoints.length).toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <h4 className="font-medium mt-1">{endpoint.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{endpoint.requestCount.toLocaleString()} requests</span>
                          <span>{endpoint.avgResponseTime}ms avg</span>
                          <span>{endpoint.errorRate}% errors</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(endpoint.status)}>
                        {endpoint.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEndpoint(endpoint)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        {endpoint.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limiting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rateLimitRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <code className="bg-gray-100 px-2 py-1 rounded">{rule.endpoint}</code>
                        <span>{rule.limit} requests per {rule.window}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(rule.status)}>
                        {rule.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="cors-origins">CORS Origins</Label>
                    <Input 
                      id="cors-origins"
                      placeholder="https://example.com, https://app.example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-version">API Version</Label>
                    <Input 
                      id="api-version"
                      placeholder="v1"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">SSL/TLS Enforcement</h4>
                      <p className="text-sm text-gray-500">Force HTTPS for all API requests</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">API Key Authentication</h4>
                      <p className="text-sm text-gray-500">Require valid API keys for access</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Request Signing</h4>
                      <p className="text-sm text-gray-500">Verify request signatures for enhanced security</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Optional
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">99.8%</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">1.2M</div>
                        <div className="text-sm text-gray-600">Requests Today</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">145ms</div>
                        <div className="text-sm text-gray-600">Avg Response</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">API Analytics Chart</p>
                    <p className="text-sm text-gray-400">Real-time performance metrics would appear here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
