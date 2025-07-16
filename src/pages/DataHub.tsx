import React, { useState } from 'react';
import { Database, Upload, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataModelList } from '@/components/data-hub/DataModelList';
import { ModelBuilder } from '@/components/data-hub/ModelBuilder';
import { FileUpload } from '@/components/data-hub/FileUpload';
import { ImportJobsMonitor } from '@/components/data-hub/ImportJobsMonitor';

const DataHubPage = () => {
  const [activeTab, setActiveTab] = useState('models');

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Database className="w-8 h-8 mr-3 text-blue-600" />
          Data Hub
        </h1>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Models
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Import Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataModelList />
            </div>
            <div>
              <ModelBuilder />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FileUpload onUploadComplete={() => setActiveTab('jobs')} />
            <ImportJobsMonitor />
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <ImportJobsMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataHubPage;