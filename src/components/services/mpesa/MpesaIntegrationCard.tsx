
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Settings, TrendingUp } from 'lucide-react';

interface MpesaIntegration {
  id: string;
  paybill_number: string;
  till_number?: string;
  callback_url: string;
  status: string;
  current_balance: number;
  last_balance_update: string;
}

interface MpesaIntegrationCardProps {
  integration: MpesaIntegration;
  onSelect?: () => void;
}

export function MpesaIntegrationCard({ integration, onSelect }: MpesaIntegrationCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {integration.paybill_number}
          </span>
          <Badge 
            variant={integration.status === 'active' ? 'default' : 'secondary'}
            className={integration.status === 'active' ? 'bg-green-100 text-green-800' : ''}
          >
            {integration.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {integration.till_number && (
            <div>
              <p className="text-sm text-gray-600">Till Number:</p>
              <p className="font-semibold">{integration.till_number}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-600">Current Balance:</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(integration.current_balance || 0)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Callback URL:</p>
            <p className="text-xs font-mono bg-gray-50 p-2 rounded truncate">
              {integration.callback_url}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={onSelect}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button size="sm" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
