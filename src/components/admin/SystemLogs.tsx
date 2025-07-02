
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Search, Filter, Download, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export function SystemLogs() {
  const logs = [
    { 
      id: 1, 
      timestamp: '2024-01-15 11:30:22', 
      level: 'error', 
      service: 'Authentication', 
      message: 'Failed login attempt from IP 192.168.1.100',
      user: 'john@example.com'
    },
    { 
      id: 2, 
      timestamp: '2024-01-15 11:28:15', 
      level: 'info', 
      service: 'Message Queue', 
      message: 'SMS batch processed successfully - 245 messages sent',
      user: 'system'
    },
    { 
      id: 3, 
      timestamp: '2024-01-15 11:25:33', 
      level: 'warning', 
      service: 'Database', 
      message: 'Slow query detected - execution time: 5.2s',
      user: 'system'
    },
    { 
      id: 4, 
      timestamp: '2024-01-15 11:22:11', 
      level: 'info', 
      service: 'User Management', 
      message: 'New user registration completed',
      user: 'jane@example.com'
    },
    { 
      id: 5, 
      timestamp: '2024-01-15 11:20:45', 
      level: 'error', 
      service: 'Email Service', 
      message: 'SMTP connection timeout - retrying in 30s',
      user: 'system'
    },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const logStats = {
    total: 15432,
    errors: 234,
    warnings: 1087,
    info: 14111
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 bg-clip-text text-transparent">
          System Logs
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Monitor system events, errors, and application logs across all services.
        </p>
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Logs</p>
                <p className="text-3xl font-bold text-gray-900">{logStats.total.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Last 24 hours</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Errors</p>
                <p className="text-3xl font-bold text-red-600">{logStats.errors}</p>
                <p className="text-sm text-red-500">Requires attention</p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Warnings</p>
                <p className="text-3xl font-bold text-yellow-600">{logStats.warnings.toLocaleString()}</p>
                <p className="text-sm text-yellow-500">Monitor closely</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Info Logs</p>
                <p className="text-3xl font-bold text-blue-600">{logStats.info.toLocaleString()}</p>
                <p className="text-sm text-blue-500">Normal activity</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Viewer */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                System Log Viewer
              </CardTitle>
              <CardDescription>
                Real-time system logs and event monitoring
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search logs..." className="pl-10 w-64" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <Badge className={getLevelColor(log.level)}>
                        {log.level}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.service}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{log.message}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{log.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              Show Errors Only
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
              Show Warnings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Show Info Logs
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Service Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Authentication Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Message Queue
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Database Service
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Log Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-2" />
              Export All Logs
            </Button>
            <Button variant="outline" className="w-full">
              Clear Old Logs
            </Button>
            <Button variant="outline" className="w-full">
              Configure Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
