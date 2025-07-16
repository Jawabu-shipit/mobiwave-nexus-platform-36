import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Clock,
  Save,
  RefreshCw
} from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { ApiCredentials } from './ApiCredentials';

export function ClientDashboardSettings() {
  const { user } = useAuth();
  const { 
    settings, 
    notificationPreferences, 
    isLoading, 
    updateSettings, 
    updateNotificationPreferences,
    isUpdatingSettings,
    isUpdatingPreferences
  } = useUserSettings();

  const [localSettings, setLocalSettings] = useState({
    theme: settings?.theme || 'light',
    timezone: settings?.timezone || 'UTC',
    language: settings?.language || 'en',
    auto_save: settings?.auto_save ?? true,
    two_factor_enabled: settings?.two_factor_enabled ?? false,
    session_timeout: settings?.session_timeout || 3600
  });

  const [localNotificationPrefs, setLocalNotificationPrefs] = useState({
    email_notifications: notificationPreferences?.email_notifications ?? true,
    sms_notifications: notificationPreferences?.sms_notifications ?? false,
    push_notifications: notificationPreferences?.push_notifications ?? true,
    marketing_notifications: notificationPreferences?.marketing_notifications ?? false,
    notification_types: notificationPreferences?.notification_types || {
      system: true,
      billing: true,
      security: true,
      campaigns: true
    }
  });

  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        theme: settings.theme,
        timezone: settings.timezone,
        language: settings.language,
        auto_save: settings.auto_save,
        two_factor_enabled: settings.two_factor_enabled,
        session_timeout: settings.session_timeout
      });
    }
  }, [settings]);

  React.useEffect(() => {
    if (notificationPreferences) {
      setLocalNotificationPrefs({
        email_notifications: notificationPreferences.email_notifications,
        sms_notifications: notificationPreferences.sms_notifications,
        push_notifications: notificationPreferences.push_notifications,
        marketing_notifications: notificationPreferences.marketing_notifications,
        notification_types: notificationPreferences.notification_types
      });
    }
  }, [notificationPreferences]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings(localSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleSaveNotificationPreferences = async () => {
    try {
      await updateNotificationPreferences(localNotificationPrefs);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Africa/Nairobi',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'sw', name: 'Swahili' }
  ];

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Settings</h1>
          <p className="text-gray-600">
            Customize your dashboard experience and account preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div>
              <Label>User ID</Label>
              <Input value={user?.id?.slice(0, 8) + '...' || ''} disabled />
            </div>
            <div>
              <Label>Account Status</Label>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Theme</Label>
              <Select 
                value={localSettings.theme} 
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, theme: value as 'light' | 'dark' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select 
                value={localSettings.language} 
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timezone</Label>
              <Select 
                value={localSettings.timezone} 
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveSettings} 
              disabled={isUpdatingSettings}
              className="w-full"
            >
              {isUpdatingSettings ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Appearance
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-xs text-gray-500">Add extra security to your account</p>
              </div>
              <Switch 
                checked={localSettings.two_factor_enabled}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, two_factor_enabled: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save</Label>
                <p className="text-xs text-gray-500">Automatically save changes</p>
              </div>
              <Switch 
                checked={localSettings.auto_save}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, auto_save: checked }))}
              />
            </div>
            <div>
              <Label>Session Timeout (seconds)</Label>
              <Input 
                type="number"
                value={localSettings.session_timeout}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) || 3600 }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Notification Channels</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.email_notifications}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ ...prev, email_notifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.sms_notifications}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ ...prev, sms_notifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-gray-500">Receive browser notifications</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.push_notifications}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ ...prev, push_notifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Notifications</Label>
                  <p className="text-xs text-gray-500">Receive promotional content</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.marketing_notifications}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ ...prev, marketing_notifications: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Notification Types</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Notifications</Label>
                  <p className="text-xs text-gray-500">System updates and maintenance</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.notification_types.system}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ 
                    ...prev, 
                    notification_types: { ...prev.notification_types, system: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Billing Notifications</Label>
                  <p className="text-xs text-gray-500">Payment and billing updates</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.notification_types.billing}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ 
                    ...prev, 
                    notification_types: { ...prev.notification_types, billing: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Security Notifications</Label>
                  <p className="text-xs text-gray-500">Security alerts and login attempts</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.notification_types.security}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ 
                    ...prev, 
                    notification_types: { ...prev.notification_types, security: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Campaign Notifications</Label>
                  <p className="text-xs text-gray-500">SMS campaign updates and reports</p>
                </div>
                <Switch 
                  checked={localNotificationPrefs.notification_types.campaigns}
                  onCheckedChange={(checked) => setLocalNotificationPrefs(prev => ({ 
                    ...prev, 
                    notification_types: { ...prev.notification_types, campaigns: checked }
                  }))}
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <Button 
            onClick={handleSaveNotificationPreferences} 
            disabled={isUpdatingPreferences}
            className="w-full"
          >
            {isUpdatingPreferences ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Mspace API Credentials Management */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Mspace API Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Configure your Mspace API credentials for SMS and related integrations.</p>
          <ApiCredentials />
        </CardContent>
      </Card>
    </div>
  );
}