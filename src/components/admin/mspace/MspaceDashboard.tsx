import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Users,
  Settings,
  TestTube,
  Activity,
  Database,
} from "lucide-react";
import { MspaceCreditsManager } from "./MspaceCreditsManager";
import { MspaceResellerClients } from "./MspaceResellerClients";
import { MspaceAPITester } from "./MspaceAPITester";
import { MspaceIntegrationStatus } from "./MspaceIntegrationStatus";
import { SubUsersManager } from "./SubUsersManager";
import { MspaceErrorBoundary } from "./MspaceErrorBoundary";
import { MspaceDeploymentGuide } from "./MspaceDeploymentGuide";
import { MspaceImplementationSummary } from "./MspaceImplementationSummary";

export function MspaceDashboard() {
  return (
    <MspaceErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mspace Integration
          </h1>
          <p className="text-muted-foreground">
            Manage your Mspace SMS API integration, credits, and client accounts
          </p>
        </div>

        {/* Integration Status */}
        <MspaceIntegrationStatus />

        {/* Main Dashboard */}
        <Tabs defaultValue="credits" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 min-w-[700px]">
              <TabsTrigger value="credits" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credits
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="subusers" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Sub Users
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Testing
              </TabsTrigger>
              <TabsTrigger
                value="deployment"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Deploy
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Status
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="credits" className="space-y-4">
            <MspaceCreditsManager />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <MspaceResellerClients />
          </TabsContent>

          <TabsContent value="subusers" className="space-y-4">
            <SubUsersManager />
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  API Testing Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MspaceAPITester />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            <MspaceDeploymentGuide />
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Integration Status & Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MspaceIntegrationStatus />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <MspaceImplementationSummary />
          </TabsContent>
        </Tabs>
      </div>
    </MspaceErrorBoundary>
  );
}
