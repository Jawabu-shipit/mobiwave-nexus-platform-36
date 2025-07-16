import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Shield, Zap, Clock } from 'lucide-react';
import { CurrencyKES } from '@/components/ui/CurrencyKES';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useMpesaPayment } from '@/hooks/useMpesaPayment';
import { toast } from 'sonner';

const CREDIT_PACKAGES = [
  { amount: 50, bonus: 0, popular: false },
  { amount: 100, bonus: 5, popular: false },
  { amount: 200, bonus: 15, popular: true },
  { amount: 500, bonus: 50, popular: false },
  { amount: 1000, bonus: 150, popular: false },
  { amount: 2000, bonus: 400, popular: false }
];

export function MpesaCreditPurchase() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[2]);
  const [customAmount, setCustomAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const { data: credits, refetch } = useUserCredits();
  const { initiatePayment, isLoading, paymentStatus } = useMpesaPayment();

  const handlePurchase = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }

    const amount = customAmount ? parseFloat(customAmount) : selectedPackage.amount + selectedPackage.bonus;
    
    if (amount < 10) {
      toast.error('Minimum amount is KES 10');
      return;
    }

    // Convert phone number format (remove spaces, handle different formats)
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    try {
      const result = await initiatePayment({
        amount: amount,
        phone: cleanPhone,
        accountReference: `CREDITS_${Date.now()}`,
        transactionDesc: `Credit purchase - KES ${amount}`
      });

      if (result.success) {
        // Payment initiated successfully, the hook will handle status updates
        setTimeout(() => {
          refetch(); // Refresh credits after potential payment completion
        }, 30000); // Check after 30 seconds
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const getTotalAmount = () => {
    if (customAmount) return parseFloat(customAmount) || 0;
    return selectedPackage.amount + selectedPackage.bonus;
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'processing': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      case 'completed': return <Shield className="w-4 h-4" />;
      case 'failed': return <Zap className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Credits via M-Pesa</h2>
        <p className="text-gray-600">Add credits to your account using M-Pesa mobile money</p>
        {credits && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <CurrencyKES className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-blue-900">
                Current Balance: KES {credits.credits_remaining?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        )}
      </div>

      {paymentStatus !== 'idle' && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={getStatusColor()}>
                {getStatusIcon()}
              </div>
              <div>
                <p className={`font-medium ${getStatusColor()}`}>
                  {paymentStatus === 'processing' && 'Payment in progress...'}
                  {paymentStatus === 'completed' && 'Payment completed successfully!'}
                  {paymentStatus === 'failed' && 'Payment failed'}
                </p>
                <p className="text-sm text-gray-600">
                  {paymentStatus === 'processing' && 'Please complete the payment on your phone'}
                  {paymentStatus === 'completed' && 'Credits have been added to your account'}
                  {paymentStatus === 'failed' && 'Please try again or contact support'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card 
            key={pkg.amount}
            className={`cursor-pointer transition-all border-2 ${
              selectedPackage.amount === pkg.amount && !customAmount
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            } ${pkg.popular ? 'ring-2 ring-green-200' : ''}`}
            onClick={() => {
              setSelectedPackage(pkg);
              setCustomAmount('');
            }}
          >
            <CardHeader className="text-center pb-2">
              {pkg.popular && (
                <Badge className="self-center mb-2 bg-green-600">
                  Most Popular
                </Badge>
              )}
              <CardTitle className="text-2xl">KES {pkg.amount}</CardTitle>
              {pkg.bonus > 0 && (
                <CardDescription className="text-green-600 font-medium">
                  +KES {pkg.bonus} bonus credits
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-sm text-gray-600">
                Total: KES {pkg.amount + pkg.bonus}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ~{Math.floor((pkg.amount + pkg.bonus) / 2)} SMS messages
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="text-lg">Custom Amount</CardTitle>
          <CardDescription>Enter your own credit amount (Minimum: KES 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Label htmlFor="customAmount" className="text-lg">KES</Label>
            <Input
              id="customAmount"
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                if (e.target.value) {
                  setSelectedPackage({ amount: 0, bonus: 0, popular: false });
                }
              }}
              min="10"
              max="10000"
              step="1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            M-Pesa Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="0722 000 000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Enter your Safaricom number registered for M-Pesa
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">KES {getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Transaction Fee:</span>
              <span className="font-semibold">KES 0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold">Total to Pay:</span>
              <span className="font-bold text-lg">KES {getTotalAmount().toFixed(2)}</span>
            </div>
          </div>

          <Button 
            onClick={handlePurchase}
            disabled={isLoading || getTotalAmount() < 10 || !phoneNumber || paymentStatus === 'processing'}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isLoading || paymentStatus === 'processing' ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 mr-2" />
                Pay via M-Pesa - KES {getTotalAmount().toFixed(2)}
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            <Shield className="w-3 h-3 inline mr-1" />
            Secure M-Pesa payment. You will receive an STK push on your phone to complete the payment.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
