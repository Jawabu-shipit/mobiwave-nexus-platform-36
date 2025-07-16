
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Activity, 
  Clock, 
  Shield, 
  AlertTriangle,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiMetrics } from '@/hooks/useApiMetrics';
import { LoadingState } from '@/components/common/LoadingState';

interface RateLimit {
  id: string;
  name: string;
  path: string;
  method: string;
  limit: number;
  window: string;
  enabled: boolean;
  current_usage: number;
}

export function RateLimitingConfig() {
  const { apiMetrics, isLoading } = useApiMetrics();
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([
    {
      id: '1',
      name: 'SMS Sending',
      path: '/api/sms/send',
      method: 'POST',
      limit: 100,
      window: 'hour',
      enabled: true,
      current_usage: 67
    },
    {
      id: '2',
      name: 'User Creation',
      path: '/api/users',
      method: 'POST',
      limit: 10,
      window: 'minute',
      enabled: true,
      current_usage: 3
    },
    {
      id: '3',
      name: 'General API',
      path: '/api/*',
      method: '*',
      limit: 1000,
      window: 'hour',
      enabled: true,
      current_usage: 234
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newLimit, setNewLimit] = useState({
    name: '',
    path: '',
    method: 'GET',
    limit: 100,
    window: 'hour'
  });

  const createRateLimit = () => {
    if (!newLimit.name || !newLimit.path) return;

    const rateLimit: RateLimit = {
      id: Date.now().toString(),
      ...newLimit,
      enabled: true,
      current_usage: 0
    };

    setRateLimits(prev => [...prev, rateLimit]);
    setNewLimit({ name: '', path: '', method: 'GET', limit: 100, window: 'hour' });
    setIsCreating(false);
  };

  const toggleRateLimit = (id: string) => {
    setRateLimits(prev => prev.map(limit => 
      limit.id === id ? { ...limit, enabled: !limit.enabled } : limit
    ));
  };

  const deleteRateLimit = (id: string) => {
    setRateLimits(prev => prev.filter(limit => limit.id !== id));
  };

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rate Limiting Configuration</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rate Limit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Limits</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimits.filter(l => l.enabled).length}</div>
            <p className="text-xs text-muted-foreground">
              {rateLimits.length} total configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics?.totalRequests.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+15%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics?.rateLimitUsage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Of highest rate limit
            </p>
          </CardContent>
        </Card>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Rate Limit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="limit-name">Name</Label>
                <Input
                  id="limit-name"
                  value={newLimit.name}
                  onChange={(e) => setNewLimit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Rate limit name"
                />
              </div>
              <div>
                <Label htmlFor="limit-path">Path Pattern</Label>
                <Input
                  id="limit-path"
                  value={newLimit.path}
                  onChange={(e) => setNewLimit(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="/api/endpoint or /api/*"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="limit-method">Method</Label>
                <Select 
                  value={newLimit.method}
                  onValueChange={(value) => setNewLimit(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limit-requests">Requests</Label>
                <Input
                  id="limit-requests"
                  type="number"
                  value={newLimit.limit}
                  onChange={(e) => setNewLimit(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="limit-window">Time Window</Label>
                <Select 
                  value={newLimit.window}
                  onValueChange={(value) => setNewLimit(prev => ({ ...prev, window: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minute">Per Minute</SelectItem>
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createRateLimit}>Create</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {rateLimits.map((limit) => (
          <Card key={limit.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{limit.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{limit.method}</Badge>
                    <code className="text-sm text-gray-600">{limit.path}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={limit.enabled ? "default" : "secondary"}>
                    {limit.enabled ? "Active" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={limit.enabled}
                    onCheckedChange={() => toggleRateLimit(limit.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Limit:</span>
                  <span className="ml-2 font-medium">{limit.limit} requests per {limit.window}</span>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${getUsageColor(limit.current_usage, limit.limit)}`}>
                    {limit.current_usage} / {limit.limit}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((limit.current_usage / limit.limit) * 100)}% used
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageBarColor(limit.current_usage, limit.limit)}`}
                  style={{ width: `${Math.min((limit.current_usage / limit.limit) * 100, 100)}%` }}
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  View History
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteRateLimit(limit.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>

              {limit.current_usage / limit.limit > 0.8 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Rate limit is approaching maximum usage.
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
