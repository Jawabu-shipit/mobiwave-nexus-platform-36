
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Key, FileText, BarChart3 } from 'lucide-react';

interface WhatsAppServiceConfigProps {
  serviceId: string;
}

export function WhatsAppServiceConfig({ serviceId }: WhatsAppServiceConfigProps) {
  const [config, setConfig] = useState({
    businessAccountId: '',
    phoneNumberId: '',
    accessToken: '',
    webhookUrl: '',
    verifyToken: ''
  });

  const handleSave = () => {
    console.log('Saving WhatsApp config:', config);
  };

  return (
    <Tabs defaultValue="connection" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="connection">Connection</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="webhook">Webhook</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="connection" className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessId">Business Account ID</Label>
            <Input
              id="businessId"
              value={config.businessAccountId}
              onChange={(e) => setConfig({...config, businessAccountId: e.target.value})}
              placeholder="Enter your Business Account ID"
            />
          </div>
          
          <div>
            <Label htmlFor="phoneId">Phone Number ID</Label>
            <Input
              id="phoneId"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({...config, phoneNumberId: e.target.value})}
              placeholder="Enter your Phone Number ID"
            />
          </div>

          <div>
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              value={config.accessToken}
              onChange={(e) => setConfig({...config, accessToken: e.target.value})}
              placeholder="Enter your access token"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>Save Configuration</Button>
            <Button variant="outline">Test Connection</Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Welcome Message</div>
                  <div className="text-sm text-gray-600">Status: Approved</div>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Order Confirmation</div>
                  <div className="text-sm text-gray-600">Status: Pending</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
              </div>
            </div>
            <Button className="mt-4">Create New Template</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="webhook" className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={config.webhookUrl}
              onChange={(e) => setConfig({...config, webhookUrl: e.target.value})}
              placeholder="https://your-app.com/whatsapp/webhook"
            />
          </div>
          
          <div>
            <Label htmlFor="verifyToken">Verify Token</Label>
            <Input
              id="verifyToken"
              value={config.verifyToken}
              onChange={(e) => setConfig({...config, verifyToken: e.target.value})}
              placeholder="Enter verify token"
            />
          </div>

          <Button onClick={handleSave}>Update Webhook</Button>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">567</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">34%</div>
              <div className="text-sm text-gray-600">Read Rate</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
