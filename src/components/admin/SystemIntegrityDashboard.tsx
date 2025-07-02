
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Database, Eye, CheckCircle } from 'lucide-react';
import { EnhancedAuditViewer } from './EnhancedAuditViewer';
import { DatabaseHealthMonitor } from './DatabaseHealthMonitor';
import { SecurityMonitor } from './SecurityMonitor';
import { ProductionReadinessChecker } from './ProductionReadinessChecker';

export function SystemIntegrityDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 bg-clip-text text-transparent">
          System Integrity Dashboard
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Comprehensive monitoring and management of system security, performance, and production readiness.
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Monitor
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database Health
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="readiness" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Production Ready
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <SecurityMonitor />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseHealthMonitor />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <EnhancedAuditViewer />
        </TabsContent>

        <TabsContent value="readiness" className="space-y-6">
          <ProductionReadinessChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
