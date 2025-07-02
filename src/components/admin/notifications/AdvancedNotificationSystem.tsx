
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Info,
  Send,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'system' | 'user' | 'security' | 'billing';
  recipients: string[];
  channels: string[];
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  scheduledFor?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  category: string;
}

export function AdvancedNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.',
      type: 'warning',
      category: 'system',
      recipients: ['all_users'],
      channels: ['email', 'sms'],
      status: 'scheduled',
      createdAt: '2024-06-14T10:00:00Z',
      scheduledFor: '2024-06-15T02:00:00Z'
    },
    {
      id: '2',
      title: 'Security Alert: Suspicious Activity',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      type: 'error',
      category: 'security',
      recipients: ['admin_team'],
      channels: ['email', 'push'],
      status: 'sent',
      createdAt: '2024-06-14T09:30:00Z'
    }
  ]);

  const [templates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Welcome Message',
      subject: 'Welcome to MobiWave',
      content: 'Welcome to our platform! Get started with your first campaign.',
      type: 'email',
      category: 'user'
    },
    {
      id: '2',
      name: 'Payment Confirmation',
      subject: 'Payment Received',
      content: 'Your payment of ${amount} has been received and credits added.',
      type: 'sms',
      category: 'billing'
    }
  ]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    category: 'system' as const,
    recipients: [] as string[],
    channels: [] as string[],
    scheduled: false,
    scheduledFor: ''
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleSendNotification = () => {
    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      status: newNotification.scheduled ? 'scheduled' : 'sent',
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      category: 'system',
      recipients: [],
      channels: [],
      scheduled: false,
      scheduledFor: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground">Manage system notifications and user communications</p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <Badge>{notifications.length} Active</Badge>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input placeholder="Search notifications..." className="max-w-sm" />
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant="outline">{notification.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                        {notification.status}
                      </Badge>
                      {notification.status === 'scheduled' && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.scheduledFor!).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {notification.recipients.join(', ')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {notification.channels.join(', ')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Notification</CardTitle>
              <CardDescription>Create and send notifications to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newNotification.category}
                    onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Recipients</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="admin_team">Admin Team</SelectItem>
                      <SelectItem value="premium_users">Premium Users</SelectItem>
                      <SelectItem value="new_users">New Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newNotification.scheduled}
                  onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, scheduled: checked }))}
                />
                <label className="text-sm font-medium">Schedule for later</label>
              </div>

              {newNotification.scheduled && (
                <div>
                  <label className="text-sm font-medium">Schedule Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newNotification.scheduledFor}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  />
                </div>
              )}

              <Button onClick={handleSendNotification} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {newNotification.scheduled ? 'Schedule Notification' : 'Send Notification'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Notification Templates</h3>
            <Button>Create Template</Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.subject}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.content}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences and channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Real-time Alerts</h4>
                  <p className="text-sm text-muted-foreground">Show real-time system alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
