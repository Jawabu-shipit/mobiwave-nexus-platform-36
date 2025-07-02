
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Eye,
  Clock,
  TrendingUp,
  Server,
  Lock
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login_failure' | 'suspicious_activity' | 'data_access' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_email?: string;
  ip_address: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
}

export function SecurityMonitoring() {
  const [events] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login_failure',
      severity: 'medium',
      description: 'Multiple failed login attempts detected',
      user_email: 'user@example.com',
      ip_address: '192.168.1.100',
      timestamp: '2024-06-15 10:30:00',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'suspicious_activity',
      severity: 'high',
      description: 'Unusual data access pattern detected',
      user_email: 'admin@example.com',
      ip_address: '203.0.113.1',
      timestamp: '2024-06-15 09:15:00',
      status: 'open'
    },
    {
      id: '3',
      type: 'data_access',
      severity: 'low',
      description: 'Bulk data download outside business hours',
      user_email: 'user2@example.com',
      ip_address: '192.168.1.200',
      timestamp: '2024-06-15 02:45:00',
      status: 'resolved'
    }
  ]);

  const securityMetrics = {
    threat_level: 'medium',
    security_score: 85,
    active_incidents: events.filter(e => e.status !== 'resolved').length,
    failed_logins_24h: 23,
    data_breaches: 0,
    compliance_score: 92
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Security Monitoring
          </h3>
          <p className="text-gray-600">Real-time security event monitoring and analysis</p>
        </div>
        <Button>
          <Eye className="w-4 h-4 mr-2" />
          View Live Feed
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Threat Level</p>
                <p className={`text-2xl font-bold capitalize ${getThreatLevelColor(securityMetrics.threat_level)}`}>
                  {securityMetrics.threat_level}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${getThreatLevelColor(securityMetrics.threat_level)}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Score</p>
                <p className="text-2xl font-bold">{securityMetrics.security_score}%</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={securityMetrics.security_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Incidents</p>
                <p className="text-2xl font-bold">{securityMetrics.active_incidents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Logins (24h)</p>
                <p className="text-2xl font-bold">{securityMetrics.failed_logins_24h}</p>
              </div>
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">{event.type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <p className="font-medium">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    {event.user_email && (
                      <span>User: {event.user_email}</span>
                    )}
                    <span>IP: {event.ip_address}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.timestamp}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Investigate
                  </Button>
                  {event.status === 'open' && (
                    <Button size="sm">
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Database Security</span>
                <Badge className="bg-green-100 text-green-800">Normal</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Network Security</span>
                <Badge className="bg-green-100 text-green-800">Normal</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Application Security</span>
                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Infrastructure</span>
                <Badge className="bg-green-100 text-green-800">Normal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Server className="w-6 h-6 mb-2" />
                <span className="text-sm">System Scan</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Lock className="w-6 h-6 mb-2" />
                <span className="text-sm">Lock Accounts</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="text-sm">Generate Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <AlertTriangle className="w-6 h-6 mb-2" />
                <span className="text-sm">Incident Response</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
