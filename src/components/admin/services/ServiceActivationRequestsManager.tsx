
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { useServiceActivationRequests } from '@/hooks/useServiceActivationRequests';

export function ServiceActivationRequestsManager() {
  const { allRequests, approveRequest, rejectRequest, isProcessing } = useServiceActivationRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const pendingRequests = allRequests.filter(req => req.status === 'pending');
  const processedRequests = allRequests.filter(req => req.status !== 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest({ requestId, adminNotes });
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!adminNotes.trim()) return;
    
    try {
      await rejectRequest({ requestId, adminNotes });
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {allRequests.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {allRequests.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Service Activation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.user?.first_name} {request.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{request.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.service?.service_name}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {request.service?.service_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setAdminNotes('');
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Service Activation Request</DialogTitle>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Requested Service</label>
                                    <p className="text-sm text-gray-600">
                                      {selectedRequest.service?.service_name} ({selectedRequest.service?.service_type})
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <Badge className={`ml-2 text-xs ${getPriorityColor(selectedRequest.priority)}`}>
                                      {selectedRequest.priority}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Business Justification</label>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                    {selectedRequest.business_justification}
                                  </p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Expected Usage</label>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                    {selectedRequest.expected_usage}
                                  </p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Admin Notes</label>
                                  <Textarea
                                    placeholder="Add notes about your decision..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve & Activate
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    disabled={isProcessing || !adminNotes.trim()}
                                    variant="destructive"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Processed Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.slice(0, 10).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.user?.first_name} {request.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{request.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.service?.service_name}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {request.service?.service_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.processed_at ? 
                        new Date(request.processed_at).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {request.admin_notes ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Admin Notes</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm">{request.admin_notes}</p>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
