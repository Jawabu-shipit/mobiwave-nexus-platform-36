import React, { useState } from 'react';
import { MessageSquare, Plus, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuidedBulkSMSFlow } from '@/components/messaging/GuidedBulkSMSFlow';
import { CampaignList } from '@/components/messaging/CampaignList';
import { CampaignAnalytics } from '@/components/messaging/CampaignAnalytics';

const CampaignManagementPage = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateFlow, setShowCreateFlow] = useState(false);

  if (showCreateFlow) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
            Create SMS Campaign
          </h1>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateFlow(false)}
          >
            Back to Campaigns
          </Button>
        </header>
        <GuidedBulkSMSFlow />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
          Campaign Management
        </h1>
        <Button onClick={() => setShowCreateFlow(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignList onCreateNew={() => setShowCreateFlow(true)} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CampaignAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Campaign settings will be implemented in the next phase</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignManagementPage;