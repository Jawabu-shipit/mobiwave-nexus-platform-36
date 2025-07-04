
import React from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientDashboardSettings } from '../components/settings/ClientDashboardSettings';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { SubUserManagement } from '../components/sub-users/SubUserManagement';

const Settings = () => {
  return (
    <ClientDashboardLayout>
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subusers">Sub-Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <ClientDashboardSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <NotificationCenter />
        </TabsContent>
        
        <TabsContent value="subusers" className="space-y-4">
          <SubUserManagement />
        </TabsContent>
      </Tabs>
    </ClientDashboardLayout>
  );
};

export default Settings;
