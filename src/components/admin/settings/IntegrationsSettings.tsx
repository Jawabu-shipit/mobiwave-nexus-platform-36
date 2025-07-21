
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, CheckCircle } from 'lucide-react';

interface IntegrationsData {
  smtpHost: string;
  smtpPort: number;
  smsProvider: string;
}

interface IntegrationsSettingsProps {
  settings: IntegrationsData;
  onSettingsChange: (settings: IntegrationsData) => void;
  onSave: () => void;
}

export function IntegrationsSettings({ settings, onSettingsChange, onSave }: IntegrationsSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              value={settings.smtpHost}
              onChange={(e) => onSettingsChange({ ...settings, smtpHost: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
              id="smtpPort"
              type="number"
              value={settings.smtpPort}
              onChange={(e) => onSettingsChange({ ...settings, smtpPort: parseInt(e.target.value) })}
            />
          </div>
          <Button onClick={onSave} className="w-full">
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            SMS Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smsProvider">SMS Provider</Label>
            <Input
              id="smsProvider"
              value={settings.smsProvider}
              onChange={(e) => onSettingsChange({ ...settings, smsProvider: e.target.value })}
            />
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Mspace API Connected</span>
            </div>
            <p className="text-xs text-green-600 mt-1">SMS service is operational</p>
          </div>
          <Button onClick={onSave} className="w-full">
            Save SMS Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
