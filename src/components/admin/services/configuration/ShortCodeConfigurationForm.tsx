
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShortCodeConfigurationFormProps {
  configuration: any;
  onConfigurationChange: (key: string, value: any) => void;
}

export function ShortCodeConfigurationForm({
  configuration,
  onConfigurationChange
}: ShortCodeConfigurationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Short Code Service Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="code">Short Code</Label>
          <Input
            id="code"
            placeholder="e.g., 12345"
            value={configuration.code || ''}
            onChange={(e) => onConfigurationChange('code', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="network">Network</Label>
          <Select
            value={configuration.network || ''}
            onValueChange={(value) => onConfigurationChange('network', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="safaricom">Safaricom</SelectItem>
              <SelectItem value="airtel">Airtel</SelectItem>
              <SelectItem value="telkom">Telkom</SelectItem>
              <SelectItem value="all">All Networks</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="type">Code Type</Label>
          <Select
            value={configuration.type || 'shared'}
            onValueChange={(value) => onConfigurationChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shared">Shared</SelectItem>
              <SelectItem value="dedicated">Dedicated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="setup_fee">Setup Fee (KES)</Label>
            <Input
              id="setup_fee"
              type="number"
              value={configuration.setup_fee || 0}
              onChange={(e) => onConfigurationChange('setup_fee', Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="monthly_fee">Monthly Fee (KES)</Label>
            <Input
              id="monthly_fee"
              type="number"
              value={configuration.monthly_fee || 0}
              onChange={(e) => onConfigurationChange('monthly_fee', Number(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
