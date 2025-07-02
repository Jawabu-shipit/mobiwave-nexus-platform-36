
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateSubmission {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  quality_score?: number;
  review_notes?: string;
}

interface WebhookEvent {
  id: string;
  event_type: 'template_status' | 'message_status' | 'account_review';
  timestamp: Date;
  data: any;
  processed: boolean;
  error?: string;
}

export function WhatsAppTemplateApproval() {
  const [submissions, setSubmissions] = useState<TemplateSubmission[]>([
    {
      id: '1',
      name: 'welcome_message',
      category: 'utility',
      language: 'en',
      status: 'approved',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      quality_score: 85
    },
    {
      id: '2',
      name: 'promotional_offer',
      category: 'marketing',
      language: 'en',
      status: 'pending',
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'order_confirmation',
      category: 'utility',
      language: 'en',
      status: 'rejected',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rejectionReason: 'Template contains promotional content but is categorized as utility',
      review_notes: 'Please recategorize as marketing template and resubmit'
    }
  ]);

  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([
    {
      id: '1',
      event_type: 'template_status',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      data: { template_name: 'welcome_message', status: 'APPROVED' },
      processed: true
    },
    {
      id: '2',
      event_type: 'message_status',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      data: { message_id: 'wamid.123', status: 'delivered' },
      processed: true
    },
    {
      id: '3',
      event_type: 'account_review',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      data: { phone_number_id: '123456789', review_status: 'pending' },
      processed: false
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_review': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resubmitTemplate = (templateId: string) => {
    setSubmissions(subs =>
      subs.map(sub =>
        sub.id === templateId
          ? { ...sub, status: 'pending', submittedAt: new Date() }
          : sub
      )
    );
    toast.success('Template resubmitted for review');
  };

  const processWebhookEvent = (eventId: string) => {
    setWebhookEvents(events =>
      events.map(event =>
        event.id === eventId
          ? { ...event, processed: true }
          : event
      )
    );
    toast.success('Webhook event processed');
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'template_status': return 'bg-blue-100 text-blue-800';
      case 'message_status': return 'bg-green-100 text-green-800';
      case 'account_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Template Management & Webhooks</h2>
        <p className="text-gray-600">Monitor template approval status and webhook events</p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Template Status</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Submission Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{submission.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{submission.submittedAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {submission.quality_score ? (
                          <span className="font-medium">{submission.quality_score}/100</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {submission.status === 'rejected' && (
                            <Button size="sm" onClick={() => resubmitTemplate(submission.id)}>
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {submissions.some(s => s.status === 'rejected') && (
            <Card>
              <CardHeader>
                <CardTitle>Rejection Details</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions
                  .filter(s => s.status === 'rejected')
                  .map(submission => (
                    <Alert key={submission.id} className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{submission.name}:</strong> {submission.rejectionReason}
                        {submission.review_notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Review Notes:</strong> {submission.review_notes}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {JSON.stringify(event.data, null, 2).substring(0, 50)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.processed ? "default" : "secondary"}>
                          {event.processed ? 'Processed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!event.processed && (
                          <Button size="sm" onClick={() => processWebhookEvent(event.id)}>
                            Process
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Webhook endpoint is properly configured and receiving events.
                  <div className="mt-2 font-mono text-sm bg-gray-100 p-2 rounded">
                    https://your-app.supabase.co/functions/v1/whatsapp-webhook
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Event Subscriptions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Message Status Updates</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Template Status Changes</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Review Updates</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Health Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last Event Received</span>
                        <span>2 minutes ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate (24h)</span>
                        <span className="text-green-600">99.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed Events</span>
                        <span className="text-red-600">1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
