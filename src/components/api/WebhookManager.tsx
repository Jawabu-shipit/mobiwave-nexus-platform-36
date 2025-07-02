
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Webhook, 
  Plus, 
  Edit2, 
  Trash2, 
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_delivery: string;
  delivery_success_rate: number;
  total_deliveries: number;
  secret: string;
}

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Payment Notifications',
      url: 'https://api.example.com/webhooks/payments',
      events: ['payment.completed', 'payment.failed'],
      is_active: true,
      last_delivery: '2024-06-15 10:30:00',
      delivery_success_rate: 98.5,
      total_deliveries: 1247,
      secret: 'whsec_1234567890abcdef'
    },
    {
      id: '2',
      name: 'User Events',
      url: 'https://api.example.com/webhooks/users',
      events: ['user.created', 'user.updated', 'user.deleted'],
      is_active: false,
      last_delivery: '2024-06-14 15:20:00',
      delivery_success_rate: 95.2,
      total_deliveries: 823,
      secret: 'whsec_abcdef1234567890'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });

  const availableEvents = [
    'user.created',
    'user.updated', 
    'user.deleted',
    'payment.completed',
    'payment.failed',
    'service.activated',
    'service.deactivated',
    'campaign.sent',
    'campaign.delivered'
  ];

  const createWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) return;

    const webhook: WebhookEndpoint = {
      id: Date.now().toString(),
      ...newWebhook,
      is_active: true,
      last_delivery: 'Never',
      delivery_success_rate: 0,
      total_deliveries: 0,
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}`
    };

    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setIsCreating(false);
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, is_active: !webhook.is_active } : webhook
    ));
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
  };

  const testWebhook = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id 
        ? { 
            ...webhook, 
            last_delivery: new Date().toLocaleString(),
            total_deliveries: webhook.total_deliveries + 1
          }
        : webhook
    ));
  };

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-name">Name</Label>
              <Input
                id="webhook-name"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Webhook name"
              />
            </div>
            <div>
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://api.example.com/webhooks"
              />
            </div>
            <div>
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableEvents.map((event) => (
                  <label key={event} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded"
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createWebhook}>Create</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{webhook.name}</CardTitle>
                  <code className="text-sm text-gray-600">{webhook.url}</code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={webhook.is_active ? "default" : "secondary"}>
                    {webhook.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={webhook.is_active}
                    onCheckedChange={() => toggleWebhook(webhook.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subscribed Events</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Deliveries:</span>
                  <div className="font-medium">{webhook.total_deliveries}</div>
                </div>
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <div className="font-medium">
                    {webhook.delivery_success_rate > 0 ? `${webhook.delivery_success_rate}%` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Last Delivery:</span>
                  <div className="font-medium">{webhook.last_delivery}</div>
                </div>
              </div>

              <div>
                <Label>Signing Secret</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-gray-100 p-2 rounded flex-1">{webhook.secret}</code>
                  <Button size="sm" variant="outline">Copy</Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => testWebhook(webhook.id)}>
                  <Play className="w-3 h-3 mr-1" />
                  Test
                </Button>
                <Button size="sm" variant="outline">
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  History
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteWebhook(webhook.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>

              {webhook.delivery_success_rate < 95 && webhook.total_deliveries > 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Low delivery success rate. Check your endpoint configuration.
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
