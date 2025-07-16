
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, TestTube, AlertCircle, CheckCircle, Copy } from 'lucide-react';

interface MpesaIntegration {
  id: string;
  paybill_number: string;
  till_number?: string;
  callback_url: string;
  status: string;
  current_balance: number;
  callback_response_type: string;
}

interface MpesaIntegrationSettingsProps {
  integration: MpesaIntegration;
  onUpdate?: () => void;
}

export function MpesaIntegrationSettings({ integration, onUpdate }: MpesaIntegrationSettingsProps) {
  const [settings, setSettings] = useState({
    callback_url: integration.callback_url,
    callback_response_type: integration.callback_response_type,
    auto_confirm: true,
    webhook_retry_attempts: 3,
    webhook_timeout: 30
  });
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const queryClient = useQueryClient();

  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: typeof settings) => {
      const { data, error } = await supabase
        .from('mspace_pesa_integrations')
        .update({
          callback_url: updatedSettings.callback_url,
          callback_response_type: updatedSettings.callback_response_type
        })
        .eq('id', integration.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpesa-integrations'] });
      toast.success('Settings updated successfully');
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  const testWebhook = useMutation({
    mutationFn: async () => {
      setIsTestingWebhook(true);
      
      // Simulate webhook test
      const testPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: "test-merchant-request",
            CheckoutRequestID: "test-checkout-request",
            ResultCode: 0,
            ResultDesc: "Test transaction successful",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: 100 },
                { Name: "MpesaReceiptNumber", Value: "TEST123456" },
                { Name: "TransactionDate", Value: new Date().toISOString() },
                { Name: "PhoneNumber", Value: "254722000000" }
              ]
            }
          }
        }
      };

      // Test the webhook endpoint
      const response = await fetch(settings.callback_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      if (!response.ok) {
        throw new Error(`Webhook test failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Webhook test successful');
    },
    onError: (error: any) => {
      toast.error(`Webhook test failed: ${error.message}`);
    },
    onSettled: () => {
      setIsTestingWebhook(false);
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const webhookUrl = `${window.location.origin}/api/mpesa/webhook/${integration.id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Integration Settings</h3>
        <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
          {integration.status}
        </Badge>
      </div>

      {/* Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Paybill Number</Label>
              <Input value={integration.paybill_number} disabled />
            </div>
            {integration.till_number && (
              <div>
                <Label>Till Number</Label>
                <Input value={integration.till_number} disabled />
              </div>
            )}
          </div>
          
          <div>
            <Label>Current Balance</Label>
            <div className="text-2xl font-bold text-green-600">
              KES {integration.current_balance.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                disabled
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Use this URL in your M-Pesa configuration
            </p>
          </div>

          <div>
            <Label htmlFor="callback-url">Custom Callback URL (Optional)</Label>
            <Input
              id="callback-url"
              value={settings.callback_url}
              onChange={(e) => setSettings({ ...settings, callback_url: e.target.value })}
              placeholder="https://your-domain.com/mpesa/callback"
            />
            <p className="text-xs text-gray-600 mt-1">
              Override the default webhook URL with your custom endpoint
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => testWebhook.mutate()}
              disabled={isTestingWebhook || !settings.callback_url}
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTestingWebhook ? 'Testing...' : 'Test Webhook'}
            </Button>
            
            <div className="flex items-center gap-2">
              {integration.status === 'active' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Integration Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">Integration Pending</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-confirm transactions</Label>
              <p className="text-sm text-gray-600">Automatically confirm successful payments</p>
            </div>
            <Switch
              checked={settings.auto_confirm}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_confirm: checked })}
            />
          </div>

          <div>
            <Label htmlFor="retry-attempts">Webhook Retry Attempts</Label>
            <Input
              id="retry-attempts"
              type="number"
              min="1"
              max="10"
              value={settings.webhook_retry_attempts}
              onChange={(e) => setSettings({ ...settings, webhook_retry_attempts: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="webhook-timeout">Webhook Timeout (seconds)</Label>
            <Input
              id="webhook-timeout"
              type="number"
              min="10"
              max="120"
              value={settings.webhook_timeout}
              onChange={(e) => setSettings({ ...settings, webhook_timeout: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => updateSettings.mutate(settings)}
          disabled={updateSettings.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
