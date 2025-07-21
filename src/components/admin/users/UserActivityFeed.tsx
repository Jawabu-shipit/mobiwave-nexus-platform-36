
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  session_id: string;
  status: string;
  severity: string;
  user_agent: string;
  created_at: string;
  metadata: any;
}

const fetchUserActivity = async (): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  
  return (data || []).map(item => ({
    ...item,
    ip_address: item.ip_address?.toString() || 'Unknown'
  }));
};

export function UserActivityFeed() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['user-activity'],
    queryFn: fetchUserActivity
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent User Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                {getSeverityIcon(activity.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.action}
                  </p>
                  <Badge variant="outline" className={getSeverityColor(activity.severity)}>
                    {activity.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {activity.resource_type} • {activity.status}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
              <p className="text-gray-600">
                User activity will appear here as actions are performed.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
