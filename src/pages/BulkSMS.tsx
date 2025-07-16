
import React, { useState } from 'react';
import { ClientDashboardLayout } from '../components/client/ClientDashboardLayout';
import { GuidedBulkSMSFlow } from '../components/messaging/GuidedBulkSMSFlow';
import { BulkSMS as BulkSMSComponent } from '../components/messaging/BulkSMS';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Settings } from 'lucide-react';

const BulkSMS = () => {
  const [activeTab, setActiveTab] = useState('guided');

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guided" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Guided Campaign
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guided">
            <GuidedBulkSMSFlow />
          </TabsContent>

          <TabsContent value="advanced">
            <BulkSMSComponent />
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
};

export default BulkSMS;
