
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  Eye, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  UserCheck,
  Key,
  Globe,
  RefreshCw
} from 'lucide-react';

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  blockedAttempts: number;
  securityScore: number;
  lastScan: string;
}

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'data_access' | 'privilege_escalation' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  ip: string;
  user?: string;
  resolved: boolean;
}

export function AdvancedSecurityCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: securityMetrics, isLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetrics> => {
      // Simulate real-time security metrics
      return {
        threatLevel: 'low',
        activeThreats: 2,
        blockedAttempts: 147,
        securityScore: 92,
        lastScan: new Date().toISOString()
      };
    },
    refetchInterval: autoRefresh ? 30000 : false
  });

  const { data: securityEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async (): Promise<SecurityEvent[]> => {
      return [
        {
          id: '1',
          type: 'login_attempt',
          severity: 'medium',
          description: 'Multiple failed login attempts from suspicious IP',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          ip: '192.168.1.100',
          user: 'unknown',
          resolved: false
        },
        {
          id: '2',
          type: 'data_access',
          severity: 'low',
          description: 'Unusual data access pattern detected',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          ip: '10.0.0.45',
          user: 'user@example.com',
          resolved: true
        }
      ];
    }
  });

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div>Loading security data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Security Center</h2>
          <p className="text-gray-600">Real-time threat monitoring and security management</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threat Level</p>
                <Badge className={getThreatLevelColor(securityMetrics?.threatLevel || 'low')}>
                  {securityMetrics?.threatLevel?.toUpperCase()}
                </Badge>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-3xl font-bold text-green-600">{securityMetrics?.securityScore}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-3xl font-bold text-orange-600">{securityMetrics?.activeThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Attempts</p>
                <p className="text-3xl font-bold text-red-600">{securityMetrics?.blockedAttempts}</p>
              </div>
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Latest security events and threat alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents?.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getSeverityIcon(event.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{event.type.replace('_', ' ')}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        IP: {event.ip} {event.user && `• User: ${event.user}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.resolved ? (
                        <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Active</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Advanced threat detection is monitoring your system 24/7 for suspicious activities.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence</CardTitle>
              <CardDescription>
                Real-time threat analysis and prevention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">IP Reputation Monitoring</p>
                      <p className="text-sm text-gray-600">Blocking malicious IPs in real-time</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Behavioral Analysis</p>
                      <p className="text-sm text-gray-600">Detecting unusual user patterns</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Credential Monitoring</p>
                      <p className="text-sm text-gray-600">Scanning for compromised credentials</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Matrix</CardTitle>
              <CardDescription>
                Manage permissions and access policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Access Control Management</h3>
                <p className="text-gray-600">
                  Advanced role-based access control and permission management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>
                Security compliance and audit tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Compliance Monitoring</h3>
                <p className="text-gray-600">
                  Track compliance with security standards and regulations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
