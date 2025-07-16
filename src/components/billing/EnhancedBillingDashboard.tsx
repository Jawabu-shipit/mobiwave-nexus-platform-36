
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, TrendingUp, History, Download } from 'lucide-react';
import { CurrencyKES } from '@/components/ui/CurrencyKES';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useUsageAnalytics } from '@/hooks/useUsageAnalytics';
import { CreditsManager } from '../client/CreditsManager';

export function EnhancedBillingDashboard() {
  const { data: credits } = useUserCredits();
  const { usageData } = useUsageAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Billing & Credits</h2>
        <p className="text-gray-600">
          Manage your account balance, view transaction history, and purchase credits.
        </p>
      </div>

      {/* Credit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-green-600">
                  ${credits?.credits_remaining?.toFixed(2) || '0.00'}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Purchased</p>
                <p className="text-3xl font-bold">
                  ${credits?.credits_purchased?.toFixed(2) || '0.00'}
                </p>
              </div>
              <CurrencyKES className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">This Month's Usage</p>
                <p className="text-3xl font-bold text-blue-600">$127.50</p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchase" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="usage">Usage Reports</TabsTrigger>
          <TabsTrigger value="subscriptions">Service Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-6">
          {/* Replaced with CreditsManager */}
          <CreditsManager />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {[
                  { date: '2024-01-15', type: 'Purchase', amount: '+$150.00', description: 'Business Pack Credits' },
                  { date: '2024-01-14', type: 'Usage', amount: '-$12.50', description: 'SMS Campaign - Jan Marketing' },
                  { date: '2024-01-12', type: 'Usage', amount: '-$8.75', description: 'WhatsApp Messages' },
                  { date: '2024-01-10', type: 'Purchase', amount: '+$50.00', description: 'Starter Pack Credits' }
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'Purchase' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-600">{transaction.date}</div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'Purchase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{usageData?.smsSent.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">SMS Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{usageData?.whatsappMessages.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">WhatsApp Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{usageData?.ussdSessions.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">USSD Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{usageData?.mpesaTransactions.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">M-Pesa Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'WhatsApp Business API', cost: '$25/month', status: 'Active', nextBilling: '2024-02-15' },
                  { name: 'USSD Premium', cost: '$50/month', status: 'Active', nextBilling: '2024-02-20' },
                  { name: 'M-Pesa Integration', cost: '$30/month', status: 'Pending', nextBilling: 'N/A' }
                ].map((subscription, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{subscription.name}</div>
                      <div className="text-sm text-gray-600">Next billing: {subscription.nextBilling}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{subscription.cost}</div>
                      <Badge className={
                        subscription.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }>
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
