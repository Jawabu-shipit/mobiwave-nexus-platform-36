
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MpesaConfigurationFormProps {
  configuration: any;
  onConfigurationChange: (key: string, value: any) => void;
}

export function MpesaConfigurationForm({
  configuration,
  onConfigurationChange
}: MpesaConfigurationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>M-Pesa Integration Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="paybill_number">Paybill Number</Label>
          <Input
            id="paybill_number"
            placeholder="Enter your Paybill number"
            value={configuration.paybill_number || ''}
            onChange={(e) => onConfigurationChange('paybill_number', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="till_number">Till Number (Optional)</Label>
          <Input
            id="till_number"
            placeholder="Enter your Till number if applicable"
            value={configuration.till_number || ''}
            onChange={(e) => onConfigurationChange('till_number', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="callback_url">Callback URL</Label>
          <Input
            id="callback_url"
            placeholder="https://your-domain.com/mpesa/callback"
            value={configuration.callback_url || ''}
            onChange={(e) => onConfigurationChange('callback_url', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="callback_response_type">Callback Response Type</Label>
          <Select
            value={configuration.callback_response_type || 'json'}
            onValueChange={(value) => onConfigurationChange('callback_response_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
