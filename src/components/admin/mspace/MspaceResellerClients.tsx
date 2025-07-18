import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Users, AlertCircle } from "lucide-react";
import { useMspaceDirectApi } from "@/hooks/mspace/useMspaceDirectApi";

interface ResellerClient {
  clientUserName: string;
  balance: string;
  status?: string;
}

export function MspaceResellerClients() {
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { getResellerClients, hasCredentials, credentialsError, isLoading } =
    useMspaceDirectApi();

  const loadClients = async () => {
    if (!hasCredentials) {
      return;
    }

    try {
      const result = await getResellerClients.mutateAsync();
      setClients(result);
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error("Failed to load reseller clients:", error);
      // Error is already handled by the mutation's onError
    }
  };

  const formatBalance = (balance: string) => {
    const numBalance = parseInt(balance);
    return isNaN(numBalance) ? balance : numBalance.toLocaleString();
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
            View and manage your reseller client accounts
          </p>
        </div>
        <Button
          onClick={loadClients}
          disabled={isLoading || !hasCredentials}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Loading..." : "Load Clients"}
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

      {!hasCredentials && !credentialsError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please configure your Mspace API credentials first in the admin
            panel.
          </AlertDescription>
        </Alert>
      )}

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
                No reseller clients
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasCredentials
                  ? 'Click "Load Clients" to fetch your reseller clients.'
                  : "Configure your credentials first."}
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
                    <TableCell>{formatBalance(client.balance)} SMS</TableCell>
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

      <Card>
        <CardHeader>
          <CardTitle>About Reseller Clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Reseller clients are sub-accounts under your main Mspace account.
            You can manage their SMS balances and monitor their usage.
          </p>
          <p className="text-sm text-muted-foreground">
            This data is fetched directly from the Mspace API using your
            configured credentials.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
