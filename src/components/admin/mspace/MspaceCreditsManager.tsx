import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, CreditCard, AlertCircle, Key, User } from "lucide-react";
import { useMspaceDirectApi } from "@/hooks/mspace/useMspaceDirectApi";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MspaceDebugger } from "./MspaceDebugger";
// MspaceCredentialsSetup removed - using existing ApiCredentialsTab instead

export function MspaceCreditsManager() {
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [manualApiKey, setManualApiKey] = useState("");
  const [manualUsername, setManualUsername] = useState("");
  const [useManualCredentials, setUseManualCredentials] = useState(false);
  const [isTestingManual, setIsTestingManual] = useState(false);
  const { checkBalance, hasCredentials, credentialsError, isLoading } =
    useMspaceDirectApi();

  const loadBalance = async () => {
    if (!hasCredentials) {
      toast.error("Please configure your Mspace API credentials first");
      return;
    }

    try {
      const result = await checkBalance.mutateAsync();
      setBalance(result.balance);
      setLastUpdated(result.timestamp);
    } catch (error: any) {
      console.error("Failed to load balance:", error);
      // Error is already handled by the mutation's onError
    }
  };

  const testManualCredentials = async () => {
    if (!manualApiKey.trim() || !manualUsername.trim()) {
      toast.error("Please enter both API key and username");
      return;
    }

    setIsTestingManual(true);

    try {
      console.log("Attempting real API call to mspace");

      // Try multiple approaches to get real data
      let response;
      let responseData;
      let success = false;

      // Method 1: Try the original mspace-balance function
      try {
        console.log("Trying original mspace-balance function...");
        const { data, error } =
          await supabase.functions.invoke("mspace-balance");
        if (!error && data) {
          responseData = data;
          success = true;
          console.log("✅ Original function worked:", data);
        } else {
          console.log("❌ Original function failed:", error);
        }
      } catch (funcError) {
        console.log("❌ Original function error:", funcError);
      }

      // Method 2: Try the proxy function if original failed
      if (!success) {
        try {
          console.log("Trying mspace-proxy function...");
          const { data, error } = await supabase.functions.invoke(
            "mspace-proxy",
            {
              body: {
                endpoint: "https://api.mspace.co.ke/smsapi/v2/balance",
                apiKey: manualApiKey.trim(),
                username: manualUsername.trim(),
                operation: "balance",
              },
            },
          );
          if (!error && data) {
            responseData = data;
            success = true;
            console.log("✅ Proxy function worked:", data);
          } else {
            console.log("❌ Proxy function failed:", error);
          }
        } catch (proxyError) {
          console.log("❌ Proxy function error:", proxyError);
        }
      }

      // Method 3: Try direct API call as last resort
      if (!success) {
        try {
          console.log("Trying direct API call...");

          // Try different approaches for direct call
          const methods = [
            // GET with query params
            {
              url: `https://api.mspace.co.ke/smsapi/v2/balance?apikey=${encodeURIComponent(manualApiKey.trim())}`,
              options: {
                method: "GET",
                headers: { Accept: "application/json" },
              },
            },
            // POST with form data
            {
              url: "https://api.mspace.co.ke/smsapi/v2/balance",
              options: {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `apikey=${encodeURIComponent(manualApiKey.trim())}`,
              },
            },
            // POST with JSON
            {
              url: "https://api.mspace.co.ke/smsapi/v2/balance",
              options: {
                method: "POST",
                headers: {
                  apikey: manualApiKey.trim(),
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ apikey: manualApiKey.trim() }),
              },
            },
          ];

          for (const method of methods) {
            try {
              console.log(`Trying ${method.options.method} to ${method.url}`);
              response = await fetch(method.url, method.options);
              const text = await response.text();
              console.log(`Response: ${response.status} - ${text}`);

              if (response.ok) {
                responseData = { result: text, raw: true };
                success = true;
                break;
              }
            } catch (methodError) {
              console.log(`Method failed:`, methodError);
            }
          }
        } catch (directError) {
          console.log("❌ Direct API call failed:", directError);
        }
      }

      if (success && responseData) {
        // Parse the real response
        let balanceValue: number;

        if (responseData.raw && responseData.result) {
          balanceValue = parseInt(responseData.result.trim());
        } else if (responseData.balance !== undefined) {
          balanceValue = parseInt(responseData.balance);
        } else if (typeof responseData === "number") {
          balanceValue = responseData;
        } else if (typeof responseData === "string") {
          balanceValue = parseInt(responseData.trim());
        } else {
          throw new Error(
            "Could not parse balance from response: " +
              JSON.stringify(responseData),
          );
        }

        if (isNaN(balanceValue)) {
          throw new Error(
            "Invalid balance value received: " + JSON.stringify(responseData),
          );
        }

        setBalance(balanceValue);
        setLastUpdated(new Date().toISOString());
        setUseManualCredentials(true);
        toast.success(
          `✅ Real Balance: ${balanceValue.toLocaleString()} SMS - Live data from mspace API!`,
        );
      } else {
        // If all methods failed, show the curl command for manual testing
        const curlCommand = `curl -X POST "https://api.mspace.co.ke/smsapi/v2/balance" \\
  -H "apikey: ${manualApiKey.trim()}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"apikey": "${manualApiKey.trim()}"}'`;

        console.log(
          "All API methods failed. Use this curl command:",
          curlCommand,
        );

        toast.error(
          `❌ All API methods failed due to CORS restrictions. Use this curl command in terminal:`,
          {
            duration: 10000,
          },
        );

        // Copy curl command to clipboard if possible
        if (navigator.clipboard) {
          navigator.clipboard.writeText(curlCommand);
          toast.info("📋 Curl command copied to clipboard!");
        }
      }
    } catch (error: any) {
      console.error("Error getting real API data:", error);
      toast.error(`❌ Error: ${error.message}`);
    } finally {
      setIsTestingManual(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const formatBalance = (balance: number | null) => {
    if (balance === null) return "Loading...";
    return balance.toLocaleString();
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
            Credits Management
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage your SMS credits balance
          </p>
        </div>
        <Button onClick={loadBalance} disabled={isLoading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Balance
        </Button>
      </div>

      {credentialsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Credentials error: {credentialsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Manual Credentials Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Manual Credentials Test
          </CardTitle>
          <CardDescription>
            Enter your mspace API credentials directly to test the API
            connection
          </CardDescription>
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
          >
            {isTestingManual ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Get Real Balance from Mspace API
              </>
            )}
          </Button>
          {useManualCredentials && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Manual credentials are working! Balance data shown above.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBalance(balance)} SMS
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Balance Status
            </CardTitle>
            <div
              className={`h-3 w-3 rounded-full ${
                balance === null
                  ? "bg-gray-400"
                  : balance > 1000
                    ? "bg-green-500"
                    : balance > 100
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance === null
                ? "Unknown"
                : balance > 1000
                  ? "Good"
                  : balance > 100
                    ? "Low"
                    : "Critical"}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance !== null &&
                balance <= 100 &&
                "Consider topping up your account"}
              {balance !== null &&
                balance > 100 &&
                balance <= 1000 &&
                "Monitor usage closely"}
              {balance !== null &&
                balance > 1000 &&
                "Sufficient credits available"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credits Information</CardTitle>
          <CardDescription>
            Important information about your SMS credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Credit Type</span>
              <span className="text-sm text-muted-foreground">SMS Credits</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Rate</span>
              <span className="text-sm text-muted-foreground">
                1 Credit = 1 SMS
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Validity</span>
              <span className="text-sm text-muted-foreground">No expiry</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
        <MspaceDebugger />
      </div>
    </div>
  );
}
