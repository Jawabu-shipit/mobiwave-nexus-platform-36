import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Play,
  Pause,
  Settings,
  Users,
  Database,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface SyncOperation {
  id: string;
  operation_type: string;
  operation_status: string;
  initiated_at: string;
  completed_at: string | null;
  total_clients_processed: number;
  successful_syncs: number;
  failed_syncs: number;
  new_clients_added: number;
  clients_updated: number;
  error_message: string | null;
}

interface SyncedClient {
  id: string;
  mspace_client_id: string;
  client_name: string;
  balance: number;
  previous_balance: number;
  user_type: string;
  status: string;
  sync_status: string;
  last_synced_at: string;
  profile_created: boolean;
  api_credentials_assigned: boolean;
  assigned_api_credential_id: string | null;
}

interface SyncConfig {
  id: string;
  config_key: string;
  config_value: any;
  description: string;
  is_active: boolean;
}

export const MspaceSyncManager: React.FC = () => {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch sync operations
  const { data: syncOperations = [], isLoading: isLoadingSyncOps } = useQuery({
    queryKey: ["mspace-sync-operations"],
    queryFn: async (): Promise<SyncOperation[]> => {
      const { data, error } = await supabase
        .from("mspace_sync_operations")
        .select("*")
        .order("initiated_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch synced clients
  const { data: syncedClients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["mspace-synced-clients"],
    queryFn: async (): Promise<SyncedClient[]> => {
      const { data, error } = await supabase
        .from("mspace_reseller_clients")
        .select("*")
        .order("last_synced_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch sync configuration
  const { data: syncConfig = [], isLoading: isLoadingConfig } = useQuery({
    queryKey: ["mspace-sync-config"],
    queryFn: async (): Promise<SyncConfig[]> => {
      const { data, error } = await supabase
        .from("mspace_sync_config")
        .select("*")
        .order("config_key");

      if (error) throw error;
      return data || [];
    },
  });

  // Manual sync mutation
  const manualSyncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "mspace-sync-scheduler",
        {
          body: { trigger_type: "manual" },
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Manual sync started successfully! Operation ID: ${data.operation_id}`,
      );
      queryClient.invalidateQueries({ queryKey: ["mspace-sync-operations"] });
      queryClient.invalidateQueries({ queryKey: ["mspace-synced-clients"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to start manual sync: ${error.message}`);
    },
  });

  // Sync specific clients mutation
  const syncClientsMutation = useMutation({
    mutationFn: async ({ saveToDatabase }: { saveToDatabase: boolean }) => {
      // Call both endpoints to sync reseller clients and sub-accounts
      const [resellerResponse, subAccountResponse] = await Promise.all([
        supabase.functions.invoke("mspace-accounts-enhanced", {
          body: {
            operation: "queryresellerclients",
            saveToDatabase,
          },
        }),
        supabase.functions.invoke("mspace-accounts-enhanced", {
          body: {
            operation: "querysubs",
            saveToDatabase,
          },
        }),
      ]);

      if (resellerResponse.error) throw resellerResponse.error;
      if (subAccountResponse.error) throw subAccountResponse.error;

      return {
        reseller: resellerResponse.data,
        subAccounts: subAccountResponse.data,
      };
    },
    onSuccess: (data) => {
      const totalSynced =
        (data.reseller?.sync_results?.total || 0) +
        (data.subAccounts?.sync_results?.total || 0);
      toast.success(`Successfully synced ${totalSynced} clients to database!`);
      queryClient.invalidateQueries({ queryKey: ["mspace-synced-clients"] });
      queryClient.invalidateQueries({ queryKey: ["mspace-sync-operations"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to sync clients: ${error.message}`);
    },
  });

  // Update sync config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({
      configKey,
      configValue,
    }: {
      configKey: string;
      configValue: any;
    }) => {
      const { error } = await supabase
        .from("mspace_sync_config")
        .update({
          config_value: JSON.stringify(configValue),
          updated_at: new Date().toISOString(),
        })
        .eq("config_key", configKey);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configuration updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["mspace-sync-config"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update configuration: ${error.message}`);
    },
  });

  // Assign API credentials mutation
  const assignCredentialsMutation = useMutation({
    mutationFn: async ({
      clientId,
      credentialId,
    }: {
      clientId: string;
      credentialId: string | null;
    }) => {
      const { error } = await supabase
        .from("mspace_reseller_clients")
        .update({
          assigned_api_credential_id: credentialId,
          api_credentials_assigned: credentialId !== null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("API credentials assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["mspace-synced-clients"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to assign credentials: ${error.message}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "synced":
        return "bg-green-500";
      case "running":
      case "pending":
        return "bg-blue-500";
      case "failed":
      case "error":
        return "bg-red-500";
      case "partial":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const enableAutoSync = async () => {
    await updateConfigMutation.mutateAsync({
      configKey: "enable_auto_sync",
      configValue: true,
    });
    setIsAutoSyncEnabled(true);
  };

  const disableAutoSync = async () => {
    await updateConfigMutation.mutateAsync({
      configKey: "enable_auto_sync",
      configValue: false,
    });
    setIsAutoSyncEnabled(false);
  };

  useEffect(() => {
    const autoSyncConfig = syncConfig.find(
      (c) => c.config_key === "enable_auto_sync",
    );
    if (autoSyncConfig) {
      setIsAutoSyncEnabled(JSON.parse(autoSyncConfig.config_value));
    }
  }, [syncConfig]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">MSpace Sync Management</h2>
        <div className="flex items-center gap-2">
          <Badge
            variant={isAutoSyncEnabled ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {isAutoSyncEnabled ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            Auto Sync: {isAutoSyncEnabled ? "Enabled" : "Disabled"}
          </Badge>
          <Button
            onClick={isAutoSyncEnabled ? disableAutoSync : enableAutoSync}
            variant={isAutoSyncEnabled ? "destructive" : "default"}
            size="sm"
          >
            {isAutoSyncEnabled ? (
              <Pause className="h-4 w-4 mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {isAutoSyncEnabled ? "Disable" : "Enable"} Auto Sync
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Quick Sync
                </p>
                <p className="text-2xl font-bold">{syncedClients.length}</p>
                <p className="text-xs text-muted-foreground">
                  clients in database
                </p>
              </div>
              <Button
                onClick={() => manualSyncMutation.mutate()}
                disabled={manualSyncMutation.isPending}
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${manualSyncMutation.isPending ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Manual Fetch & Save
                </p>
                <Button
                  onClick={() =>
                    syncClientsMutation.mutate({ saveToDatabase: true })
                  }
                  disabled={syncClientsMutation.isPending}
                  size="sm"
                  className="mt-2"
                >
                  <Database className="h-4 w-4 mr-1" />
                  Fetch & Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Latest Sync
                </p>
                <p className="text-sm">
                  {syncOperations[0]
                    ? format(new Date(syncOperations[0].initiated_at), "PPpp")
                    : "Never"}
                </p>
                <Badge
                  variant="outline"
                  className={getStatusColor(
                    syncOperations[0]?.operation_status || "unknown",
                  )}
                >
                  {syncOperations[0]?.operation_status || "Unknown"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Synced Clients
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Sync Operations
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Synced Clients ({syncedClients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {syncedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{client.client_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {client.user_type.replace("_", " ")}
                            </Badge>
                            <span>Balance: {client.balance}</span>
                            {client.previous_balance !== client.balance && (
                              <span
                                className={
                                  client.balance > client.previous_balance
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                (
                                {client.balance > client.previous_balance
                                  ? "+"
                                  : ""}
                                {(
                                  client.balance - client.previous_balance
                                ).toFixed(2)}
                                )
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            client.sync_status === "synced"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {client.sync_status}
                        </Badge>
                        {client.profile_created && (
                          <Badge variant="secondary">Profile Created</Badge>
                        )}
                        {client.api_credentials_assigned && (
                          <Badge variant="default">API Assigned</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(client.last_synced_at), "PPpp")}
                        </span>
                      </div>
                    </div>
                  ))}
                  {syncedClients.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No synced clients found. Run a sync operation to populate
                      this list.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Operations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSyncOps ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {syncOperations.map((operation) => (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {operation.operation_type.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={getStatusColor(
                              operation.operation_status,
                            )}
                          >
                            {operation.operation_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Started:{" "}
                          {format(new Date(operation.initiated_at), "PPpp")}
                          {operation.completed_at && (
                            <>
                              {" "}
                              • Completed:{" "}
                              {format(new Date(operation.completed_at), "PPpp")}
                            </>
                          )}
                        </p>
                        {operation.error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            {operation.error_message}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p>Processed: {operation.total_clients_processed}</p>
                        <p className="text-green-600">
                          Success: {operation.successful_syncs}
                        </p>
                        <p className="text-red-600">
                          Failed: {operation.failed_syncs}
                        </p>
                        <p className="text-blue-600">
                          New: {operation.new_clients_added}
                        </p>
                      </div>
                    </div>
                  ))}
                  {syncOperations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No sync operations found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingConfig ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {syncConfig.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {config.config_key.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={config.is_active ? "default" : "secondary"}
                        >
                          {typeof config.config_value === "object"
                            ? JSON.stringify(config.config_value)
                            : String(config.config_value)}
                        </Badge>
                        <Badge
                          variant={config.is_active ? "default" : "destructive"}
                        >
                          {config.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
