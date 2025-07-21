import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bug,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Key,
  User,
  Settings,
} from "lucide-react";
import { useMspaceUsersDebug } from "@/hooks/useMspaceUsersDebug";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MspaceDebugPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);

  const { users, isLoading, error, checkCredentials, fetchAndSyncClients } =
    useMspaceUsersDebug();

  // Get current user info
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get API credentials for current user
  const { data: userCredentials } = useQuery({
    queryKey: ["user-credentials", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;

      const { data, error } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("service_name", "mspace");

      return { data, error };
    },
    enabled: !!currentUser?.id,
  });

  // Test individual MSpace API operations
  const testMspaceApi = async (operation: string) => {
    setIsRunning(true);
    try {
      console.log(`🧪 Testing MSpace API operation: ${operation}`);

      const { data, error } = await supabase.functions.invoke(
        "mspace-accounts",
        {
          body: { operation },
        },
      );

      if (error) {
        console.error(`❌ ${operation} failed:`, error);
        return { success: false, error: error.message, details: error };
      }

      console.log(`✅ ${operation} succeeded:`, data);
      return { success: true, data };
    } catch (error: any) {
      console.error(`💥 ${operation} exception:`, error);
      return { success: false, error: error.message, exception: true };
    } finally {
      setIsRunning(false);
    }
  };

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      steps: [],
    };

    try {
      // Step 1: Check authentication
      results.steps.push({ step: "Authentication Check", status: "running" });
      const authCheck = await checkCredentials();
      results.auth = authCheck;
      results.steps[results.steps.length - 1] = {
        step: "Authentication Check",
        status: authCheck.hasUser ? "success" : "failed",
        details: authCheck,
      };

      // Step 2: Check credentials
      results.steps.push({ step: "Credentials Check", status: "running" });
      const credentialsStatus = authCheck.hasCredentials ? "success" : "failed";
      results.steps[results.steps.length - 1] = {
        step: "Credentials Check",
        status: credentialsStatus,
        details: {
          hasCredentials: authCheck.hasCredentials,
          count: authCheck.credentialsCount,
          error: authCheck.credentialsError,
        },
      };

      // Step 3: Test balance check (simpler operation)
      results.steps.push({ step: "Balance Check", status: "running" });
      const balanceTest = await testMspaceApi("balance");
      results.balanceTest = balanceTest;
      results.steps[results.steps.length - 1] = {
        step: "Balance Check",
        status: balanceTest.success ? "success" : "failed",
        details: balanceTest,
      };

      // Step 4: Test reseller clients fetch
      if (balanceTest.success) {
        results.steps.push({
          step: "Reseller Clients Fetch",
          status: "running",
        });
        const resellerTest = await testMspaceApi("queryresellerclients");
        results.resellerTest = resellerTest;
        results.steps[results.steps.length - 1] = {
          step: "Reseller Clients Fetch",
          status: resellerTest.success ? "success" : "failed",
          details: resellerTest,
        };

        // Step 5: Test sub-accounts fetch
        results.steps.push({ step: "Sub-accounts Fetch", status: "running" });
        const subAccountTest = await testMspaceApi("querysubs");
        results.subAccountTest = subAccountTest;
        results.steps[results.steps.length - 1] = {
          step: "Sub-accounts Fetch",
          status: subAccountTest.success ? "success" : "failed",
          details: subAccountTest,
        };
      }

      setDebugResults(results);

      const successCount = results.steps.filter(
        (s: any) => s.status === "success",
      ).length;
      const totalSteps = results.steps.length;

      if (successCount === totalSteps) {
        toast.success(`All ${totalSteps} diagnostic steps passed!`);
      } else {
        toast.warning(
          `${successCount}/${totalSteps} diagnostic steps passed. Check details below.`,
        );
      }
    } catch (error: any) {
      console.error("💥 Diagnostic failed:", error);
      results.error = error.message;
      setDebugResults(results);
      toast.error(`Diagnostic failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Bug className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">MSpace Debug Panel</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={runFullDiagnostic}
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bug className="h-4 w-4 mr-2" />
            )}
            Run Full Diagnostic
          </Button>
          <Button
            onClick={() => fetchAndSyncClients.mutate()}
            disabled={fetchAndSyncClients.isPending}
            variant="default"
          >
            {fetchAndSyncClients.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Try Sync
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Current User</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.email || "Not authenticated"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">MSpace Credentials</p>
                <Badge
                  variant={
                    userCredentials?.data?.length ? "default" : "destructive"
                  }
                >
                  {userCredentials?.data?.length || 0} found
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Fetched Users</p>
                <p className="text-lg font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Error:</strong> {error.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="diagnostics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent>
              {debugResults ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Last run:{" "}
                    {new Date(debugResults.timestamp).toLocaleString()}
                  </div>

                  <div className="space-y-2">
                    {debugResults.steps.map((step: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getStepIcon(step.status)}
                          <span className="font-medium">{step.step}</span>
                        </div>
                        <Badge
                          variant={
                            step.status === "success"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {step.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {debugResults.error && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Diagnostic Error:</strong> {debugResults.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Run Full Diagnostic" to analyze the MSpace integration
                  issues.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Credentials Information</CardTitle>
            </CardHeader>
            <CardContent>
              {userCredentials?.data ? (
                <div className="space-y-4">
                  {userCredentials.data.map((cred: any) => (
                    <div key={cred.id} className="p-3 border rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong>Service:</strong> {cred.service_name}
                        </div>
                        <div>
                          <strong>Username:</strong> {cred.username}
                        </div>
                        <div>
                          <strong>Active:</strong>
                          <Badge
                            variant={cred.is_active ? "default" : "destructive"}
                            className="ml-2"
                          >
                            {cred.is_active ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <strong>Created:</strong>{" "}
                          {new Date(cred.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userCredentials?.error ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error loading credentials: {userCredentials.error.message}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No MSpace credentials found for your account.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw-data">
          <Card>
            <CardHeader>
              <CardTitle>Raw Debug Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(
                  {
                    debugResults,
                    currentUser: currentUser
                      ? {
                          id: currentUser.id,
                          email: currentUser.email,
                          created_at: currentUser.created_at,
                        }
                      : null,
                    userCredentials: userCredentials?.data || null,
                    users: users.slice(0, 3), // Show first 3 users only
                    error: error?.message,
                    isLoading,
                  },
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
