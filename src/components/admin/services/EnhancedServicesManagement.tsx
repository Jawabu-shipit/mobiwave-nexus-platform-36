
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, DollarSign, Wrench, BarChart3, Zap, Users } from 'lucide-react';
import { ServicesManagementHeader } from './ServicesManagementHeader';
import { ServiceCatalogView } from './ServiceCatalogView';
import { UserServicesManagement } from './UserServicesManagement';
import { BillingOverview } from './BillingOverview';
import { ServiceConfigurationManager } from './ServiceConfigurationManager';
import { ServiceAnalyticsDashboard } from './analytics/ServiceAnalyticsDashboard';
import { ServiceAutomationHub } from './ServiceAutomationHub';
import { useRealServicesManagement } from '@/hooks/useRealServicesManagement';

export function EnhancedServicesManagement() {
  const { 
    services, 
    userSubscriptions, 
    isLoading
  } = useRealServicesManagement();

  const handleServiceConfigured = async (serviceId: string, configuration: any): Promise<void> => {
    console.log('Configuring service:', serviceId, configuration);
  };

  return (
    <div className="space-y-6">
      <ServicesManagementHeader />

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="user-services" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Services
          </TabsTrigger>
          <TabsTrigger value="services-catalog" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Services Catalog
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="billing-overview" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Billing Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <ServiceAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <ServiceAutomationHub />
        </TabsContent>

        <TabsContent value="user-services" className="space-y-4">
          <UserServicesManagement />
        </TabsContent>

        <TabsContent value="services-catalog" className="space-y-4">
          <ServiceCatalogView 
            services={services} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <ServiceConfigurationManager
            services={services}
            onServiceConfigured={handleServiceConfigured}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="billing-overview" className="space-y-4">
          <BillingOverview userSubscriptions={userSubscriptions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
