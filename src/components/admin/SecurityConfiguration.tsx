
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SecurityConfiguration() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    twoFactorRequired: true,
    passwordComplexity: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelisting: false,
    auditLogging: true,
    dataEncryption: true,
    apiRateLimit: 1000
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: `${key} has been updated successfully.`,
    });
  };

  const securityMetrics = [
    {
      title: "Security Score",
      value: "95%",
      status: "excellent",
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Active Sessions",
      value: "234",
      status: "normal",
      icon: Lock,
      color: "text-blue-600"
    },
    {
      title: "Failed Logins",
      value: "12",
      status: "warning",
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    {
      title: "API Calls",
      value: "15.2K",
      status: "normal",
      icon: Key,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-red-900 via-red-800 to-red-700 bg-clip-text text-transparent">
          Security Configuration
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Configure security settings and monitor system security metrics.
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <Badge 
                    className={
                      metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {metric.status}
                  </Badge>
                </div>
                <div className="p-3 rounded-full bg-gray-50">
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Alerts */}
      <Alert className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          12 failed login attempts detected in the last hour. Consider reviewing IP blocking rules.
        </AlertDescription>
      </Alert>

      {/* Authentication Settings */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Authentication & Access Control
          </CardTitle>
          <CardDescription>
            Configure user authentication and access control policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Require Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
            </div>
            <Switch
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) => handleSettingChange('twoFactorRequired', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Password Complexity Requirements</Label>
              <p className="text-sm text-gray-500">Enforce strong password policies</p>
            </div>
            <Switch
              checked={settings.passwordComplexity}
              onCheckedChange={(checked) => handleSettingChange('passwordComplexity', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Security */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            System Security
          </CardTitle>
          <CardDescription>
            Configure system-level security features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">IP Whitelisting</Label>
              <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
            </div>
            <Switch
              checked={settings.ipWhitelisting}
              onCheckedChange={(checked) => handleSettingChange('ipWhitelisting', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Audit Logging</Label>
              <p className="text-sm text-gray-500">Log all user actions and system events</p>
            </div>
            <Switch
              checked={settings.auditLogging}
              onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Data Encryption</Label>
              <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
            </div>
            <Switch
              checked={settings.dataEncryption}
              onCheckedChange={(checked) => handleSettingChange('dataEncryption', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
            <Input
              id="apiRateLimit"
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Security Actions
          </CardTitle>
          <CardDescription>
            Quick security actions and maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <p className="font-medium">Force Password Reset</p>
                <p className="text-sm text-gray-500">For all users</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <p className="font-medium">Clear Failed Logins</p>
                <p className="text-sm text-gray-500">Reset attempt counters</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <p className="font-medium">Generate Security Report</p>
                <p className="text-sm text-gray-500">Download audit log</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
