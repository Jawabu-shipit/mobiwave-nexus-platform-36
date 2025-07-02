
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Key, 
  Plus, 
  Copy, 
  Shield, 
  Activity,
  Code,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed: string;
  requests: number;
  created_at: string;
}

export function PublicAPIManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'mk_live_1234567890abcdef',
      permissions: ['read:services', 'write:services', 'read:users'],
      isActive: true,
      lastUsed: '2024-06-15 14:30:00',
      requests: 1247,
      created_at: '2024-06-01'
    },
    {
      id: '2',
      name: 'Development API',
      key: 'mk_test_abcdef1234567890',
      permissions: ['read:services'],
      isActive: false,
      lastUsed: '2024-06-10 09:15:00',
      requests: 523,
      created_at: '2024-06-05'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newAPIKey, setNewAPIKey] = useState({
    name: '',
    permissions: [] as string[]
  });

  const availablePermissions = [
    'read:services',
    'write:services',
    'read:users',
    'write:users',
    'read:analytics',
    'write:campaigns'
  ];

  const generateAPIKey = () => {
    if (!newAPIKey.name) return;

    const key: APIKey = {
      id: Date.now().toString(),
      name: newAPIKey.name,
      key: `mk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: newAPIKey.permissions,
      isActive: true,
      lastUsed: 'Never',
      requests: 0,
      created_at: new Date().toISOString().split('T')[0]
    };

    setApiKeys(prev => [...prev, key]);
    setNewAPIKey({ name: '', permissions: [] });
    setIsCreating(false);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const togglePermission = (permission: string) => {
    setNewAPIKey(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Public API Management</h3>
          <p className="text-gray-600">Manage API keys and access to your platform</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate API Key
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-name">API Key Name</Label>
              <Input
                id="api-name"
                value={newAPIKey.name}
                onChange={(e) => setNewAPIKey(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter API key name"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availablePermissions.map((permission) => (
                  <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAPIKey.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="rounded"
                    />
                    <span className="text-sm">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateAPIKey}>Generate</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {apiKey.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                      {apiKey.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {apiKey.requests} requests
                    </span>
                  </div>
                </div>
                <Switch
                  checked={apiKey.isActive}
                  onCheckedChange={(checked) => {
                    setApiKeys(prev => prev.map(key => 
                      key.id === apiKey.id ? { ...key, isActive: checked } : key
                    ));
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                    {showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  >
                    {showKeys[apiKey.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey.key)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {apiKey.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Last Used:</span>
                  <div>{apiKey.lastUsed}</div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div>{apiKey.created_at}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Use these endpoints to integrate with our platform programmatically.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Badge variant="outline">GET</Badge>
              <code>/api/services</code>
              <span className="text-sm text-gray-600">- List all services</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Badge variant="outline">POST</Badge>
              <code>/api/services</code>
              <span className="text-sm text-gray-600">- Create new service</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Badge variant="outline">GET</Badge>
              <code>/api/users</code>
              <span className="text-sm text-gray-600">- List users</span>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
