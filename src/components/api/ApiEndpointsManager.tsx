
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Code, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Play,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  is_active: boolean;
  response_time: number;
  success_rate: number;
  last_tested: string;
}

export function ApiEndpointsManager() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      id: '1',
      name: 'Get Users',
      method: 'GET',
      path: '/api/users',
      description: 'Retrieve all users with pagination',
      is_active: true,
      response_time: 45,
      success_rate: 99.2,
      last_tested: '2024-06-15 10:30:00'
    },
    {
      id: '2',
      name: 'Create User',
      method: 'POST',
      path: '/api/users',
      description: 'Create a new user account',
      is_active: true,
      response_time: 120,
      success_rate: 98.8,
      last_tested: '2024-06-15 10:25:00'
    },
    {
      id: '3',
      name: 'Update User',
      method: 'PUT',
      path: '/api/users/:id',
      description: 'Update user information',
      is_active: false,
      response_time: 0,
      success_rate: 0,
      last_tested: 'Never'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    method: 'GET' as const,
    path: '',
    description: ''
  });

  const createEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.path) return;

    const endpoint: ApiEndpoint = {
      id: Date.now().toString(),
      ...newEndpoint,
      is_active: true,
      response_time: 0,
      success_rate: 0,
      last_tested: 'Never'
    };

    setEndpoints(prev => [...prev, endpoint]);
    setNewEndpoint({ name: '', method: 'GET', path: '', description: '' });
    setIsCreating(false);
  };

  const deleteEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(endpoint => endpoint.id !== id));
  };

  const testEndpoint = (id: string) => {
    setEndpoints(prev => prev.map(endpoint => 
      endpoint.id === id 
        ? { 
            ...endpoint, 
            last_tested: new Date().toLocaleString(),
            response_time: Math.floor(Math.random() * 200) + 20,
            success_rate: Math.floor(Math.random() * 20) + 80
          }
        : endpoint
    ));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Endpoints</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Endpoint
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endpoint-name">Name</Label>
                <Input
                  id="endpoint-name"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Endpoint name"
                />
              </div>
              <div>
                <Label htmlFor="endpoint-method">Method</Label>
                <Select 
                  value={newEndpoint.method}
                  onValueChange={(value: any) => setNewEndpoint(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="endpoint-path">Path</Label>
              <Input
                id="endpoint-path"
                value={newEndpoint.path}
                onChange={(e) => setNewEndpoint(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/api/endpoint"
              />
            </div>
            <div>
              <Label htmlFor="endpoint-description">Description</Label>
              <Textarea
                id="endpoint-description"
                value={newEndpoint.description}
                onChange={(e) => setNewEndpoint(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Endpoint description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createEndpoint}>Create</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getMethodColor(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                  <div>
                    <h4 className="font-semibold">{endpoint.name}</h4>
                    <code className="text-sm text-gray-600">{endpoint.path}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {endpoint.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{endpoint.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Response Time:</span>
                  <div className="font-medium">
                    {endpoint.response_time > 0 ? `${endpoint.response_time}ms` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <div className="font-medium">
                    {endpoint.success_rate > 0 ? `${endpoint.success_rate}%` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Last Tested:</span>
                  <div className="font-medium">{endpoint.last_tested}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => testEndpoint(endpoint.id)}>
                  <Play className="w-3 h-3 mr-1" />
                  Test
                </Button>
                <Button size="sm" variant="outline">
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Docs
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteEndpoint(endpoint.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
