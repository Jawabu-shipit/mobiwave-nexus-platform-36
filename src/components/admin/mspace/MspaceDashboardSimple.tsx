import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, TestTube, CheckCircle } from "lucide-react";
import { MspaceCreditsManagerSimple } from "./MspaceCreditsManagerSimple";
import { MspaceResellerClientsSimple } from "./MspaceResellerClientsSimple";
import { MspaceAPITester } from "./MspaceAPITester";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MspaceDashboardSimple() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Mspace Integration
        </h1>
        <p className="text-muted-foreground">
          Test your Mspace SMS API credentials and manage your account
        </p>
      </div>

      {/* Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Manual Testing Mode:</strong> Enter your credentials directly
          to test the mspace API. This approach bypasses browser limitations and
          provides reliable results.
        </AlertDescription>
      </Alert>

      {/* Main Dashboard */}
      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Check Balance
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reseller Clients
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            API Testing Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-4">
          <MspaceCreditsManagerSimple />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <MspaceResellerClientsSimple />
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
              <p className="text-sm text-muted-foreground mb-4">
                Generate curl commands, Node.js scripts, and Postman collections
                to test your mspace API credentials externally.
              </p>
              <MspaceAPITester />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
