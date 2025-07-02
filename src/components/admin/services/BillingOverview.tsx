
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

interface UserServiceSubscription {
  id: string;
  status: string;
  setup_fee_paid: boolean;
  monthly_billing_active: boolean;
}

interface BillingOverviewProps {
  userSubscriptions: UserServiceSubscription[];
}

export function BillingOverview({ userSubscriptions }: BillingOverviewProps) {
  const activeServices = userSubscriptions.filter(s => s.status === 'active').length;
  const pendingSetups = userSubscriptions.filter(s => !s.setup_fee_paid).length;
  const monthlyRecurring = userSubscriptions.filter(s => s.monthly_billing_active).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Active Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeServices}</div>
          <p className="text-xs text-gray-500">Across all users</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Setups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingSetups}</div>
          <p className="text-xs text-gray-500">Requiring payment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyRecurring}</div>
          <p className="text-xs text-gray-500">Active billing cycles</p>
        </CardContent>
      </Card>
    </div>
  );
}
