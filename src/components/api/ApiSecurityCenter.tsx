import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Globe,
  Settings
} from 'lucide-react';

export function ApiSecurityCenter() {
  const securityFeatures = [
    {
      name: 'Rate Limiting',
      description: 'Limit requests per IP/API key',
      enabled: true,
      status: 'active',
      value: '1000 req/hour'
    },
    {
      name: 'IP Whitelist',
      description: 'Allow requests only from specific IPs',
      enabled: false,
      status: 'inactive',
      value: '0 IPs configured'
    },
    {
      name: 'CORS Policy',
      description: 'Cross-origin resource sharing settings',
      enabled: true,
      status: 'active',
      value: '3 domains allowed'
    },
    {
      name: 'Request Signing',
      description: 'Require signed requests with HMAC',
      enabled: true,
      status: 'active',
      value: 'SHA-256'
    },
    {
      name: 'SSL/TLS Enforcement',
      description: 'Force HTTPS for all API calls',
      enabled: true,
      status: 'active',
      value: 'TLS 1.3'
    },
    {
      name: 'API Versioning',
      description: 'Version control for API endpoints',
      enabled: true,
      status: 'active',
      value: 'v1, v2 active'
    }
  ];

  const securityMetrics = [
    { label: 'Blocked Requests (24h)', value: '1,234', trend: '+15%', color: 'text-red-600' },
    { label: 'Authentication Failures', value: '45', trend: '-8%', color: 'text-yellow-600' },
    { label: 'Rate Limit Hits', value: '678', trend: '+23%', color: 'text-orange-600' },
    { label: 'Security Score', value: '94/100', trend: '+2%', color: 'text-green-600' }
  ];

  const recentSecurityEvents = [
    {
      id: '1',
      type: 'blocked_request',
      message: 'Suspicious request pattern detected from IP 192.168.1.100',
      timestamp: '2024-06-15 10:30:00',
      severity: 'high'
    },
    {
      id: '2',
      type: 'rate_limit',
      message: 'Rate limit exceeded for API key sk_live_****',
      timestamp: '2024-06-15 10:25:00',
      severity: 'medium'
    },
    {
      id: '3',
      type: 'auth_failure',
      message: 'Invalid API key used in request',
      timestamp: '2024-06-15 10:20:00',
      severity: 'low'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={metric.color}>{metric.trend}</span> from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{feature.name}</h4>
                    <Badge variant={feature.enabled ? "default" : "secondary"}>
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{feature.value}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={feature.enabled} />
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSecurityEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {event.severity === 'high' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : event.severity === 'medium' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="text-xs text-gray-500">{event.timestamp}</p>
                </div>
                <Badge className={getSeverityColor(event.severity)}>
                  {event.severity}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Security Events
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Key Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total API Keys</span>
                <Badge>24</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Keys</span>
                <Badge variant="default">21</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Expired Keys</span>
                <Badge variant="destructive">3</Badge>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Manage API Keys
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Allowed Origins</span>
                <Badge>8</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">IP Whitelist</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Geographic Restrictions</span>
                <Badge variant="secondary">None</Badge>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Configure Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
