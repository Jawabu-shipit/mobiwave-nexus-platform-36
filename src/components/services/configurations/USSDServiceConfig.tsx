
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Code, Settings, BarChart3 } from 'lucide-react';

interface USSDServiceConfigProps {
  serviceId: string;
}

export function USSDServiceConfig({ serviceId }: USSDServiceConfigProps) {
  const [config, setConfig] = useState({
    serviceCode: '*123*456#',
    callbackUrl: '',
    menuStructure: '',
    responseTimeout: 30
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving USSD config:', config);
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="menu">Menu</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serviceCode">Service Code</Label>
            <Input
              id="serviceCode"
              value={config.serviceCode}
              onChange={(e) => setConfig({...config, serviceCode: e.target.value})}
              placeholder="*123*456#"
            />
          </div>
          <div>
            <Label htmlFor="timeout">Response Timeout (seconds)</Label>
            <Input
              id="timeout"
              type="number"
              value={config.responseTimeout}
              onChange={(e) => setConfig({...config, responseTimeout: Number(e.target.value)})}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="callback">Callback URL</Label>
          <Input
            id="callback"
            value={config.callbackUrl}
            onChange={(e) => setConfig({...config, callbackUrl: e.target.value})}
            placeholder="https://your-app.com/ussd/callback"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave}>Save Configuration</Button>
          <Button variant="outline">Test Service</Button>
        </div>
      </TabsContent>

      <TabsContent value="menu" className="space-y-4">
        <div>
          <Label htmlFor="menuStructure">Menu Structure (JSON)</Label>
          <Textarea
            id="menuStructure"
            value={config.menuStructure}
            onChange={(e) => setConfig({...config, menuStructure: e.target.value})}
            placeholder='{"welcome": "Welcome to our service\\n1. Balance\\n2. History", ...}'
            className="h-64"
          />
        </div>
        <Button onClick={handleSave}>Update Menu</Button>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Session Management</span>
              <Badge>Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Auto-timeout</span>
              <Badge>30 seconds</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Logging Level</span>
              <Badge>Info</Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">89%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">2.3s</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
