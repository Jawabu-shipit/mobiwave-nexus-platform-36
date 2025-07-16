import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function MspaceDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugCheck = async () => {
    setIsLoading(true);
    try {
      // Check user session
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("User check:", { user, userError });

      if (!user) {
        setDebugInfo({ error: "No authenticated user found" });
        return;
      }

      // Check for mspace credentials
      const { data: credentials, error: credError } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_name", "mspace")
        .eq("is_active", true);

      console.log("Credentials check:", { credentials, credError });

      // Test multiple functions to isolate the issue
      const testFunctions = async () => {
        const results: any = {};

        // Test debug credentials function first
        try {
          const { data, error } = await supabase.functions.invoke(
            "debug-mspace-credentials",
          );
          console.log("Debug credentials result:", { data, error });
          results.debugCredentials = {
            success: !error,
            data,
            error: error
              ? {
                  message: error.message,
                  details: error.details,
                  hint: error.hint,
                  code: error.code,
                }
              : null,
          };
        } catch (debugError: any) {
          console.error("Debug credentials function failed:", debugError);
          results.debugCredentials = {
            success: false,
            error: debugError.message || "Debug credentials error",
          };
        }

        // Test simple function
        try {
          const { data, error } = await supabase.functions.invoke(
            "test-mspace-balance",
          );
          console.log("Test function result:", { data, error });
          results.testFunction = {
            success: !error,
            data,
            error: error
              ? {
                  message: error.message,
                  details: error.details,
                  hint: error.hint,
                  code: error.code,
                }
              : null,
          };
        } catch (testError: any) {
          console.error("Test function failed:", testError);
          results.testFunction = {
            success: false,
            error: testError.message || "Test function error",
          };
        }

        // Test simplified mspace function
        try {
          const { data, error } = await supabase.functions.invoke(
            "mspace-balance-simple",
          );
          console.log("Simple function result:", { data, error });
          results.simpleFunction = {
            success: !error,
            data,
            error: error
              ? {
                  message: error.message,
                  details: error.details,
                  hint: error.hint,
                  code: error.code,
                }
              : null,
          };
        } catch (simpleError: any) {
          console.error("Simple function failed:", simpleError);
          results.simpleFunction = {
            success: false,
            error: simpleError.message || "Simple function error",
          };
        }

        // Test original function
        try {
          const { data, error } =
            await supabase.functions.invoke("mspace-balance");
          console.log("Original function result:", { data, error });
          results.originalFunction = {
            success: !error,
            data,
            error: error
              ? {
                  message: error.message,
                  details: error.details,
                  hint: error.hint,
                  code: error.code,
                }
              : null,
          };
        } catch (funcError: any) {
          console.error("Original function failed:", funcError);
          results.originalFunction = {
            success: false,
            error: funcError.message || "Original function error",
          };
        }

        return results;
      };

      const functionResults = await testFunctions();

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
        },
        credentials: {
          found: credentials && credentials.length > 0,
          count: credentials?.length || 0,
          error: credError?.message,
        },
        functionTests: functionResults,
      });
    } catch (error: any) {
      console.error("Debug check failed:", error);
      setDebugInfo({
        error: error.message || "Debug check failed",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCredentialsSetup = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No authenticated user");
        return;
      }

      // Insert test credentials
      const { error } = await supabase.from("api_credentials").upsert({
        user_id: user.id,
        service_name: "mspace",
        api_key_encrypted: "test:encrypted:key",
        additional_config: { username: "testuser" },
        is_active: true,
      });

      if (error) {
        toast.error("Failed to create test credentials: " + error.message);
      } else {
        toast.success("Test credentials created");
        runDebugCheck();
      }
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mspace API Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebugCheck} disabled={isLoading}>
            {isLoading ? "Checking..." : "Run Debug Check"}
          </Button>
          <Button variant="outline" onClick={testCredentialsSetup}>
            Create Test Credentials
          </Button>
        </div>

        {debugInfo && (
          <Alert>
            <AlertDescription>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
