
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Database, 
  Trash2, 
  Download, 
  Search,
  Eye,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DataSubject {
  id: string;
  email: string;
  name: string;
  data_categories: string[];
  retention_status: 'active' | 'expired' | 'deleted';
  last_activity: string;
  requests: DataRequest[];
}

interface DataRequest {
  id: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  completed_at?: string;
}

export function DataPrivacyManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects] = useState<DataSubject[]>([
    {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      data_categories: ['Personal Info', 'Communications', 'Billing'],
      retention_status: 'active',
      last_activity: '2024-06-14',
      requests: [
        {
          id: '1',
          type: 'access',
          status: 'completed',
          requested_at: '2024-06-10',
          completed_at: '2024-06-12'
        }
      ]
    },
    {
      id: '2',
      email: 'user2@example.com',
      name: 'Jane Smith',
      data_categories: ['Personal Info', 'Analytics'],
      retention_status: 'expired',
      last_activity: '2024-03-15',
      requests: [
        {
          id: '2',
          type: 'deletion',
          status: 'pending',
          requested_at: '2024-06-14'
        }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRetentionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubjects = subjects.filter(
    subject =>
      subject.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Data Privacy Manager
          </h3>
          <p className="text-gray-600">Manage data subject rights and privacy requests</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Data Map
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Data Subjects</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by email or name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-sm text-gray-600">Total Data Subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {subjects.filter(s => s.retention_status === 'expired').length}
            </div>
            <p className="text-sm text-gray-600">Retention Expired</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {subjects.flatMap(s => s.requests).filter(r => r.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {subjects.flatMap(s => s.requests).filter(r => r.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-600">Completed Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Subjects List */}
      <div className="space-y-4">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <p className="text-sm text-gray-600">{subject.email}</p>
                </div>
                <Badge className={getRetentionStatusColor(subject.retention_status)}>
                  {subject.retention_status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Data Categories</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subject.data_categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Last Activity:</span>
                  <span className="ml-2 font-medium">{subject.last_activity}</span>
                </div>
                <div>
                  <span className="text-gray-500">Active Requests:</span>
                  <span className="ml-2 font-medium">
                    {subject.requests.filter(r => r.status !== 'completed').length}
                  </span>
                </div>
              </div>

              {subject.requests.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Recent Requests</Label>
                  <div className="space-y-2 mt-2">
                    {subject.requests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="text-sm capitalize">{request.type}</span>
                          <Badge variant="outline" className="text-xs">
                            {request.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {request.requested_at}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-3 h-3 mr-1" />
                  View Data
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Lock className="w-3 h-3 mr-1" />
                  Anonymize
                </Button>
                {subject.retention_status === 'expired' && (
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
