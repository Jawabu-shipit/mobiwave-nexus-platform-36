import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CreditCard, AlertCircle } from "lucide-react";
import { useMspaceBalance } from "@/hooks/mspace/useMspaceBalance";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MspaceDebugger } from "./MspaceDebugger";

export function MspaceCreditsManager() {
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { checkBalance, isLoading, lastError } = useMspaceBalance();

  const loadBalance = async () => {
    try {
      const balanceData = await checkBalance();
      setBalance(balanceData.balance);
      setLastUpdated(balanceData.timestamp || new Date().toISOString());
      toast.success("Balance updated successfully");
    } catch (error: any) {
      console.error("Failed to load balance:", error);
      if (error.message?.includes("credentials not configured")) {
        toast.error("Please configure your Mspace API credentials first");
      } else {
        toast.error("Failed to load balance: " + error.message);
      }
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

      {lastError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error checking balance: {lastError.error} ({lastError.errorType})
          </AlertDescription>
        </Alert>
      )}

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

      <MspaceDebugger />
    </div>
  );
}
