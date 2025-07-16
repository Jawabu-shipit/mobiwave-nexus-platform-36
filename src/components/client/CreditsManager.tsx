
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserCredits } from '@/hooks/useUserCredits';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CreditCard, 
  DollarSign, 
  History,
  ShoppingCart,
  Wallet
} from 'lucide-react';

export function CreditsManager() {
  const [topupAmount, setTopupAmount] = useState('');
  const { credits, isLoading } = useUserCredits();
  const queryClient = useQueryClient();

  // Request credit top-up from reseller (Mobiwave)
  const requestTopup = useMutation({
    mutationFn: async (amount: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a credit top-up request to the reseller
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          type: 'topup_request',
          amount: amount,
          status: 'pending',
          description: `Credit top-up request for ${amount} SMS credits`,
          reference: `REQ-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      // In a real implementation, this would notify the reseller admin
      // For demo purposes, we'll auto-approve small amounts
      if (amount <= 1000) {
        // Auto-approve and add credits
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            credits_remaining: (credits?.credits_remaining || 0) + amount,
            credits_purchased: (credits?.credits_purchased || 0) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Update transaction status
        await supabase
          .from('credit_transactions')
          .update({ status: 'completed' })
          .eq('id', data.id);
      }

      return data;
    },
    onSuccess: (data, amount) => {
      if (amount <= 1000) {
        toast.success(`${amount} SMS credits added to your account!`);
      } else {
        toast.success('Credit top-up request submitted. You will be notified when approved.');
      }
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      setTopupAmount('');
    },
    onError: (error: any) => {
      toast.error(`Failed to request credits: ${error.message}`);
    }
  });

  const handleTopupRequest = () => {
    const amount = parseInt(topupAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > 10000) {
      toast.error('Maximum single request is 10,000 SMS credits');
      return;
    }
    requestTopup.mutate(amount);
  };

  const creditPackages = [
    { amount: 100, price: 50, popular: false },
    { amount: 500, price: 225, popular: false },
    { amount: 1000, price: 400, popular: true },
    { amount: 5000, price: 1750, popular: false },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Your SMS Credits Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {credits?.credits_remaining?.toFixed(0) || '0'}
              </div>
              <p className="text-sm text-gray-500">Available Credits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {credits?.credits_purchased?.toFixed(0) || '0'}
              </div>
              <p className="text-sm text-gray-500">Total Purchased</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {((credits?.credits_purchased || 0) - (credits?.credits_remaining || 0)).toFixed(0)}
              </div>
              <p className="text-sm text-gray-500">Credits Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Top-up Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Quick Top-up Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {creditPackages.map((pkg, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 text-center hover:shadow-md transition-shadow ${
                  pkg.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                    Most Popular
                  </div>
                )}
                <div className="text-2xl font-bold">{pkg.amount}</div>
                <div className="text-sm text-gray-500 mb-2">SMS Credits</div>
                <div className="text-lg font-semibold text-green-600 mb-3">
                  KES {pkg.price}
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setTopupAmount(pkg.amount.toString());
                    requestTopup.mutate(pkg.amount);
                  }}
                  disabled={requestTopup.isPending}
                >
                  Request Top-up
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Amount Top-up */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Request Custom Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">SMS Credits Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter SMS count"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                max={10000}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost</Label>
              <div className="p-2 bg-gray-50 rounded-md">
                KES {(parseInt(topupAmount) * 0.5 || 0).toFixed(2)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Balance</Label>
              <div className="p-2 bg-green-50 rounded-md text-green-700 font-medium">
                {((credits?.credits_remaining || 0) + parseInt(topupAmount || '0')).toFixed(0)} SMS
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleTopupRequest}
            disabled={requestTopup.isPending || !topupAmount}
            className="w-full"
          >
            {requestTopup.isPending ? 'Processing...' : `Request ${topupAmount} SMS Credits`}
          </Button>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Requests up to 1,000 SMS credits are auto-approved</p>
            <p>• Larger requests require manual approval</p>
            <p>• You will be notified when your request is processed</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Credit Usage Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">SMS Costs:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Standard SMS: 1 credit per message</li>
                <li>• Long SMS (&gt;160 chars): 2-3 credits</li>
                <li>• Delivery reports: Included</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Test campaigns with small batches</li>
                <li>• Monitor delivery rates</li>
                <li>• Keep messages under 160 characters</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
