import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Database,
  User,
  Key,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MspaceQuickDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Check current user
  const { data: currentUser } = useQuery({
    queryKey: ["current-user-debug"],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      return { user, error };
    },
  });

  // Check if api_credentials table exists
  const { data: tableCheck } = useQuery({
    queryKey: ["table-check"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("api_credentials")
          .select("count(*)")
          .limit(1);
        return { exists: !error, error: error?.message };
      } catch (error: any) {
        return { exists: false, error: error.message };
      }
    },
  });

  // Check if user has credentials
  const { data: credentialsCheck } = useQuery({
    queryKey: ["credentials-check", currentUser?.user?.id],
    queryFn: async () => {
      if (!currentUser?.user?.id) return null;

      try {
        const { data, error } = await supabase
          .from("api_credentials")
          .select("*")
          .eq("user_id", currentUser.user.id)
          .eq("service_name", "mspace");
        return { data, error: error?.message, count: data?.length || 0 };
      } catch (error: any) {
        return { data: null, error: error.message, count: 0 };
      }
    },
    enabled: !!currentUser?.user?.id,
  });

  const runDiagnostic = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
    };

    try {
      // Test 1: Check authentication
      results.tests.push({
        name: "User Authentication",
        status: currentUser?.user ? "pass" : "fail",
        details: currentUser?.user
          ? `Authenticated as ${currentUser.user.email}`
          : "Not authenticated",
      });

      // Test 2: Check database connection
      results.tests.push({
        name: "Database Connection",
        status: tableCheck?.exists ? "pass" : "fail",
        details: tableCheck?.exists
          ? "api_credentials table accessible"
          : `Table error: ${tableCheck?.error}`,
      });

      // Test 3: Check credentials
      results.tests.push({
        name: "MSpace Credentials",
        status: credentialsCheck?.count > 0 ? "pass" : "fail",
        details:
          credentialsCheck?.count > 0
            ? `Found ${credentialsCheck.count} credentials`
            : "No MSpace credentials found",
      });

      // Test 4: Test basic edge function (without MSpace operations)
      try {
        const { data, error } = await supabase.functions.invoke(
          "mspace-accounts",
          {
            body: { operation: "balance" },
          },
        );

        results.tests.push({
          name: "Edge Function Basic Call",
          status: !error ? "pass" : "fail",
          details: !error
            ? "Function accessible"
            : `Function error: ${error.message}`,
        });
      } catch (error: any) {
        results.tests.push({
          name: "Edge Function Basic Call",
          status: "fail",
          details: `Function call failed: ${error.message}`,
        });
      }

      // Test 5: Test with actual MSpace call (if credentials exist)
      if (credentialsCheck?.count > 0) {
        try {
          const { data, error } = await supabase.functions.invoke(
            "mspace-accounts",
            {
              body: { operation: "queryresellerclients" },
            },
          );

          results.tests.push({
            name: "MSpace API Call",
            status: !error ? "pass" : "fail",
            details: !error
              ? `Success: ${JSON.stringify(data).substring(0, 100)}...`
              : `API error: ${error.message}`,
          });
        } catch (error: any) {
          results.tests.push({
            name: "MSpace API Call",
            status: "fail",
            details: `API call failed: ${error.message}`,
          });
        }
      } else {
        results.tests.push({
          name: "MSpace API Call",
          status: "skip",
          details: "Skipped - no credentials configured",
        });
      }

      setTestResults(results);
    } catch (error: any) {
      setTestResults({
        timestamp: new Date().toISOString(),
        error: error.message,
        tests: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "fail":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "skip":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendation = () => {
    if (!testResults?.tests) return null;

    const authTest = testResults.tests.find(
      (t: any) => t.name === "User Authentication",
    );
    const dbTest = testResults.tests.find(
      (t: any) => t.name === "Database Connection",
    );
    const credTest = testResults.tests.find(
      (t: any) => t.name === "MSpace Credentials",
    );
    const funcTest = testResults.tests.find(
      (t: any) => t.name === "Edge Function Basic Call",
    );

    if (authTest?.status === "fail") {
      return {
        type: "error",
        title: "Authentication Required",
        message: "Please log in to continue with MSpace setup.",
      };
    }

    if (dbTest?.status === "fail") {
      return {
        type: "error",
        title: "Database Migration Required",
        message:
          "The database migrations have not been run yet. Please run: supabase db push",
      };
    }

    if (funcTest?.status === "fail") {
      return {
        type: "error",
        title: "Edge Function Deployment Required",
        message:
          "The edge functions need to be deployed. Please run: supabase functions deploy",
      };
    }

    if (credTest?.status === "fail") {
      return {
        type: "warning",
        title: "Credentials Setup Required",
        message:
          "You need to configure your MSpace API credentials using the form below.",
      };
    }

    return {
      type: "success",
      title: "System Ready",
      message: "All tests passed! Your MSpace integration should be working.",
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MSpace Integration Diagnostic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Run this diagnostic to identify the exact issue with your MSpace
              integration.
            </p>
            <Button onClick={runDiagnostic} disabled={isRunning} size="sm">
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-1" />
              )}
              {isRunning ? "Running..." : "Run Diagnostic"}
            </Button>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 p-2 border rounded">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs font-medium">User</p>
                <Badge
                  variant={currentUser?.user ? "default" : "destructive"}
                  className="text-xs"
                >
                  {currentUser?.user ? "Logged In" : "Not Logged In"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded">
              <Database className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs font-medium">Database</p>
                <Badge
                  variant={tableCheck?.exists ? "default" : "destructive"}
                  className="text-xs"
                >
                  {tableCheck?.exists ? "Connected" : "Error"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded">
              <Key className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs font-medium">Credentials</p>
                <Badge
                  variant={
                    credentialsCheck?.count > 0 ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {credentialsCheck?.count || 0} Found
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded">
              <Settings className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs font-medium">Functions</p>
                <Badge variant="outline" className="text-xs">
                  Testing...
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.error ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Diagnostic Error:</strong> {testResults.error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {testResults.tests.map((test: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          test.status === "pass"
                            ? "default"
                            : test.status === "fail"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {test.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                        {test.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      {recommendation && (
        <Alert>
          {recommendation.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : recommendation.type === "warning" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <strong>{recommendation.title}:</strong> {recommendation.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Raw Data */}
      {testResults && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Show Raw Diagnostic Data
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
