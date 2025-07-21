import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Users, Key, User, CheckCircle } from "lucide-react";
import { MspaceAPITester } from "./MspaceAPITester";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResellerClient {
  clientUserName: string;
  smsBalance: string;
  status?: string;
}

export function MspaceResellerClientsSimple() {
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [manualApiKey, setManualApiKey] = useState("");
  const [manualUsername, setManualUsername] = useState("");
  const [isTestingManual, setIsTestingManual] = useState(false);

  const testManualCredentials = async () => {
    if (!manualApiKey.trim() || !manualUsername.trim()) {
      toast.error("Please enter both API key and username");
      return;
    }

    setIsTestingManual(true);

    try {
      console.log("Testing manual credentials via edge function...");

      // Try the edge function with manual credentials
      const { data, error } = await supabase.functions.invoke("mspace-proxy", {
        body: {
          endpoint: "https://api.mspace.co.ke/smsapi/v2/resellerclients",
          apiKey: manualApiKey.trim(),
          username: manualUsername.trim(),
          operation: "resellerclients",
        },
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Debug: Log the raw API response
      console.log("Raw reseller clients API response:", data);

      // Parse clients from response
      let clientsData: ResellerClient[];
      if (Array.isArray(data)) {
        clientsData = data;
      } else if (data?.resellerClients && Array.isArray(data.resellerClients)) {
        clientsData = data.resellerClients;
      } else {
        clientsData = [];
      }

      setClients(clientsData);
      setLastUpdated(new Date().toISOString());
      toast.success(`✅ Found ${clientsData.length} reseller clients`, {
        description: "Retrieved successfully",
      });
    } catch (error: any) {
      console.error("Manual test failed:", error);
      toast.error(`❌ Test failed: ${error.message}`, {
        description: "Use the API tester tools below for external testing",
      });
    } finally {
      setIsTestingManual(false);
    }
  };

  const formatBalance = (balance: string | number | undefined | null) => {
    // Handle missing or empty balance
    if (balance === undefined || balance === null || balance === "") {
      return "N/A";
    }

    const numBalance = parseInt(balance.toString());
    if (isNaN(numBalance)) {
      return balance.toString() || "N/A";
    }

    return numBalance.toLocaleString();
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reseller Clients
          </h2>
          <p className="text-muted-foreground">
            Test your credentials and view reseller client accounts
          </p>
        </div>
      </div>

      {/* Manual Credentials Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Test Your Mspace Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="apikey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key
              </Label>
              <Input
                id="apikey"
                type="password"
                value={manualApiKey}
                onChange={(e) => setManualApiKey(e.target.value)}
                placeholder="Enter your mspace API key"
              />
            </div>
            <div>
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={manualUsername}
                onChange={(e) => setManualUsername(e.target.value)}
                placeholder="Enter your mspace username"
              />
            </div>
          </div>
          <Button
            onClick={testManualCredentials}
            disabled={
              isTestingManual || !manualApiKey.trim() || !manualUsername.trim()
            }
            className="w-full"
            size="lg"
          >
            {isTestingManual ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Clients...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Load Reseller Clients
              </>
            )}
          </Button>

          {clients.length > 0 && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Found {clients.length} reseller clients. Your credentials are
                working correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reseller Clients ({clients.length})
          </CardTitle>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No reseller clients loaded
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter your credentials above and click "Load Reseller Clients"
                to fetch your data.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Username</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow key={client.clientUserName || index}>
                    <TableCell className="font-medium">
                      {client.clientUserName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {formatBalance(client.smsBalance)} SMS
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {client.status || "Active"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* API Testing Tools */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">
          Advanced API Testing Tools
        </h3>
        <MspaceAPITester />
      </div>
    </div>
  );
}
