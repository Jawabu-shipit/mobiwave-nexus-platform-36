
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { CreditPurchase } from '../components/billing/CreditPurchase';
import { CreditHistory } from '../components/billing/CreditHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp } from 'lucide-react';
import { CurrencyKES } from '@/components/ui/CurrencyKES';
import { useBillingData } from '@/hooks/useBillingData';
import { LoadingState } from '@/components/common/LoadingState';

const BillingDashboard = () => {
  const { billingData, isLoading } = useBillingData();

  if (isLoading) {
    return (
      <ClientDashboardLayout>
        <LoadingState message="Loading billing data..." />
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
            Billing & Credits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Manage your account balance, purchase credits, and view billing history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingData?.availableCredits.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Credits remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CurrencyKES className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${billingData?.monthlySpent.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Total spent this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingData?.usageRate.toFixed(1) || '0'}%</div>
              <p className="text-xs text-muted-foreground">Of monthly budget</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreditPurchase />
          <CreditHistory />
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default BillingDashboard;
