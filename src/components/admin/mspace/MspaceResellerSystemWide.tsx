import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database,
  Settings,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SystemMspaceCredentials } from "./SystemMspaceCredentials";

interface ResellerClient {
  clientUserName: string;
  smsBalance: string;
  [key: string]: any;
}

interface SubAccount {
  subAccUser: string;
  smsBalance: string;
  [key: string]: any;
}

export const MspaceResellerSystemWide: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Check if system credentials are configured
  const { data: hasSystemCredentials, isLoading: isCheckingCredentials } =
    useQuery({
      queryKey: ["system-credentials-check"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("api_credentials")
          .select("id")
          .eq("service_name", "mspace_system")
          .eq("is_active", true)
          .single();

        return !error && !!data;
      },
    });

  // Fetch reseller clients using system credentials
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    error: clientsError,
  } = useQuery({
    queryKey: ["system-mspace-clients"],
    queryFn: async (): Promise<{
      resellerClients: ResellerClient[];
      subAccounts: SubAccount[];
    }> => {
      // Call both reseller clients and sub-accounts
      const [resellerResponse, subAccountResponse] = await Promise.all([
        supabase.functions.invoke("mspace-accounts", {
          body: {
            operation: "queryresellerclients",
            useSystemCredentials: true,
          },
        }),
        supabase.functions.invoke("mspace-accounts", {
          body: {
            operation: "querysubs",
            useSystemCredentials: true,
          },
        }),
      ]);

      const result = {
        resellerClients: [],
        subAccounts: [],
      };

      if (resellerResponse.error) {
        throw new Error(`Reseller clients: ${resellerResponse.error.message}`);
      }
      if (resellerResponse.data?.resellerClients) {
        result.resellerClients = resellerResponse.data.resellerClients;
      }

      if (subAccountResponse.error) {
        console.warn("Sub-accounts fetch failed:", subAccountResponse.error);
      } else if (subAccountResponse.data?.subUsers) {
        result.subAccounts = subAccountResponse.data.subUsers;
      }

      return result;
    },
    enabled: !!hasSystemCredentials,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onSuccess: () => {
      setLastUpdated(new Date().toISOString());
    },
  });

  // Manual refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({ queryKey: ["system-mspace-clients"] });
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Client data refreshed successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to refresh: ${error.message}`);
    },
  });

  // Sync to database mutation
  const syncToDbMutation = useMutation({
    mutationFn: async () => {
      if (!clientsData) {
        throw new Error("No client data available to sync");
      }

      // Use the enhanced mspace-accounts function to sync data
      const [resellerSync, subAccountSync] = await Promise.all([
        supabase.functions.invoke("mspace-accounts-enhanced", {
          body: {
            operation: "queryresellerclients",
            saveToDatabase: true,
            useSystemCredentials: true,
          },
        }),
        supabase.functions.invoke("mspace-accounts-enhanced", {
          body: {
            operation: "querysubs",
            saveToDatabase: true,
            useSystemCredentials: true,
          },
        }),
      ]);

      if (resellerSync.error) {
        throw new Error(`Reseller sync failed: ${resellerSync.error.message}`);
      }

      if (subAccountSync.error) {
        console.warn("Sub-account sync failed:", subAccountSync.error);
      }

      return {
        resellerSynced: resellerSync.data?.sync_results?.total || 0,
        subAccountsSynced: subAccountSync.data?.sync_results?.total || 0,
      };
    },
    onSuccess: (data) => {
      const total = data.resellerSynced + data.subAccountsSynced;
      toast.success(`Successfully synced ${total} clients to database!`);
    },
    onError: (error: any) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  if (isCheckingCredentials) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mr-2" />
            <span>Checking system configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasSystemCredentials) {
    return (
      <div className="space-y-4">
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>System Configuration Required:</strong> Please configure the
            system-wide MSpace credentials below to enable reseller client
            management.
          </AlertDescription>
        </Alert>
        <SystemMspaceCredentials />
      </div>
    );
  }

  const totalClients =
    (clientsData?.resellerClients?.length || 0) +
    (clientsData?.subAccounts?.length || 0);
  const totalBalance = [
    ...(clientsData?.resellerClients || []),
    ...(clientsData?.subAccounts || []),
  ].reduce((sum, client) => {
    const balance = parseFloat(client.smsBalance || "0");
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  return (
    <div className="space-y-6">
      {/* System Status & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              MSpace Reseller Clients
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending || isLoadingClients}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${refreshMutation.isPending || isLoadingClients ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => syncToDbMutation.mutate()}
                disabled={
                  syncToDbMutation.isPending ||
                  !clientsData ||
                  totalClients === 0
                }
              >
                <Database className="h-4 w-4 mr-1" />
                Sync to DB
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">System Configured</p>
                <p className="text-sm text-muted-foreground">
                  Ready to fetch clients
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{totalClients} Clients</p>
                <p className="text-sm text-muted-foreground">
                  {clientsData?.resellerClients?.length || 0} resellers,{" "}
                  {clientsData?.subAccounts?.length || 0} subs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">
                  {totalBalance.toLocaleString()} SMS
                </p>
                <p className="text-sm text-muted-foreground">Total balance</p>
              </div>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {clientsError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading clients:</strong> {clientsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingClients && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mr-2" />
              <span>Loading reseller clients...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reseller Clients Display */}
      {clientsData &&
        clientsData.resellerClients &&
        clientsData.resellerClients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Reseller Clients ({clientsData.resellerClients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientsData.resellerClients.map((client) => (
                  <div
                    key={client.clientUserName}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{client.clientUserName}</p>
                      <Badge variant="outline">Reseller Client</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {parseFloat(client.smsBalance || "0").toLocaleString()}{" "}
                        SMS
                      </p>
                      <p className="text-sm text-muted-foreground">Balance</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Sub Accounts Display */}
      {clientsData &&
        clientsData.subAccounts &&
        clientsData.subAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sub Accounts ({clientsData.subAccounts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientsData.subAccounts.map((subAccount) => (
                  <div
                    key={subAccount.subAccUser}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{subAccount.subAccUser}</p>
                      <Badge variant="secondary">Sub Account</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {parseFloat(
                          subAccount.smsBalance || "0",
                        ).toLocaleString()}{" "}
                        SMS
                      </p>
                      <p className="text-sm text-muted-foreground">Balance</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Empty State */}
      {clientsData && totalClients === 0 && !isLoadingClients && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                Your MSpace account doesn't have any reseller clients or
                sub-accounts.
              </p>
              <Button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Credentials Management */}
      <SystemMspaceCredentials />
    </div>
  );
};
