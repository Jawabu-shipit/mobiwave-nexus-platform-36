
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Key, 
  FileText, 
  Webhook,
  Zap,
  Settings,
  Target,
  Code
} from 'lucide-react';
import { UserSegmentation } from './UserSegmentation';
import { PublicAPIManagement } from './PublicAPIManagement';
import { ServiceTemplateManager } from './ServiceTemplateManager';
import { WebhookManager } from '../../api/WebhookManager';

export function AdvancedFeaturesHub() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Advanced Features</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Advanced tools for segmentation, automation, and platform optimization.
        </p>
      </div>

      <Tabs defaultValue="segmentation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="segmentation" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            User Segmentation
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Service Templates
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Public API
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="segmentation" className="space-y-4">
          <UserSegmentation />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <ServiceTemplateManager />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <PublicAPIManagement />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
