
import React from 'react';

interface PricingDisplayProps {
  setupFee: number;
  monthlyFee: number;
  transactionFeeType: string;
  transactionFeeAmount: number;
}

export function PricingDisplay({
  setupFee,
  monthlyFee,
  transactionFeeType,
  transactionFeeAmount
}: PricingDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatTransactionFee = () => {
    if (transactionFeeType === 'none' || transactionFeeAmount === 0) {
      return 'No transaction fees';
    }
    
    if (transactionFeeType === 'percentage') {
      return `${transactionFeeAmount}% per transaction`;
    }
    
    return `${formatCurrency(transactionFeeAmount)} per transaction`;
  };

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <h4 className="font-medium text-sm mb-2">Pricing</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Setup Fee:</span>
          <span className="font-medium">{formatCurrency(setupFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Fee:</span>
          <span className="font-medium">{formatCurrency(monthlyFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Transaction Fee:</span>
          <span className="font-medium">{formatTransactionFee()}</span>
        </div>
      </div>
    </div>
  );
}
