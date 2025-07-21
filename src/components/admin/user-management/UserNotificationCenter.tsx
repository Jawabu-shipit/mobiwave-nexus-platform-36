
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  subject: string;
  content: string;
  triggers: string[];
}

const defaultTemplates: NotificationTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Message',
    type: 'email',
    subject: 'Welcome to MobiWave!',
    content: 'Thank you for joining MobiWave. Your account is now active.',
    triggers: ['user_created']
  },
  {
    id: 'service_activated',
    name: 'Service Activation',
    type: 'both',
    subject: 'Service Activated Successfully',
    content: 'Your {{service_name}} service has been activated and is ready to use.',
    triggers: ['service_activated']
  },
  {
    id: 'low_credits',
    name: 'Low Credits Alert',
    type: 'email',
    subject: 'Credits Running Low',
    content: 'Your account balance is below $10. Please top up to continue using our services.',
    triggers: ['low_credits']
  },
  {
    id: 'subscription_expiry',
    name: 'Subscription Expiry Warning',
    type: 'both',
    subject: 'Subscription Expires Soon',
    content: 'Your {{service_name}} subscription expires in {{days_remaining}} days.',
    triggers: ['subscription_expiring']
  }
];

interface UserNotificationCenterProps {
  selectedUsers?: string[];
  onSendNotification: (notification: any) => Promise<void>;
}

export function UserNotificationCenter({ selectedUsers = [], onSendNotification }: UserNotificationCenterProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customContent, setCustomContent] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'email' | 'sms' | 'both'>('email');
  const [scheduleDelivery, setScheduleDelivery] = useState<boolean>(false);
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = defaultTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomSubject(template.subject);
      setCustomContent(template.content);
      setNotificationType(template.type);
    }
  };

  const handleSendNotification = async () => {
    if (!customSubject || !customContent) return;

    setIsLoading(true);
    try {
      await onSendNotification({
        subject: customSubject,
        content: customContent,
        type: notificationType,
        recipients: selectedUsers,
        scheduledAt: scheduleDelivery ? deliveryTime : null
      });
      
      // Reset form
      setSelectedTemplate('');
      setCustomSubject('');
      setCustomContent('');
      setScheduleDelivery(false);
      setDeliveryTime('');
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notification Center
          {selectedUsers.length > 0 && (
            <Badge variant="secondary">
              {selectedUsers.length} recipients
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div>
          <Label className="text-sm font-medium">Notification Template</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a template or create custom" />
            </SelectTrigger>
            <SelectContent>
              {defaultTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {template.type === 'email' && <Mail className="w-4 h-4" />}
                    {template.type === 'sms' && <MessageSquare className="w-4 h-4" />}
                    {template.type === 'both' && <Bell className="w-4 h-4" />}
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notification Type */}
        <div>
          <Label className="text-sm font-medium">Delivery Method</Label>
          <Select value={notificationType} onValueChange={(value: 'email' | 'sms' | 'both') => setNotificationType(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Only
                </div>
              </SelectItem>
              <SelectItem value="sms">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  SMS Only
                </div>
              </SelectItem>
              <SelectItem value="both">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Email & SMS
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div>
          <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
          <input
            id="subject"
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Enter notification subject"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content" className="text-sm font-medium">Message Content</Label>
          <Textarea
            id="content"
            value={customContent}
            onChange={(e) => setCustomContent(e.target.value)}
            placeholder="Enter your message content..."
            rows={4}
            className="mt-1"
          />
          <div className="mt-1 text-xs text-gray-500">
            Use {`{{user_name}}, {{service_name}}, {{credits_remaining}}`} for personalization
          </div>
        </div>

        {/* Schedule Delivery */}
        <div className="flex items-center space-x-3">
          <Switch
            id="schedule"
            checked={scheduleDelivery}
            onCheckedChange={setScheduleDelivery}
          />
          <Label htmlFor="schedule" className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Schedule Delivery
          </Label>
        </div>

        {scheduleDelivery && (
          <div>
            <Label htmlFor="delivery-time" className="text-sm font-medium">Delivery Time</Label>
            <input
              id="delivery-time"
              type="datetime-local"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Send Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => {
            setSelectedTemplate('');
            setCustomSubject('');
            setCustomContent('');
          }}>
            Clear
          </Button>
          <Button 
            onClick={handleSendNotification}
            disabled={!customSubject || !customContent || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Sending...' : scheduleDelivery ? 'Schedule Notification' : 'Send Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
