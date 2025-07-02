
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const SecurityFeaturesCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Features</CardTitle>
        <CardDescription>
          Configure additional security features and policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Audit Logging</Label>
            <p className="text-sm text-gray-600">
              Track all user actions and security events
            </p>
          </div>
          <Switch checked={true} disabled />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Two-Factor Authentication</Label>
            <p className="text-sm text-gray-600">
              Require 2FA for all admin accounts
            </p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Session Timeout</Label>
            <p className="text-sm text-gray-600">
              Automatic logout after inactivity
            </p>
          </div>
          <Switch checked={true} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityFeaturesCard;
