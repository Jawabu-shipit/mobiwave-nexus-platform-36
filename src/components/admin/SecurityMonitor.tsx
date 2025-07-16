import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SecurityEvent {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export function SecurityMonitor() {
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const { data: securityEvents, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .in('action', ['login_failed', 'suspicious_activity', 'unauthorized_access', 'password_reset'])
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.warn('Error fetching security events:', error);
          return [];
        }
        return data as SecurityEvent[];
      } catch (error) {
        console.error('Failed to fetch security events:', error);
        return [];
      }
    },
    refetchInterval: refreshInterval
  });

  const getSecurityMetrics = () => {
    if (!securityEvents) return { high: 0, medium: 0, low: 0, total: 0 };

    const high = securityEvents.filter(event => 
      event.action.includes('unauthorized') || event.action.includes('suspicious')
    ).length;
    
    const medium = securityEvents.filter(event =>
      event.action.includes('login_failed')
    ).length;
    
    const low = securityEvents.filter(event =>
      event.action.includes('password_reset')
    ).length;

    return { high, medium, low, total: securityEvents.length };
  };

  const getEventSeverity = (action: string) => {
    if (action.includes('unauthorized') || action.includes('suspicious')) return 'high';
    if (action.includes('login_failed')) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const metrics = getSecurityMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Monitor
        </h3>
        <div className="flex gap-2">
          <Button
            variant={refreshInterval === 10000 ? "default" : "outline"}
            size="sm"
            onClick={() => setRefreshInterval(10000)}
          >
            10s
          </Button>
          <Button
            variant={refreshInterval === 30000 ? "default" : "outline"}
            size="sm"
            onClick={() => setRefreshInterval(30000)}
          >
            30s
          </Button>
          <Button
            variant={refreshInterval === 60000 ? "default" : "outline"}
            size="sm"
            onClick={() => setRefreshInterval(60000)}
          >
            1m
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.medium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.low}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
      </div>

      {metrics.high > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {metrics.high} high-risk security events detected. Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : securityEvents && securityEvents.length > 0 ? (
              securityEvents.map((event) => {
                const severity = getEventSeverity(event.action);
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getSeverityIcon(severity)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(severity)}>
                          {event.action}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(event.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        User: {event.user_id} • IP: {event.ip_address || 'Unknown'}
                      </p>
                      {event.resource_type && (
                        <p className="text-xs text-gray-500">
                          Resource: {event.resource_type} ({event.resource_id})
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No security events found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
