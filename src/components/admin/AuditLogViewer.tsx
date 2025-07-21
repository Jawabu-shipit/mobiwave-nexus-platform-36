
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download } from 'lucide-react';

interface AuditLog {
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

export function AuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', searchTerm, actionFilter, resourceFilter],
    queryFn: async () => {
      try {
        // Check if audit_logs table exists, fallback to activity_logs
        let { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error && error.message.includes('does not exist')) {
          // Fallback to activity_logs table
          const { data: activityData, error: activityError } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (activityError) {
            console.warn('Error fetching activity logs:', activityError);
            return [];
          }

          // Map activity_logs to audit log format
          return (activityData || []).map(log => ({
            id: log.id,
            user_id: log.user_id || '',
            action: log.action,
            resource_type: 'activity',
            resource_id: '',
            metadata: {},
            ip_address: '',
            user_agent: '',
            created_at: log.created_at || ''
          })) as AuditLog[];
        }

        if (error) {
          console.warn('Error fetching audit logs:', error);
          return [];
        }

        return (data || []) as AuditLog[];
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return [];
      }
    }
  });

  const getSeverityColor = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) return 'destructive';
    if (action.includes('create') || action.includes('add')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    return 'outline';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = () => {
    if (!auditLogs) return;
    
    const csvContent = [
      'Timestamp,User ID,Action,Resource Type,Resource ID,IP Address',
      ...auditLogs.map(log => 
        `${formatTimestamp(log.created_at)},${log.user_id},${log.action},${log.resource_type || ''},${log.resource_id || ''},${log.ip_address || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Audit Logs</h3>
        <Button onClick={exportLogs} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="campaign">Campaign</SelectItem>
            <SelectItem value="contact">Contact</SelectItem>
            <SelectItem value="message">Message</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : auditLogs && auditLogs.length > 0 ? (
              <div className="divide-y">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(log.action)}>
                            {log.action}
                          </Badge>
                          <Badge variant="outline">
                            {log.resource_type || 'system'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(log.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          User: {log.user_id} • IP: {log.ip_address || 'Unknown'}
                        </p>
                        {log.resource_id && (
                          <p className="text-xs text-gray-500">
                            Resource ID: {log.resource_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No audit logs found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
