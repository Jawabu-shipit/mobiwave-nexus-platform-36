
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Lock, 
  Eye, 
  FileCheck,
  Database,
  AlertTriangle,
  Settings,
  Activity
} from 'lucide-react';
import { ComplianceCenter } from './ComplianceCenter';
import { DataPrivacyManager } from './DataPrivacyManager';
import { SecurityMonitoring } from './SecurityMonitoring';
import { ThreatIntelligence } from './ThreatIntelligence';

export function SecurityDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Security & Compliance</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Comprehensive security monitoring, compliance management, and threat intelligence.
        </p>
      </div>

      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Security Monitoring
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Compliance Center
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Privacy
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Threat Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceCenter />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <DataPrivacyManager />
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <ThreatIntelligence />
        </TabsContent>
      </Tabs>
    </div>
  );
}
