import React, { useState } from "react";
import { Database, Upload, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataHubPage = () => {
  const [activeTab, setActiveTab] = useState("models");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Database className="w-8 h-8 mr-3 text-blue-600" />
          Data Hub
        </h1>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
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
          <Card>
            <CardHeader>
              <CardTitle>Data Models</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Data models functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Data import functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Import jobs monitoring functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataHubPage;
