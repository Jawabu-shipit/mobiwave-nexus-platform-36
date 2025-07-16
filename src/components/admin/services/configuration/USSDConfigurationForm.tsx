
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface USSDConfigurationFormProps {
  configuration: any;
  onConfigurationChange: (key: string, value: any) => void;
}

export function USSDConfigurationForm({
  configuration,
  onConfigurationChange
}: USSDConfigurationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>USSD Service Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="service_code">Service Code</Label>
          <Input
            id="service_code"
            placeholder="e.g., *123#"
            value={configuration.service_code || ''}
            onChange={(e) => onConfigurationChange('service_code', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="callback_url">Callback URL</Label>
          <Input
            id="callback_url"
            placeholder="https://your-domain.com/ussd/callback"
            value={configuration.callback_url || ''}
            onChange={(e) => onConfigurationChange('callback_url', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="menu_structure">Menu Structure (JSON)</Label>
          <Textarea
            id="menu_structure"
            placeholder="Enter your USSD menu structure as JSON..."
            rows={10}
            value={configuration.menu_structure || ''}
            onChange={(e) => onConfigurationChange('menu_structure', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="setup_fee">Setup Fee (KES)</Label>
            <Input
              id="setup_fee"
              type="number"
              value={configuration.setup_fee || 15000}
              onChange={(e) => onConfigurationChange('setup_fee', Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="monthly_fee">Monthly Fee (KES)</Label>
            <Input
              id="monthly_fee"
              type="number"
              value={configuration.monthly_fee || 8000}
              onChange={(e) => onConfigurationChange('monthly_fee', Number(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
