
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Settings, Shield } from 'lucide-react';

interface ServiceActivity {
  id: string;
  action: string;
  created_at: string;
  table_name?: string;
  user_id?: string;
  metadata?: any;
  severity?: string;
  status?: string;
}

export function ServiceActivityLog() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['service-activity'],
    queryFn: async () => {
      try {
        // Try to fetch from system_audit_logs first
        const { data, error } = await supabase
          .from('system_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.warn('Error fetching from system_audit_logs:', error);
          
          // Fallback to audit_logs
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

          if (fallbackError) {
            console.error('Error fetching from audit_logs:', fallbackError);
            return [];
          }

          return (fallbackData || []).map(log => ({
            id: log.id,
            action: log.action,
            created_at: log.created_at,
            table_name: log.resource_type,
            user_id: log.user_id,
            metadata: log.metadata,
            severity: log.severity,
            status: log.status
          })) as ServiceActivity[];
        }

        return (data || []).map(log => ({
          id: log.id,
          action: log.action,
          created_at: log.created_at,
          table_name: log.table_name,
          user_id: log.user_id,
          metadata: log.metadata,
          severity: log.severity,
          status: log.status
        })) as ServiceActivity[];
      } catch (error) {
        console.error('Failed to fetch service activity:', error);
        return [];
      }
    }
  });

  const getActivityIcon = (action: string) => {
    if (action.includes('user') || action.includes('login')) return <User className="w-4 h-4" />;
    if (action.includes('security')) return <Shield className="w-4 h-4" />;
    if (action.includes('config') || action.includes('setting')) return <Settings className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Service Activity Log
        </h3>
        <p className="text-sm text-gray-600">Recent system and user activities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
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
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getActivityIcon(activity.action)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.action}</span>
                      {activity.severity && (
                        <Badge variant={getSeverityColor(activity.severity)}>
                          {activity.severity}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(activity.created_at)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.table_name && (
                        <span>Table: {activity.table_name} • </span>
                      )}
                      User: {activity.user_id || 'System'}
                    </div>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activities found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
