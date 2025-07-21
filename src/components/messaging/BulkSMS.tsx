
import React, { useState } from 'react';
import { StatusCards } from './sms/StatusCards';
import { GuidedBulkSMSFlow } from './sms/GuidedBulkSMSFlow';
import { QuickSMS } from './QuickSMS';
import { CampaignHistory } from './sms/CampaignHistory';
import { RealTimeTracker } from './sms/RealTimeTracker';
import { AdvancedAnalytics } from './sms/AdvancedAnalytics';
import { CreditPurchase } from '../billing/CreditPurchase';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Zap, BarChart3, History, TrendingUp, DollarSign } from 'lucide-react';

export function BulkSMS() {
  const [activeTab, setActiveTab] = useState('guided-flow');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SMS Campaign Center
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Create and manage SMS campaigns with guided flows, quick messaging, and real-time analytics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={() => setActiveTab('billing')}
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Buy Credits</span>
          </Button>
          <Button 
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            onClick={() => setActiveTab('quick-sms')}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Quick SMS</span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
          onClick={() => setActiveTab('guided-flow')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-blue-600" />
              Bulk Campaign
            </CardTitle>
            <CardDescription>
              Create comprehensive SMS campaigns with our guided flow
            </CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-200"
          onClick={() => setActiveTab('quick-sms')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-green-600" />
              Quick SMS
            </CardTitle>
            <CardDescription>
              Send instant messages to selected contacts
            </CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200"
          onClick={() => setActiveTab('tracking')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Live Tracking
            </CardTitle>
            <CardDescription>
              Monitor campaign performance in real-time
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <StatusCards />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="guided-flow" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Bulk Campaign</span>
            <span className="sm:hidden">Bulk</span>
          </TabsTrigger>
          <TabsTrigger value="quick-sms" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Quick SMS</span>
            <span className="sm:hidden">Quick</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Live Tracking</span>
            <span className="sm:hidden">Track</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Credits</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guided-flow" className="mt-6">
          <GuidedBulkSMSFlow />
        </TabsContent>

        <TabsContent value="quick-sms" className="mt-6">
          <QuickSMS />
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <RealTimeTracker />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CampaignHistory />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <CreditPurchase />
        </TabsContent>
      </Tabs>
    </div>
  );
}
