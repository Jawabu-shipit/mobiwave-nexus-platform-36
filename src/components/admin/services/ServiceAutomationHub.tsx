
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, Bot, Settings, Play } from 'lucide-react';
import { WorkflowBuilder } from './automation/WorkflowBuilder';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  lastRun?: string;
}

export function ServiceAutomationHub() {
  const [automationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-activate SMS for new users',
      description: 'Automatically activate SMS service when a new user registers',
      trigger: 'user_registration',
      actions: ['activate_sms_service', 'send_welcome_sms'],
      isActive: true,
      lastRun: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Subscription expiry reminder',
      description: 'Send reminder 7 days before subscription expires',
      trigger: 'subscription_expiring',
      actions: ['send_reminder_email', 'create_renewal_notification'],
      isActive: true,
      lastRun: '2024-01-14T08:00:00Z'
    },
    {
      id: '3',
      name: 'Failed payment retry',
      description: 'Retry failed payments after 24 hours',
      trigger: 'payment_failed',
      actions: ['retry_payment', 'notify_user'],
      isActive: false
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Service Automation Hub</h3>
          <p className="text-gray-600">
            Automate service management tasks and workflows
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Create New Automation
        </Button>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Workflow Builder
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Triggers & Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-500">
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{rule.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Trigger: </span>
                      <span className="text-sm text-gray-600 capitalize">
                        {rule.trigger.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Actions: </span>
                      <div className="flex gap-1 mt-1">
                        {rule.actions.map((action, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {action.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {rule.lastRun && (
                      <div>
                        <span className="text-sm font-medium">Last run: </span>
                        <span className="text-sm text-gray-600">
                          {new Date(rule.lastRun).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      {rule.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="outline">
                      Test Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'User Registration', event: 'user_registration', description: 'When a new user signs up' },
                  { name: 'Service Activation', event: 'service_activation', description: 'When a service is activated' },
                  { name: 'Payment Success', event: 'payment_success', description: 'When payment is successful' },
                  { name: 'Payment Failed', event: 'payment_failed', description: 'When payment fails' },
                  { name: 'Subscription Expiring', event: 'subscription_expiring', description: 'When subscription is about to expire' },
                  { name: 'High Usage Alert', event: 'high_usage_alert', description: 'When usage exceeds threshold' }
                ].map((trigger) => (
                  <Card key={trigger.event} className="border-dashed">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">{trigger.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{trigger.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                        {trigger.event}
                      </code>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
