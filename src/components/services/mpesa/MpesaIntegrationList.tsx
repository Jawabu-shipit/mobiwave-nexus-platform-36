
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus } from 'lucide-react';
import { MpesaIntegrationCard } from './MpesaIntegrationCard';

interface MpesaIntegration {
  id: string;
  paybill_number: string;
  till_number?: string;
  callback_url: string;
  status: string;
  current_balance: number;
  last_balance_update: string;
  callback_response_type: string;
}

interface MpesaIntegrationListProps {
  integrations: MpesaIntegration[];
  onCreateNew: () => void;
  onSelectIntegration: (integration: MpesaIntegration) => void;
}

export function MpesaIntegrationList({ 
  integrations, 
  onCreateNew, 
  onSelectIntegration 
}: MpesaIntegrationListProps) {
  if (integrations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No M-Pesa Integrations</h3>
          <p className="text-gray-600 mb-4">
            Set up your first M-Pesa integration to start accepting payments.
          </p>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Integration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {integrations.map((integration) => (
        <MpesaIntegrationCard 
          key={integration.id} 
          integration={integration}
          onSelect={() => onSelectIntegration(integration)}
        />
      ))}
    </div>
  );
}
