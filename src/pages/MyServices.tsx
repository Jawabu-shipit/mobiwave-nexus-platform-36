import React from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { UserServicesCatalog } from '@/components/services/UserServicesCatalog';
import { UserSubscriptionsManager } from '@/components/services/UserSubscriptionsManager';
import { ServiceConfigurationManager } from '@/components/services/ServiceConfigurationManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ListChecks, Settings, BarChart3, Clock } from 'lucide-react';
import { ServiceActivityLog } from "@/components/services/activity/ServiceActivityLog";

const MyServices = () => {
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="catalog">
              <Package className="mr-2 h-4 w-4" />
              Available Services
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <ListChecks className="mr-2 h-4 w-4" />
              My Subscriptions
            </TabsTrigger>
            <TabsTrigger value="configuration">
              <Settings className="mr-2 h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Service Analytics
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Clock className="mr-2 h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>
          <TabsContent value="catalog" className="mt-6">
            <UserServicesCatalog />
          </TabsContent>
          <TabsContent value="subscriptions" className="mt-6">
            <UserSubscriptionsManager />
          </TabsContent>
          <TabsContent value="configuration" className="mt-6">
            <ServiceConfigurationManager />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Service analytics coming soon...</p>
            </div>
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <ServiceActivityLog />
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
};

export default MyServices;
