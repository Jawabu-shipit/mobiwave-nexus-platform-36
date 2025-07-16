
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Settings, BarChart3, Phone } from 'lucide-react';

interface SMSServiceConfigProps {
  serviceId: string;
}

export function SMSServiceConfig({ serviceId }: SMSServiceConfigProps) {
  const [config, setConfig] = useState({
    senderId: '',
    defaultRoute: 'premium',
    deliveryReports: true,
    concatenation: true
  });

  const handleSave = () => {
    console.log('Saving SMS config:', config);
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="routing">Routing</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="senderId">Sender ID</Label>
            <Input
              id="senderId"
              value={config.senderId}
              onChange={(e) => setConfig({...config, senderId: e.target.value})}
              placeholder="Enter sender ID"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Message Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Delivery Reports</span>
                <Badge className={config.deliveryReports ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                  {config.deliveryReports ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Long Message Concatenation</span>
                <Badge className={config.concatenation ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                  {config.concatenation ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </TabsContent>

      <TabsContent value="routing" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message Routing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Route</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button 
                  variant={config.defaultRoute === 'premium' ? 'default' : 'outline'}
                  onClick={() => setConfig({...config, defaultRoute: 'premium'})}
                >
                  Premium Route
                </Button>
                <Button 
                  variant={config.defaultRoute === 'standard' ? 'default' : 'outline'}
                  onClick={() => setConfig({...config, defaultRoute: 'standard'})}
                >
                  Standard Route
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Premium Route</span>
                <span>KES 2.50/SMS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Standard Route</span>
                <span>KES 1.80/SMS</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">8,456</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">94%</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">KES 18,920</div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
