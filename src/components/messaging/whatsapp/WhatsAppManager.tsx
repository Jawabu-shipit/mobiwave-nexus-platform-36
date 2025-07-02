import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWhatsAppSubscriptions } from '@/hooks/useWhatsAppSubscriptions';
import { WhatsAppSubscriptionForm } from './WhatsAppSubscriptionForm';
import { WhatsAppSubscriptionCard } from './WhatsAppSubscriptionCard';
import { WhatsAppTemplateManager } from './WhatsAppTemplateManager';
import { WhatsAppMessageList } from './WhatsAppMessageList';
import { WhatsAppTemplateApproval } from './WhatsAppTemplateApproval';
import { MessageSquare, Plus, Settings, FileText, BarChart, CheckCircle } from 'lucide-react';

export function WhatsAppManager() {
  const { subscriptions, isLoading } = useWhatsAppSubscriptions();
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (subscriptions.length === 0 && !showCreateForm) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No WhatsApp Integrations</h3>
          <p className="text-gray-600 mb-6">
            Set up your first WhatsApp Business API integration to start sending messages to your customers.
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create WhatsApp Integration
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">WhatsApp Business Integration</h2>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            Back to Integrations
          </Button>
        </div>
        <WhatsAppSubscriptionForm onSuccess={() => setShowCreateForm(false)} />
      </div>
    );
  }

  if (selectedSubscription) {
    const subscription = subscriptions.find(s => s.id === selectedSubscription);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">WhatsApp Management</h2>
            <p className="text-gray-600">
              Managing integration for Phone ID: {subscription?.phone_number_id}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedSubscription(null)}>
            Back to Integrations
          </Button>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="approval" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approval
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <WhatsAppTemplateManager subscriptionId={selectedSubscription} />
          </TabsContent>

          <TabsContent value="approval" className="space-y-6">
            <WhatsAppTemplateApproval />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <WhatsAppMessageList subscriptionId={selectedSubscription} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <BarChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Message analytics and performance metrics will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Integration Settings</h3>
                <p className="text-gray-600">
                  Configuration options for your WhatsApp integration will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp Integrations</h2>
          <p className="text-gray-600">
            Manage your WhatsApp Business API integrations and message campaigns.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((subscription) => (
          <WhatsAppSubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onSelect={() => setSelectedSubscription(subscription.id)}
            onConfigure={() => setSelectedSubscription(subscription.id)}
          />
        ))}
      </div>
    </div>
  );
}
