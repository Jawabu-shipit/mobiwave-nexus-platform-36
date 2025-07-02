
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Plus,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used: string;
  is_active: boolean;
  expires_at?: string;
}

export function ApiCredentialsManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_1234567890abcdef',
      permissions: ['read', 'write', 'admin'],
      created_at: '2024-01-15',
      last_used: '2024-06-14',
      is_active: true,
      expires_at: '2025-01-15'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk_test_abcdef1234567890',
      permissions: ['read', 'write'],
      created_at: '2024-02-01',
      last_used: '2024-06-13',
      is_active: true
    }
  ]);

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateNewKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['read'],
      created_at: new Date().toISOString().split('T')[0],
      last_used: 'Never',
      is_active: true
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
  };

  const revokeKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const toggleKeyStatus = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, is_active: !key.is_active } : key
    ));
  };

  const regenerateKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId 
        ? { ...key, key: `sk_${Math.random().toString(36).substring(2, 15)}` }
        : key
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Create New API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="key-name">API Key Name</Label>
              <Input
                id="key-name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter API key name"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateNewKey}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Key
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                      {apiKey.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {apiKey.expires_at && (
                      <Badge variant="outline">
                        Expires: {apiKey.expires_at}
                      </Badge>
                    )}
                  </div>
                </div>
                <Switch
                  checked={apiKey.is_active}
                  onCheckedChange={() => toggleKeyStatus(apiKey.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type={showKeys[apiKey.id] ? "text" : "password"}
                    value={apiKey.key}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  >
                    {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey.key)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Created: {apiKey.created_at}</span>
                <span>Last used: {apiKey.last_used}</span>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="flex gap-1 mt-1">
                  {apiKey.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => regenerateKey(apiKey.id)}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => revokeKey(apiKey.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Revoke
                </Button>
              </div>

              {apiKey.expires_at && new Date(apiKey.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    This API key will expire soon. Consider regenerating it.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
