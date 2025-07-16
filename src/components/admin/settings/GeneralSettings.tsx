
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings } from 'lucide-react';

interface GeneralSettingsData {
  maintenanceMode: boolean;
  enableRegistration: boolean;
  maxCampaignRecipients: number;
}

interface GeneralSettingsProps {
  settings: GeneralSettingsData;
  onSettingsChange: (settings: GeneralSettingsData) => void;
  onSave: () => void;
}

export function GeneralSettings({ settings, onSettingsChange, onSave }: GeneralSettingsProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          General Settings
        </CardTitle>
        <CardDescription>
          Configure basic platform settings and user preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="maintenance">Maintenance Mode</Label>
            <p className="text-sm text-gray-500">Temporarily disable access for maintenance</p>
          </div>
          <Switch
            id="maintenance"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, maintenanceMode: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="registration">Enable Registration</Label>
            <p className="text-sm text-gray-500">Allow new users to register</p>
          </div>
          <Switch
            id="registration"
            checked={settings.enableRegistration}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, enableRegistration: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxRecipients">Max Campaign Recipients</Label>
          <Input
            id="maxRecipients"
            type="number"
            value={settings.maxCampaignRecipients}
            onChange={(e) => onSettingsChange({ ...settings, maxCampaignRecipients: parseInt(e.target.value) })}
          />
        </div>

        <Button onClick={onSave} className="w-full">
          Save General Settings
        </Button>
      </CardContent>
    </Card>
  );
}
