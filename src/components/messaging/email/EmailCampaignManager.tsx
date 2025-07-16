import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Calendar, Users, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { EmailAutomationWorkflow } from './EmailAutomationWorkflow';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'newsletter' | 'promotional' | 'transactional';
  created_at: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
  sent_at?: string;
  open_rate?: number;
  click_rate?: number;
}

export function EmailCampaignManager() {
  const [activeTab, setActiveTab] = useState('create');
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    template_id: '',
    recipients: [] as string[]
  });

  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to our platform!',
      content: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
      type: 'transactional',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Monthly Newsletter',
      subject: 'Your monthly update',
      content: '<h1>Monthly Update</h1><p>Here\'s what\'s new...</p>',
      type: 'newsletter',
      created_at: '2024-01-10'
    }
  ];

  const campaigns: EmailCampaign[] = [
    {
      id: '1',
      name: 'Welcome Series',
      subject: 'Welcome to our platform!',
      status: 'sent',
      recipients: 1250,
      sent_at: '2024-01-15',
      open_rate: 45.2,
      click_rate: 12.8
    },
    {
      id: '2',
      name: 'Product Launch',
      subject: 'Introducing our new product',
      status: 'scheduled',
      recipients: 3200,
      sent_at: '2024-01-20'
    }
  ];

  const handleCreateCampaign = () => {
    if (!campaign.name || !campaign.subject || !campaign.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Email campaign created successfully');
    setCampaign({ name: '', subject: '', content: '', template_id: '', recipients: [] });
  };

  const handleSendCampaign = (campaignId: string) => {
    toast.success('Email campaign sent successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Email Campaign Manager</h2>
        <p className="text-gray-600">Create, manage, and track email campaigns with advanced automation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Create Email Campaign
              </CardTitle>
              <CardDescription>
                Design and send targeted email campaigns to your audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    value={campaign.name}
                    onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Use Template (Optional)</Label>
                  <Select value={campaign.template_id} onValueChange={(value) => setCampaign({...campaign, template_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                  placeholder="Enter email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={campaign.content}
                  onChange={(e) => setCampaign({...campaign, content: e.target.value})}
                  placeholder="Enter email content (HTML supported)"
                  rows={10}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateCampaign}>
                  <Send className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <EmailAutomationWorkflow />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage reusable email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                View and manage all email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{camp.name}</h3>
                        <p className="text-sm text-gray-600">{camp.subject}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {camp.recipients.toLocaleString()} recipients
                          </span>
                          {camp.open_rate && (
                            <span>Open Rate: {camp.open_rate}%</span>
                          )}
                          {camp.click_rate && (
                            <span>Click Rate: {camp.click_rate}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(camp.status)}>
                          {camp.status}
                        </Badge>
                        {camp.status === 'draft' && (
                          <Button size="sm" onClick={() => handleSendCampaign(camp.id)}>
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">23.5K</p>
                  <p className="text-sm text-gray-600">Total Emails Sent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">42.1%</p>
                  <p className="text-sm text-gray-600">Average Open Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">8.7%</p>
                  <p className="text-sm text-gray-600">Average Click Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
