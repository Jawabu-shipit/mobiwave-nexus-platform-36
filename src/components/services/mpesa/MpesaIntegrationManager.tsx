
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp } from 'lucide-react';
import { MpesaIntegrationForm } from './MpesaIntegrationForm';
import { MpesaIntegrationList } from './MpesaIntegrationList';
import { MpesaTransactionMonitor } from './MpesaTransactionMonitor';
import { MpesaIntegrationSettings } from './MpesaIntegrationSettings';
import { useMpesaIntegrations } from '@/hooks/useMpesaIntegrations';

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

export function MpesaIntegrationManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<MpesaIntegration | null>(null);
  const [paybillNumber, setPaybillNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');

  const queryClient = useQueryClient();
  const { integrations, isLoading, createIntegration } = useMpesaIntegrations();

  const resetForm = () => {
    setPaybillNumber('');
    setTillNumber('');
    setCallbackUrl('');
  };

  const handleSubmit = async () => {
    if (!paybillNumber || !callbackUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createIntegration.mutateAsync({
        user_id: 'current-user', // This should be set by the hook
        callback_url: callbackUrl,
        is_active: true
      });
      setIsCreating(false);
      resetForm();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">M-Pesa Integration</h2>
          <p className="text-gray-600">
            Configure M-Pesa payment processing for your applications.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Integration
        </Button>
      </div>

      {isCreating && (
        <MpesaIntegrationForm
          paybillNumber={paybillNumber}
          setPaybillNumber={setPaybillNumber}
          tillNumber={tillNumber}
          setTillNumber={setTillNumber}
          callbackUrl={callbackUrl}
          setCallbackUrl={setCallbackUrl}
          onSubmit={handleSubmit}
          onCancel={() => setIsCreating(false)}
          isLoading={createIntegration.isPending}
        />
      )}

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <MpesaIntegrationList
            integrations={integrations.map(integration => ({
              ...integration,
              paybill_number: integration.shortcode || '',
              status: integration.is_active ? 'active' : 'inactive',
              current_balance: 0,
              last_balance_update: integration.updated_at,
              callback_response_type: 'json'
            }))}
            onCreateNew={() => setIsCreating(true)}
            onSelectIntegration={setSelectedIntegration}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <MpesaTransactionMonitor />
        </TabsContent>

        <TabsContent value="settings">
          {selectedIntegration ? (
            <MpesaIntegrationSettings 
              integration={selectedIntegration}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ['mpesa-integrations'] })}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Select an Integration</h3>
                <p className="text-gray-600">
                  Choose an integration from the Integrations tab to view its settings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Payment Analytics</h3>
              <p className="text-gray-600">
                Analytics and insights will be available once you start processing payments.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
