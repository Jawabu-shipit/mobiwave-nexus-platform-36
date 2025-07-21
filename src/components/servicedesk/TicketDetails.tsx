import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, User, MessageSquare, AlertCircle } from 'lucide-react';
import { useServiceDesk } from '@/hooks/useServiceDesk';
import { useTicketActivities } from '@/hooks/useServiceDesk';

interface TicketDetailsProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetails({ ticketId, onBack }: TicketDetailsProps) {
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const { tickets, updateTicket } = useServiceDesk();
  const { activities, addActivity } = useTicketActivities(ticketId);

  const ticket = tickets.find(t => t.id === ticketId);

  const handleStatusChange = async (status: string) => {
    if (!ticket) return;
    
    try {
      await updateTicket({ id: ticketId, status: status as any });
      await addActivity({
        ticket_id: ticketId,
        user_id: '', // This will be set by the hook
        activity_type: 'status_change',
        content: `Status changed to ${status}`,
        metadata: { old_status: ticket.status, new_status: status }
      });
      setNewStatus('');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await addActivity({
        ticket_id: ticketId,
        user_id: '', // This will be set by the hook
        activity_type: 'comment',
        content: comment,
        metadata: {}
      });
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (!ticket) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Ticket not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{ticket.title}</h2>
          <p className="text-gray-600">{ticket.ticket_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700">{ticket.description}</p>
              </div>

              {ticket.customer_phone && (
                <div>
                  <h4 className="font-medium mb-2">Customer Contact</h4>
                  <p className="text-gray-700">Phone: {ticket.customer_phone}</p>
                  {ticket.customer_email && (
                    <p className="text-gray-700">Email: {ticket.customer_email}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Ticket updates and communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activities yet</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        {activity.activity_type === 'comment' ? (
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">System</span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{activity.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Add Comment</h4>
                <div className="space-y-3">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment or update..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={!comment.trim()}>
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priority</span>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>

              <div className="pt-4">
                <label className="text-sm font-medium mb-2 block">Update Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {newStatus && (
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => handleStatusChange(newStatus)}
                  >
                    Update Status
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>Customer Support</span>
              </div>

              {ticket.sla_due_at && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>SLA Due: {new Date(ticket.sla_due_at).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
