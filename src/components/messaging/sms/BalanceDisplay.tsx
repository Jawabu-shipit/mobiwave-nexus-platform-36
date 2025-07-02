
import React from 'react';
import { DollarSign, AlertCircle, Wifi } from 'lucide-react';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useMspaceApi } from '@/hooks/useMspaceApi';

interface BalanceDisplayProps {
  estimatedCost: number;
  recipientCount: number;
  smsCount: number;
}

export function BalanceDisplay({ estimatedCost, recipientCount, smsCount }: BalanceDisplayProps) {
  const { data: credits } = useUserCredits();
  const { checkBalance } = useMspaceApi();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-900">Your Credits</span>
        </div>
        <div className="text-lg font-bold text-green-600">
          ${credits?.credits_remaining?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">Campaign Cost</span>
        </div>
        <div className="text-lg font-bold text-blue-600">
          ${estimatedCost.toFixed(2)}
        </div>
        <div className="text-xs text-blue-800">
          {recipientCount} recipients × {smsCount} SMS
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wifi className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-900">Mspace Balance</span>
        </div>
        {checkBalance.data ? (
          <div className="text-lg font-bold text-purple-600">
            {checkBalance.data.currency} {checkBalance.data.balance}
          </div>
        ) : (
          <div className="text-sm text-purple-600">
            {checkBalance.isPending ? 'Loading...' : 'Connect to check'}
          </div>
        )}
      </div>
    </div>
  );
}
