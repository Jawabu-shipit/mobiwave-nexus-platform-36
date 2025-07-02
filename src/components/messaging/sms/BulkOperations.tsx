
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Send, Pause, Play, Square, AlertCircle, CheckCircle, Clock, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface BulkOperation {
  id: string;
  type: 'import' | 'export' | 'send' | 'delete';
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export function BulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([
    {
      id: '1',
      type: 'send',
      name: 'New Year Promotion Campaign',
      status: 'completed',
      progress: 100,
      totalItems: 1500,
      processedItems: 1500,
      successCount: 1485,
      failureCount: 15,
      startedAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-15T10:15:00Z'
    },
    {
      id: '2',
      type: 'import',
      name: 'Customer Database Import',
      status: 'running',
      progress: 65,
      totalItems: 5000,
      processedItems: 3250,
      successCount: 3200,
      failureCount: 50,
      startedAt: '2024-01-16T09:30:00Z'
    }
  ]);

  const [newBulkSend, setNewBulkSend] = useState({
    name: '',
    message: '',
    recipientFile: null as File | null,
    template: '',
    scheduleType: 'immediate' as 'immediate' | 'scheduled',
    scheduledDate: '',
    scheduledTime: '',
    rateLimitPerMinute: 100
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, operationType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const operation: BulkOperation = {
      id: `operation-${Date.now()}`,
      type: operationType as any,
      name: `${operationType.charAt(0).toUpperCase() + operationType.slice(1)} - ${file.name}`,
      status: 'pending',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      successCount: 0,
      failureCount: 0
    };

    setOperations(prev => [...prev, operation]);
    
    // Simulate processing
    setTimeout(() => {
      setOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'running' as const, startedAt: new Date().toISOString(), totalItems: 1000 }
          : op
      ));

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setOperations(prev => prev.map(op => 
            op.id === operation.id 
              ? { 
                  ...op, 
                  status: 'completed' as const, 
                  progress: 100,
                  processedItems: 1000,
                  successCount: 985,
                  failureCount: 15,
                  completedAt: new Date().toISOString()
                }
              : op
          ));
          toast.success(`${operationType} completed successfully`);
        } else {
          setOperations(prev => prev.map(op => 
            op.id === operation.id 
              ? { 
                  ...op, 
                  progress: Math.round(progress),
                  processedItems: Math.round((progress / 100) * 1000),
                  successCount: Math.round((progress / 100) * 985)
                }
              : op
          ));
        }
      }, 500);
    }, 1000);

    toast.success(`${operationType} started`);
  };

  const startBulkSend = () => {
    if (!newBulkSend.name || !newBulkSend.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const operation: BulkOperation = {
      id: `bulk-send-${Date.now()}`,
      type: 'send',
      name: newBulkSend.name,
      status: 'running',
      progress: 0,
      totalItems: 2500, // Simulated
      processedItems: 0,
      successCount: 0,
      failureCount: 0,
      startedAt: new Date().toISOString()
    };

    setOperations(prev => [...prev, operation]);
    
    // Simulate bulk sending
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { 
                ...op, 
                status: 'completed' as const, 
                progress: 100,
                processedItems: 2500,
                successCount: 2450,
                failureCount: 50,
                completedAt: new Date().toISOString()
              }
            : op
        ));
        toast.success('Bulk SMS campaign completed');
      } else {
        setOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { 
                ...op, 
                progress: Math.round(progress),
                processedItems: Math.round((progress / 100) * 2500),
                successCount: Math.round((progress / 100) * 2450)
              }
            : op
        ));
      }
    }, 1000);

    setNewBulkSend({
      name: '',
      message: '',
      recipientFile: null,
      template: '',
      scheduleType: 'immediate',
      scheduledDate: '',
      scheduledTime: '',
      rateLimitPerMinute: 100
    });

    toast.success('Bulk SMS campaign started');
  };

  const pauseOperation = (id: string) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, status: 'paused' as const } : op
    ));
    toast.success('Operation paused');
  };

  const resumeOperation = (id: string) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, status: 'running' as const } : op
    ));
    toast.success('Operation resumed');
  };

  const cancelOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
    toast.success('Operation cancelled');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
          <p className="text-gray-600">Manage large-scale SMS operations and data imports/exports</p>
        </div>
      </div>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList>
          <TabsTrigger value="operations">Active Operations</TabsTrigger>
          <TabsTrigger value="bulk-send">Bulk SMS Send</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operation Queue</CardTitle>
              <CardDescription>
                Monitor and manage your bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {operations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operation</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operations.map(operation => (
                      <TableRow key={operation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{operation.name}</div>
                            {operation.startedAt && (
                              <div className="text-sm text-gray-500">
                                Started: {new Date(operation.startedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(operation.status)}
                            {getStatusBadge(operation.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <Progress value={operation.progress} className="mb-1" />
                            <div className="text-xs text-gray-500">{operation.progress}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{operation.processedItems}/{operation.totalItems}</div>
                            {operation.totalItems > 0 && (
                              <div className="text-xs text-gray-500">
                                {Math.round((operation.processedItems / operation.totalItems) * 100)}% complete
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {operation.processedItems > 0 && (
                            <div className="text-sm">
                              <div className="text-green-600">
                                ✓ {operation.successCount}
                              </div>
                              {operation.failureCount > 0 && (
                                <div className="text-red-600">
                                  ✗ {operation.failureCount}
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {operation.status === 'running' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => pauseOperation(operation.id)}
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            )}
                            {operation.status === 'paused' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resumeOperation(operation.id)}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {['running', 'paused', 'pending'].includes(operation.status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelOperation(operation.id)}
                              >
                                <Square className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No operations running</p>
                  <p className="text-sm text-gray-400">Start a bulk operation to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk SMS Campaign</CardTitle>
              <CardDescription>
                Send SMS messages to large recipient lists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    value={newBulkSend.name}
                    onChange={(e) => setNewBulkSend(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Use Template</Label>
                  <Select 
                    value={newBulkSend.template} 
                    onValueChange={(value) => setNewBulkSend(prev => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Message</SelectItem>
                      <SelectItem value="promo">Promotional Offer</SelectItem>
                      <SelectItem value="reminder">Appointment Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bulkMessage">Message Content *</Label>
                <Textarea
                  id="bulkMessage"
                  value={newBulkSend.message}
                  onChange={(e) => setNewBulkSend(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your bulk SMS message..."
                  className="min-h-[120px]"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {newBulkSend.message.length}/160 characters
                </div>
              </div>

              <div>
                <Label htmlFor="recipientFile">Recipient List</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload CSV file with recipient phone numbers
                  </p>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setNewBulkSend(prev => ({ ...prev, recipientFile: file || null }));
                    }}
                    className="max-w-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduleType">Delivery</Label>
                  <Select 
                    value={newBulkSend.scheduleType} 
                    onValueChange={(value: 'immediate' | 'scheduled') => 
                      setNewBulkSend(prev => ({ ...prev, scheduleType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
                  <Select 
                    value={newBulkSend.rateLimitPerMinute.toString()} 
                    onValueChange={(value) => 
                      setNewBulkSend(prev => ({ ...prev, rateLimitPerMinute: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 per minute</SelectItem>
                      <SelectItem value="100">100 per minute</SelectItem>
                      <SelectItem value="200">200 per minute</SelectItem>
                      <SelectItem value="500">500 per minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newBulkSend.scheduleType === 'scheduled' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduleDate">Schedule Date</Label>
                    <Input
                      type="date"
                      id="scheduleDate"
                      value={newBulkSend.scheduledDate}
                      onChange={(e) => setNewBulkSend(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduleTime">Schedule Time</Label>
                    <Input
                      type="time"
                      id="scheduleTime"
                      value={newBulkSend.scheduledTime}
                      onChange={(e) => setNewBulkSend(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <Button onClick={startBulkSend} className="w-full" size="lg">
                <Send className="w-4 h-4 mr-2" />
                {newBulkSend.scheduleType === 'immediate' ? 'Start Bulk Send' : 'Schedule Bulk Send'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Import Data
                </CardTitle>
                <CardDescription>
                  Import contacts, campaigns, or other data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your CSV or Excel file here
                  </p>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'import')}
                    className="max-w-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Import Template
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Use our template for best results
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-600" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Export your data for backup or analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={(e) => {
                      const fakeEvent = {
                        target: { files: [new File([''], 'contacts.csv')] }
                      } as any;
                      handleFileUpload(fakeEvent, 'export');
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export All Contacts
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={(e) => {
                      const fakeEvent = {
                        target: { files: [new File([''], 'campaigns.csv')] }
                      } as any;
                      handleFileUpload(fakeEvent, 'export');
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Campaign Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={(e) => {
                      const fakeEvent = {
                        target: { files: [new File([''], 'messages.csv')] }
                      } as any;
                      handleFileUpload(fakeEvent, 'export');
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Message History
                  </Button>
                </div>
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                  <p className="font-medium mb-1">Export includes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All selected data in CSV format</li>
                    <li>Delivery status and timestamps</li>
                    <li>Cost and analytics data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
