
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Plus, Trash2, CalendarIcon, Zap, Target } from 'lucide-react';
import { format } from 'date-fns';

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'signup' | 'purchase' | 'birthday' | 'inactivity' | 'custom';
  delay: number;
  delayUnit: 'minutes' | 'hours' | 'days' | 'weeks';
  templateId: string;
  isActive: boolean;
}

interface ScheduledCampaign {
  id: string;
  name: string;
  scheduledAt: Date;
  timezone: string;
  recurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  templateId: string;
  status: 'scheduled' | 'running' | 'completed' | 'paused';
}

export function EmailAutomationWorkflow() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Welcome Series',
      trigger: 'signup',
      delay: 0,
      delayUnit: 'minutes',
      templateId: 'welcome-1',
      isActive: true
    },
    {
      id: '2',
      name: 'Follow-up Email',
      trigger: 'signup',
      delay: 1,
      delayUnit: 'days',
      templateId: 'follow-up',
      isActive: true
    }
  ]);

  const [scheduledCampaigns, setScheduledCampaigns] = useState<ScheduledCampaign[]>([
    {
      id: '1',
      name: 'Monthly Newsletter',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      timezone: 'UTC',
      recurring: true,
      recurringPattern: 'monthly',
      templateId: 'newsletter',
      status: 'scheduled'
    }
  ]);

  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    trigger: 'signup',
    delay: 0,
    delayUnit: 'minutes'
  });

  const [selectedDate, setSelectedDate] = useState<Date>();

  const addAutomationRule = () => {
    if (newRule.name && newRule.trigger) {
      const rule: AutomationRule = {
        id: Date.now().toString(),
        name: newRule.name,
        trigger: newRule.trigger as AutomationRule['trigger'],
        delay: newRule.delay || 0,
        delayUnit: newRule.delayUnit || 'minutes',
        templateId: newRule.templateId || '',
        isActive: true
      };
      setAutomationRules([...automationRules, rule]);
      setNewRule({ trigger: 'signup', delay: 0, delayUnit: 'minutes' });
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(rules =>
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    setAutomationRules(rules => rules.filter(rule => rule.id !== ruleId));
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'signup': return '👋';
      case 'purchase': return '🛍️';
      case 'birthday': return '🎂';
      case 'inactivity': return '😴';
      default: return '⚡';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Automation & Scheduling</h2>
        <p className="text-gray-600">Set up automated email workflows and scheduled campaigns</p>
      </div>

      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Scheduled Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Automation Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    placeholder="Welcome Series"
                  />
                </div>
                <div>
                  <Label>Trigger Event</Label>
                  <Select value={newRule.trigger} onValueChange={(value) => setNewRule({...newRule, trigger: value as AutomationRule['trigger']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signup">User Signup</SelectItem>
                      <SelectItem value="purchase">Purchase Made</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="inactivity">7 Days Inactive</SelectItem>
                      <SelectItem value="custom">Custom Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="delay">Delay</Label>
                  <div className="flex gap-2">
                    <Input
                      id="delay"
                      type="number"
                      value={newRule.delay || 0}
                      onChange={(e) => setNewRule({...newRule, delay: parseInt(e.target.value)})}
                      className="w-20"
                    />
                    <Select value={newRule.delayUnit} onValueChange={(value) => setNewRule({...newRule, delayUnit: value as AutomationRule['delayUnit']})}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Min</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={addAutomationRule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getTriggerIcon(rule.trigger)}</span>
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-gray-600">
                          Triggered on {rule.trigger} • Delay: {rule.delay} {rule.delayUnit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => toggleRuleStatus(rule.id)}>
                        {rule.isActive ? 'Pause' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input id="campaignName" placeholder="Monthly Newsletter" />
                </div>
                <div>
                  <Label>Schedule Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Recurring</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="No repeat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Schedule Campaign</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">
                        {format(campaign.scheduledAt, "PPP 'at' p")} • {campaign.timezone}
                        {campaign.recurring && ` • Repeats ${campaign.recurringPattern}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-sm text-gray-600">Active Automations</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">2.4K</p>
                  <p className="text-sm text-gray-600">Emails Triggered</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">18.7%</p>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
