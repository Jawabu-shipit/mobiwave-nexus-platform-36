
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Send,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3
} from 'lucide-react';

interface MessagingPlatform {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'voice';
  provider: string;
  status: 'active' | 'inactive' | 'error';
  enabled: boolean;
  monthlyQuota: number;
  used: number;
  successRate: number;
  cost: number;
}

export function MessagingPlatforms() {
  const [platforms, setPlatforms] = useState<MessagingPlatform[]>([
    {
      id: '1',
      name: 'SMS Gateway',
      type: 'sms',
      provider: 'MSpace',
      status: 'active',
      enabled: true,
      monthlyQuota: 10000,
      used: 6750,
      successRate: 98.5,
      cost: 145.20
    },
    {
      id: '2',
      name: 'Email Service',
      type: 'email',
      provider: 'SendGrid',
      status: 'error',
      enabled: false,
      monthlyQuota: 50000,
      used: 12450,
      successRate: 94.2,
      cost: 89.50
    },
    {
      id: '3',
      name: 'WhatsApp Business',
      type: 'whatsapp',
      provider: 'Meta',
      status: 'active',
      enabled: true,
      monthlyQuota: 5000,
      used: 2890,
      successRate: 96.8,
      cost: 67.30
    },
    {
      id: '4',
      name: 'Voice Calls',
      type: 'voice',
      provider: 'Twilio',
      status: 'inactive',
      enabled: false,
      monthlyQuota: 1000,
      used: 0,
      successRate: 0,
      cost: 0
    }
  ]);

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => prev.map(platform => 
      platform.id === platformId 
        ? { ...platform, enabled: !platform.enabled }
        : platform
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'inactive': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'whatsapp': return <MessageSquare className="w-5 h-5" />;
      case 'voice': return <Phone className="w-5 h-5" />;
      default: return <Send className="w-5 h-5" />;
    }
  };

  const totalCost = platforms.reduce((acc, platform) => acc + platform.cost, 0);
  const totalMessages = platforms.reduce((acc, platform) => acc + platform.used, 0);
  const avgSuccessRate = platforms.reduce((acc, platform) => acc + platform.successRate, 0) / platforms.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <Progress value={avgSuccessRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-gray-600">Current billing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platforms.filter(p => p.status === 'active').length}/{platforms.length}
            </div>
            <p className="text-xs text-gray-600">Operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPlatformIcon(platform.type)}
                  <div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <p className="text-sm text-gray-600">{platform.provider}</p>
                  </div>
                </div>
                <Switch
                  checked={platform.enabled}
                  onCheckedChange={() => togglePlatform(platform.id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(platform.status)}
                    <Badge className={getStatusColor(platform.status)}>
                      {platform.status}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">${platform.cost}/month</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage</span>
                    <span>{platform.used.toLocaleString()} / {platform.monthlyQuota.toLocaleString()}</span>
                  </div>
                  <Progress value={(platform.used / platform.monthlyQuota) * 100} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-medium">{platform.successRate}%</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900 mb-2">SMS Gateway - Excellent Performance</div>
              <div className="text-sm text-green-700">
                98.5% success rate with consistent delivery times. No issues detected.
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="font-medium text-red-900 mb-2">Email Service - Connection Issues</div>
              <div className="text-sm text-red-700">
                Service experiencing authentication errors. Check API credentials and try reconnecting.
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">WhatsApp Business - Performing Well</div>
              <div className="text-sm text-blue-700">
                96.8% success rate. Consider increasing monthly quota as you're approaching 60% usage.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
