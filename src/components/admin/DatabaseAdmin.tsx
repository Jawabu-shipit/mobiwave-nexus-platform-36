
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, HardDrive, Activity, Zap, RefreshCw, Download } from 'lucide-react';

export function DatabaseAdmin() {
  const tables = [
    { name: 'users', rows: 1247, size: '45.2 MB', lastUpdated: '2024-01-15 10:30' },
    { name: 'campaigns', rows: 892, size: '23.8 MB', lastUpdated: '2024-01-15 09:45' },
    { name: 'messages', rows: 15432, size: '156.7 MB', lastUpdated: '2024-01-15 11:20' },
    { name: 'audit_logs', rows: 8901, size: '67.3 MB', lastUpdated: '2024-01-15 11:15' },
  ];

  const backups = [
    { id: 1, name: 'daily_backup_2024_01_15', size: '2.3 GB', created: '2024-01-15 02:00', status: 'completed' },
    { id: 2, name: 'daily_backup_2024_01_14', size: '2.2 GB', created: '2024-01-14 02:00', status: 'completed' },
    { id: 3, name: 'weekly_backup_2024_01_08', size: '2.1 GB', created: '2024-01-08 02:00', status: 'completed' },
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-green-900 via-green-800 to-green-700 bg-clip-text text-transparent">
          Database Administration
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Monitor database performance, manage tables, and handle backup operations.
        </p>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Size</p>
                <p className="text-3xl font-bold text-gray-900">2.8 GB</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <HardDrive className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Connections</p>
                <p className="text-3xl font-bold text-gray-900">23/100</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Queries/sec</p>
                <p className="text-3xl font-bold text-gray-900">1.2K</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Uptime</p>
                <p className="text-3xl font-bold text-gray-900">99.9%</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tables Overview */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-600" />
              Database Tables
            </CardTitle>
            <CardDescription>
              Overview of all database tables and their statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{table.rows.toLocaleString()}</TableCell>
                    <TableCell>{table.size}</TableCell>
                    <TableCell className="text-sm text-gray-500">{table.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Backup Management */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  Backup Management
                </CardTitle>
                <CardDescription>
                  Database backup history and operations
                </CardDescription>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Backup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium">{backup.name}</p>
                    <p className="text-sm text-gray-500">{backup.size} • {backup.created}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      {backup.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Operations */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Database Operations
          </CardTitle>
          <CardDescription>
            Maintenance and optimization tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-6 h-auto flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-blue-600" />
              <span className="font-medium">Optimize Tables</span>
              <span className="text-sm text-gray-500">Analyze and optimize table performance</span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex flex-col items-center gap-2">
              <Activity className="w-8 h-8 text-green-600" />
              <span className="font-medium">Analyze Queries</span>
              <span className="text-sm text-gray-500">Review slow query performance</span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex flex-col items-center gap-2">
              <HardDrive className="w-8 h-8 text-orange-600" />
              <span className="font-medium">Clean Logs</span>
              <span className="text-sm text-gray-500">Remove old audit and system logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
