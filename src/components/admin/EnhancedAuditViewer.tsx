
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: any;
}

export function EnhancedAuditViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['enhanced-audit-logs', searchTerm, actionFilter, tableFilter],
    queryFn: async () => {
      try {
        let query = supabase
          .from('system_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (actionFilter !== 'all') {
          query = query.ilike('action', `%${actionFilter}%`);
        }

        if (tableFilter !== 'all') {
          query = query.eq('table_name', tableFilter);
        }

        if (searchTerm) {
          query = query.or(`action.ilike.%${searchTerm}%,table_name.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching audit logs:', error);
          return [];
        }

        // Transform the data to match our interface
        return (data || []).map(log => ({
          id: log.id,
          user_id: log.user_id || undefined,
          action: log.action,
          table_name: log.table_name || undefined,
          record_id: log.record_id || undefined,
          old_data: log.old_data || undefined,
          new_data: log.new_data || undefined,
          ip_address: log.ip_address?.toString() || undefined,
          user_agent: log.user_agent || undefined,
          created_at: log.created_at,
          metadata: log.metadata || undefined
        })) as AuditLog[];
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return [];
      }
    }
  });

  const getActionSeverity = (action: string) => {
    if (action.includes('delete') || action.includes('security')) return 'destructive';
    if (action.includes('create') || action.includes('login')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    return 'outline';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = () => {
    if (!auditLogs || auditLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }
    
    const csvContent = [
      'Timestamp,User ID,Action,Table,Record ID,IP Address',
      ...auditLogs.map(log => 
        `${formatTimestamp(log.created_at)},${log.user_id || ''},${log.action},${log.table_name || ''},${log.record_id || ''},${log.ip_address || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Audit logs exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enhanced Audit Trail</h3>
          <p className="text-sm text-gray-600">Comprehensive system activity monitoring</p>
        </div>
        <Button onClick={exportLogs} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search audit logs..."
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
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            <SelectItem value="profiles">Profiles</SelectItem>
            <SelectItem value="campaigns">Campaigns</SelectItem>
            <SelectItem value="contacts">Contacts</SelectItem>
            <SelectItem value="user_credits">Credits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            System Audit Trail
          </CardTitle>
        </CardHeader>
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
                  <div key={log.id} className="p-4 hover:bg-gray-50 cursor-pointer" 
                       onClick={() => setSelectedLog(log)}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionSeverity(log.action)}>
                            {log.action}
                          </Badge>
                          {log.table_name && (
                            <Badge variant="outline">
                              {log.table_name}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(log.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          User: {log.user_id || 'System'} • IP: {log.ip_address || 'Unknown'}
                        </p>
                        {log.record_id && (
                          <p className="text-xs text-gray-500">
                            Record ID: {log.record_id}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
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

      {selectedLog && (
        <Card>
          <CardHeader>
            <CardTitle>Log Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <p className="text-sm text-gray-600">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Table</label>
                  <p className="text-sm text-gray-600">{selectedLog.table_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-sm text-gray-600">{selectedLog.user_id || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="text-sm text-gray-600">{formatTimestamp(selectedLog.created_at)}</p>
                </div>
              </div>
              
              {selectedLog.old_data && (
                <div>
                  <label className="text-sm font-medium">Previous Data</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.new_data && (
                <div>
                  <label className="text-sm font-medium">New Data</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
