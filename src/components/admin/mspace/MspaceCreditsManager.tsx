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
import { useMspaceIntegration } from "@/hooks/mspace/useMspaceIntegration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MspaceDebugger } from "./MspaceDebugger";
import { MspaceAPITester } from "./MspaceAPITester";
// MspaceCredentialsSetup removed - using existing ApiCredentialsTab instead

export function MspaceCreditsManager() {
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [manualApiKey, setManualApiKey] = useState("");
  const [manualUsername, setManualUsername] = useState("");
  const [useManualCredentials, setUseManualCredentials] = useState(false);
  const [isTestingManual, setIsTestingManual] = useState(false);
  const {
    checkBalance,
    hasCredentials,
    hasEncryptedCredentials,
    credentialsError,
    isLoading,
    canUseDirectAPI,
    needsManualTesting,
  } = useMspaceIntegration();

  const loadBalance = async () => {
    if (!canUseDirectAPI) {
      if (hasEncryptedCredentials) {
        toast.info(
          "📝 Encrypted credentials detected. Use manual testing below.",
        );
      } else {
        toast.error("Please configure your Mspace API credentials first");
      }
      return;
    }

    try {
      const result = await checkBalance.mutateAsync();
      setBalance(result.balance);
      setLastUpdated(result.timestamp);
    } catch (error: any) {
      console.error("Failed to load balance:", error);
      // Try to provide helpful feedback
      toast.error("⚠️ Edge function failed. Use manual testing below.", {
        description: "The backend API call encountered an issue",
      });
    }
  };

  const testManualCredentials = async () => {
    if (!manualApiKey.trim() || !manualUsername.trim()) {
      toast.error("Please enter both API key and username");
      return;
    }

    setIsTestingManual(true);

    try {
      console.log("Testing credentials via edge function...");

      // Try the edge function first
      const { data, error } = await supabase.functions.invoke("mspace-proxy", {
        body: {
          endpoint: "https://api.mspace.co.ke/smsapi/v2/balance",
          apiKey: manualApiKey.trim(),
          username: manualUsername.trim(),
          operation: "balance",
        },
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Parse balance from response
      let balanceValue: number;
      if (data?.result && data.raw) {
        balanceValue = parseInt(data.result.trim());
      } else if (data?.balance !== undefined) {
        balanceValue = parseInt(data.balance);
      } else {
        throw new Error("Unexpected response format");
      }

      if (isNaN(balanceValue)) {
        throw new Error("Invalid balance value received");
      }

      setBalance(balanceValue);
      setLastUpdated(new Date().toISOString());
      setUseManualCredentials(true);
      toast.success(`✅ Live Balance: ${balanceValue.toLocaleString()} SMS`, {
        description: "Retrieved via backend proxy",
      });
    } catch (error: any) {
      console.error("Manual test failed:", error);
      toast.error(`❌ Backend test failed: ${error.message}`, {
        description: "Use the API tester tools below for external testing",
      });
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
        <h3 className="text-lg font-semibold mb-4">API Testing Tools</h3>
        <MspaceAPITester />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
        <MspaceDebugger />
      </div>
    </div>
  );
}
