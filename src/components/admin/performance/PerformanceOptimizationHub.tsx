
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Database, 
  Server, 
  Activity,
  BarChart3,
  Settings
} from 'lucide-react';
import { SystemPerformanceMonitor } from './SystemPerformanceMonitor';
import { DatabaseOptimizer } from './DatabaseOptimizer';
import { CachingManager } from './CachingManager';
import { LoadBalancingConfig } from './LoadBalancingConfig';

export function PerformanceOptimizationHub() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Performance Optimization</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Monitor and optimize system performance, database queries, and resource utilization.
        </p>
      </div>

      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Monitor
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="caching" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Caching
          </TabsTrigger>
          <TabsTrigger value="balancing" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Load Balancing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <SystemPerformanceMonitor />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseOptimizer />
        </TabsContent>

        <TabsContent value="caching" className="space-y-4">
          <CachingManager />
        </TabsContent>

        <TabsContent value="balancing" className="space-y-4">
          <LoadBalancingConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
