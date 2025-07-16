
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield } from 'lucide-react';

interface SecuritySettingsData {
  requireEmailVerification: boolean;
  rateLimitPerMinute: number;
}

interface SecuritySettingsProps {
  settings: SecuritySettingsData;
  onSettingsChange: (settings: SecuritySettingsData) => void;
  onSave: () => void;
}

export function SecuritySettings({ settings, onSettingsChange, onSave }: SecuritySettingsProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Security Configuration
        </CardTitle>
        <CardDescription>
          Manage authentication and security policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="emailVerification">Require Email Verification</Label>
            <p className="text-sm text-gray-500">Users must verify email before access</p>
          </div>
          <Switch
            id="emailVerification"
            checked={settings.requireEmailVerification}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, requireEmailVerification: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rateLimit">Rate Limit (requests per minute)</Label>
          <Input
            id="rateLimit"
            type="number"
            value={settings.rateLimitPerMinute}
            onChange={(e) => onSettingsChange({ ...settings, rateLimitPerMinute: parseInt(e.target.value) })}
          />
        </div>

        <Button onClick={onSave} className="w-full">
          Save Security Settings
        </Button>
      </CardContent>
    </Card>
  );
}
