import React, { useState } from "react";
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
import { RefreshCw, CreditCard, Key, User, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MspaceAPITester } from "./MspaceAPITester";

export function MspaceCreditsManagerSimple() {
  const [balance, setBalance] = useState<number | null>(null);
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
      console.log("Testing credentials via edge function...");

      // Try the edge function with manual credentials
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

      // Debug: Log the raw API response
      console.log("Raw balance API response:", data);

      // Parse balance from response
      let balanceValue: number;
      if (data?.result && data.raw) {
        balanceValue = parseInt(data.result.trim());
      } else if (data?.smsBalance !== undefined) {
        // Use smsBalance field from API response
        balanceValue = parseInt(data.smsBalance);
      } else if (data?.balance !== undefined) {
        // Fallback to balance field
        balanceValue = parseInt(data.balance);
      } else {
        throw new Error(
          "Unexpected response format - no balance or smsBalance field found",
        );
      }

      if (isNaN(balanceValue)) {
        throw new Error("Invalid balance value received");
      }

      setBalance(balanceValue);
      setLastUpdated(new Date().toISOString());
      toast.success(`✅ Live Balance: ${balanceValue.toLocaleString()} SMS`, {
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

  const formatBalance = (balance: number | null) => {
    if (balance === null) return "Not checked";
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
            Test your credentials and check SMS balance
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
          <CardDescription>
            Enter your mspace API credentials to check balance and test
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
            size="lg"
          >
            {isTestingManual ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking Balance...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Balance
              </>
            )}
          </Button>

          {balance !== null && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Test successful! Your credentials are working correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Balance Display */}
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
              Last checked: {formatLastUpdated(lastUpdated)}
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
