
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Shield, Webhook, BarChart3 } from 'lucide-react';

interface MpesaServiceConfigProps {
  serviceId: string;
}

export function MpesaServiceConfig({ serviceId }: MpesaServiceConfigProps) {
  const [config, setConfig] = useState({
    paybillNumber: '',
    tillNumber: '',
    callbackUrl: '',
    confirmationUrl: '',
    consumerKey: '',
    consumerSecret: ''
  });

  const handleSave = () => {
    console.log('Saving M-Pesa config:', config);
  };

  return (
    <Tabs defaultValue="setup" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="setup">Setup</TabsTrigger>
        <TabsTrigger value="credentials">Credentials</TabsTrigger>
        <TabsTrigger value="callbacks">Callbacks</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>

      <TabsContent value="setup" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paybill">Paybill Number</Label>
            <Input
              id="paybill"
              value={config.paybillNumber}
              onChange={(e) => setConfig({...config, paybillNumber: e.target.value})}
              placeholder="Enter paybill number"
            />
          </div>
          <div>
            <Label htmlFor="till">Till Number (Optional)</Label>
            <Input
              id="till"
              value={config.tillNumber}
              onChange={(e) => setConfig({...config, tillNumber: e.target.value})}
              placeholder="Enter till number"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>SSL Verification</span>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>IP Whitelisting</span>
                <Badge className="bg-blue-100 text-blue-700">Configured</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave}>Save Configuration</Button>
      </TabsContent>

      <TabsContent value="credentials" className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="consumerKey">Consumer Key</Label>
            <Input
              id="consumerKey"
              type="password"
              value={config.consumerKey}
              onChange={(e) => setConfig({...config, consumerKey: e.target.value})}
              placeholder="Enter consumer key"
            />
          </div>
          
          <div>
            <Label htmlFor="consumerSecret">Consumer Secret</Label>
            <Input
              id="consumerSecret"
              type="password"
              value={config.consumerSecret}
              onChange={(e) => setConfig({...config, consumerSecret: e.target.value})}
              placeholder="Enter consumer secret"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>Update Credentials</Button>
            <Button variant="outline">Test API</Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="callbacks" className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="callbackUrl">Callback URL</Label>
            <Input
              id="callbackUrl"
              value={config.callbackUrl}
              onChange={(e) => setConfig({...config, callbackUrl: e.target.value})}
              placeholder="https://your-app.com/mpesa/callback"
            />
          </div>
          
          <div>
            <Label htmlFor="confirmationUrl">Confirmation URL</Label>
            <Input
              id="confirmationUrl"
              value={config.confirmationUrl}
              onChange={(e) => setConfig({...config, confirmationUrl: e.target.value})}
              placeholder="https://your-app.com/mpesa/confirmation"
            />
          </div>

          <Button onClick={handleSave}>Update URLs</Button>
        </div>
      </TabsContent>

      <TabsContent value="transactions" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">KES 45,680</div>
              <div className="text-sm text-gray-600">Total Received</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">123</div>
              <div className="text-sm text-gray-600">Transactions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
