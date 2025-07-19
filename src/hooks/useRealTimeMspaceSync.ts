import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SyncConflict {
  id: string;
  client_id: string;
  conflict_type:
    | "balance_mismatch"
    | "status_change"
    | "client_removed"
    | "duplicate_entry";
  local_data: any;
  remote_data: any;
  detected_at: string;
  resolved: boolean;
  resolution_action?: string;
  resolved_at?: string;
}

export interface SyncStatus {
  is_syncing: boolean;
  last_sync_at?: string;
  next_sync_at?: string;
  active_operations: number;
  failed_operations: number;
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
}

export interface RealTimeEvent {
  id: string;
  event_type:
    | "sync_started"
    | "sync_completed"
    | "sync_failed"
    | "conflict_detected"
    | "balance_updated";
  client_id?: string;
  message: string;
  timestamp: string;
  data?: any;
}

export const useRealTimeMspaceSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    is_syncing: false,
    active_operations: 0,
    failed_operations: 0,
    auto_sync_enabled: true,
    sync_interval_minutes: 30,
  });

  const [realtimeEvents, setRealtimeEvents] = useState<RealTimeEvent[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const queryClient = useQueryClient();

  // Subscribe to real-time sync operations
  useEffect(() => {
    const syncOpsChannel = supabase
      .channel("sync-operations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mspace_sync_operations" },
        (payload) => {
          console.log("Sync operation change:", payload);

          const operation = payload.new as any;
          const eventType = payload.eventType;

          if (eventType === "INSERT") {
            setSyncStatus((prev) => ({
              ...prev,
              is_syncing: true,
              active_operations: prev.active_operations + 1,
            }));

            addRealtimeEvent({
              event_type: "sync_started",
              message: `${operation.operation_type.replace("_", " ")} started`,
              data: operation,
            });
          } else if (eventType === "UPDATE") {
            const isCompleted = ["completed", "failed", "partial"].includes(
              operation.operation_status,
            );

            if (isCompleted) {
              setSyncStatus((prev) => ({
                ...prev,
                is_syncing:
                  prev.active_operations <= 1 ? false : prev.is_syncing,
                active_operations: Math.max(0, prev.active_operations - 1),
                failed_operations:
                  operation.operation_status === "failed"
                    ? prev.failed_operations + 1
                    : prev.failed_operations,
                last_sync_at: operation.completed_at,
              }));

              const eventType =
                operation.operation_status === "failed"
                  ? "sync_failed"
                  : "sync_completed";
              addRealtimeEvent({
                event_type: eventType,
                message: `${operation.operation_type.replace("_", " ")} ${operation.operation_status}`,
                data: operation,
              });

              if (operation.operation_status === "failed") {
                toast.error(
                  `Sync failed: ${operation.error_message || "Unknown error"}`,
                );
              } else if (operation.operation_status === "completed") {
                toast.success(
                  `Sync completed: ${operation.successful_syncs} clients synced`,
                );
              }
            }
          }

          // Invalidate related queries
          queryClient.invalidateQueries({
            queryKey: ["mspace-sync-operations"],
          });
        },
      )
      .subscribe();

    // Subscribe to client data changes
    const clientsChannel = supabase
      .channel("mspace-clients")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mspace_reseller_clients" },
        (payload) => {
          console.log("Client change:", payload);

          const client = payload.new as any;
          const oldClient = payload.old as any;

          if (payload.eventType === "UPDATE") {
            // Check for balance changes
            if (oldClient && client.balance !== oldClient.balance) {
              addRealtimeEvent({
                event_type: "balance_updated",
                client_id: client.mspace_client_id,
                message: `Balance updated: ${oldClient.balance} → ${client.balance}`,
                data: {
                  old_balance: oldClient.balance,
                  new_balance: client.balance,
                },
              });
            }

            // Check for sync conflicts
            if (client.sync_status === "conflict") {
              detectSyncConflict(client, oldClient);
            }
          }

          // Invalidate client queries
          queryClient.invalidateQueries({ queryKey: ["mspace-users-stored"] });
          queryClient.invalidateQueries({
            queryKey: ["mspace-synced-clients"],
          });
        },
      )
      .subscribe();

    // Subscribe to sync configuration changes
    const configChannel = supabase
      .channel("sync-config")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mspace_sync_config" },
        (payload) => {
          console.log("Config change:", payload);

          const config = payload.new as any;

          if (config.config_key === "enable_auto_sync") {
            setSyncStatus((prev) => ({
              ...prev,
              auto_sync_enabled: JSON.parse(config.config_value),
            }));
          } else if (config.config_key === "sync_interval_minutes") {
            setSyncStatus((prev) => ({
              ...prev,
              sync_interval_minutes: JSON.parse(config.config_value),
            }));
          }

          queryClient.invalidateQueries({ queryKey: ["mspace-sync-config"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(syncOpsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(configChannel);
    };
  }, [queryClient]);

  // Get current sync status from database
  useQuery({
    queryKey: ["mspace-sync-status"],
    queryFn: async () => {
      // Get active operations
      const { data: activeOps } = await supabase
        .from("mspace_sync_operations")
        .select("*")
        .eq("operation_status", "running");

      // Get failed operations in last 24 hours
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data: failedOps } = await supabase
        .from("mspace_sync_operations")
        .select("*")
        .eq("operation_status", "failed")
        .gte("initiated_at", twentyFourHoursAgo);

      // Get latest completed sync
      const { data: latestSync } = await supabase
        .from("mspace_sync_operations")
        .select("*")
        .in("operation_status", ["completed", "partial"])
        .order("completed_at", { ascending: false })
        .limit(1);

      // Get sync configuration
      const { data: config } = await supabase
        .from("mspace_sync_config")
        .select("*")
        .in("config_key", ["enable_auto_sync", "sync_interval_minutes"]);

      const autoSyncEnabled = config?.find(
        (c) => c.config_key === "enable_auto_sync",
      );
      const syncInterval = config?.find(
        (c) => c.config_key === "sync_interval_minutes",
      );

      const status: SyncStatus = {
        is_syncing: (activeOps?.length || 0) > 0,
        active_operations: activeOps?.length || 0,
        failed_operations: failedOps?.length || 0,
        last_sync_at: latestSync?.[0]?.completed_at,
        auto_sync_enabled: autoSyncEnabled
          ? JSON.parse(autoSyncEnabled.config_value)
          : true,
        sync_interval_minutes: syncInterval
          ? JSON.parse(syncInterval.config_value)
          : 30,
      };

      // Calculate next sync time if auto sync is enabled
      if (status.auto_sync_enabled && status.last_sync_at) {
        const lastSync = new Date(status.last_sync_at);
        const nextSync = new Date(
          lastSync.getTime() + status.sync_interval_minutes * 60 * 1000,
        );
        status.next_sync_at = nextSync.toISOString();
      }

      setSyncStatus(status);
      return status;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Get unresolved conflicts
  useQuery({
    queryKey: ["mspace-sync-conflicts"],
    queryFn: async () => {
      // This would be from a conflicts table if we had one
      // For now, we'll check for clients with conflict status
      const { data: conflictClients } = await supabase
        .from("mspace_reseller_clients")
        .select("*")
        .eq("sync_status", "conflict");

      const detectedConflicts: SyncConflict[] =
        conflictClients?.map((client) => ({
          id: client.id,
          client_id: client.mspace_client_id,
          conflict_type: "balance_mismatch" as const,
          local_data: { balance: client.balance },
          remote_data: { balance: client.previous_balance },
          detected_at: client.updated_at,
          resolved: false,
        })) || [];

      setConflicts(detectedConflicts);
      return detectedConflicts;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  const addRealtimeEvent = (event: Omit<RealTimeEvent, "id" | "timestamp">) => {
    const newEvent: RealTimeEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    setRealtimeEvents((prev) => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
  };

  const detectSyncConflict = (newClient: any, oldClient: any) => {
    const conflict: SyncConflict = {
      id: `conflict-${newClient.id}-${Date.now()}`,
      client_id: newClient.mspace_client_id,
      conflict_type: "balance_mismatch",
      local_data: oldClient,
      remote_data: newClient,
      detected_at: new Date().toISOString(),
      resolved: false,
    };

    setConflicts((prev) => [conflict, ...prev]);

    addRealtimeEvent({
      event_type: "conflict_detected",
      client_id: newClient.mspace_client_id,
      message: `Sync conflict detected for ${newClient.client_name}`,
      data: conflict,
    });

    toast.warning(`Sync conflict detected for ${newClient.client_name}`);
  };

  const resolveConflict = async (
    conflictId: string,
    action: "use_local" | "use_remote" | "manual",
  ) => {
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    try {
      let updateData = {};

      switch (action) {
        case "use_local":
          updateData = {
            ...conflict.local_data,
            sync_status: "synced",
            updated_at: new Date().toISOString(),
          };
          break;
        case "use_remote":
          updateData = {
            ...conflict.remote_data,
            sync_status: "synced",
            updated_at: new Date().toISOString(),
          };
          break;
        case "manual":
          updateData = {
            sync_status: "pending",
            updated_at: new Date().toISOString(),
          };
          break;
      }

      // Update the client record
      await supabase
        .from("mspace_reseller_clients")
        .update(updateData)
        .eq("mspace_client_id", conflict.client_id);

      // Mark conflict as resolved
      setConflicts((prev) =>
        prev.map((c) =>
          c.id === conflictId
            ? {
                ...c,
                resolved: true,
                resolution_action: action,
                resolved_at: new Date().toISOString(),
              }
            : c,
        ),
      );

      addRealtimeEvent({
        event_type: "sync_completed",
        client_id: conflict.client_id,
        message: `Conflict resolved using ${action.replace("_", " ")}`,
      });

      toast.success(`Conflict resolved for ${conflict.client_id}`);
    } catch (error: any) {
      toast.error(`Failed to resolve conflict: ${error.message}`);
    }
  };

  return {
    syncStatus,
    realtimeEvents,
    conflicts: conflicts.filter((c) => !c.resolved),
    resolvedConflicts: conflicts.filter((c) => c.resolved),
    resolveConflict,

    // Helper methods
    clearEvents: () => setRealtimeEvents([]),
    isHealthy: syncStatus.failed_operations < 3 && !syncStatus.is_syncing,
    timeToNextSync: syncStatus.next_sync_at
      ? Math.max(0, new Date(syncStatus.next_sync_at).getTime() - Date.now())
      : null,

    // Statistics
    stats: {
      totalEvents: realtimeEvents.length,
      activeConflicts: conflicts.filter((c) => !c.resolved).length,
      resolvedConflicts: conflicts.filter((c) => c.resolved).length,
      syncHealth: syncStatus.failed_operations < 3 ? "healthy" : "degraded",
    },
  };
};
