
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

interface ExecutionLog {
  id: string;
  workflowName: string;
  ruleName?: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  trigger: string;
  actions: number;
  errorMessage?: string;
  affectedUsers: number;
}

export function WorkflowExecutor() {
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([
    {
      id: '1',
      workflowName: 'New User Onboarding',
      status: 'success',
      startedAt: new Date('2024-06-15T10:30:00'),
      completedAt: new Date('2024-06-15T10:32:15'),
      duration: 135000, // milliseconds
      trigger: 'user_registration',
      actions: 4,
      affectedUsers: 1
    },
    {
      id: '2',
      ruleName: 'Auto-activate SMS for new users',
      workflowName: 'SMS Service Activation',
      status: 'success',
      startedAt: new Date('2024-06-15T09:45:00'),
      completedAt: new Date('2024-06-15T09:45:30'),
      duration: 30000,
      trigger: 'user_created',
      actions: 2,
      affectedUsers: 1
    },
    {
      id: '3',
      ruleName: 'Low credits alert',
      workflowName: 'Credit Monitoring',
      status: 'failed',
      startedAt: new Date('2024-06-15T08:20:00'),
      completedAt: new Date('2024-06-15T08:20:45'),
      duration: 45000,
      trigger: 'credits_changed',
      actions: 2,
      affectedUsers: 3,
      errorMessage: 'Failed to send notification email'
    },
    {
      id: '4',
      workflowName: 'Service Health Check',
      status: 'running',
      startedAt: new Date('2024-06-15T11:00:00'),
      trigger: 'scheduled',
      actions: 5,
      affectedUsers: 0
    },
    {
      id: '5',
      workflowName: 'Bulk Service Update',
      status: 'pending',
      startedAt: new Date('2024-06-15T11:30:00'),
      trigger: 'manual',
      actions: 3,
      affectedUsers: 25
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  const filteredLogs = executionLogs.filter(log => {
    const matchesSearch = log.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.ruleName && log.ruleName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Execution Log</h3>
          <p className="text-gray-600">Monitor and track workflow executions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(log.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{log.workflowName}</h4>
                      {log.ruleName && (
                        <Badge variant="outline" className="text-xs">
                          {log.ruleName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Trigger: {log.trigger}</span>
                      <span>•</span>
                      <span>{log.actions} actions</span>
                      <span>•</span>
                      <span>{log.affectedUsers} users affected</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  <div className="text-right text-sm">
                    <div className="text-gray-600">
                      {log.startedAt.toLocaleString()}
                    </div>
                    {log.duration && (
                      <div className="text-gray-500">
                        Duration: {formatDuration(log.duration)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {log.errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{log.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No execution logs found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Workflow executions will appear here once they start running'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
