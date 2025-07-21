
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from 'lucide-react';

interface MpesaIntegrationFormProps {
  paybillNumber: string;
  setPaybillNumber: (value: string) => void;
  tillNumber: string;
  setTillNumber: (value: string) => void;
  callbackUrl: string;
  setCallbackUrl: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function MpesaIntegrationForm({
  paybillNumber,
  setPaybillNumber,
  tillNumber,
  setTillNumber,
  callbackUrl,
  setCallbackUrl,
  onSubmit,
  onCancel,
  isLoading
}: MpesaIntegrationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Create M-Pesa Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paybillNumber">Paybill Number *</Label>
            <Input
              id="paybillNumber"
              placeholder="e.g., 174379"
              value={paybillNumber}
              onChange={(e) => setPaybillNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tillNumber">Till Number (Optional)</Label>
            <Input
              id="tillNumber"
              placeholder="e.g., 123456"
              value={tillNumber}
              onChange={(e) => setTillNumber(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="callbackUrl">Callback URL *</Label>
          <Input
            id="callbackUrl"
            placeholder="https://your-app.com/mpesa/callback"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">
            This URL will receive payment notifications from M-Pesa
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Integration'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
