import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MspaceUserEnhanced {
  id: string;
  mspace_client_id: string;
  client_name: string;
  username?: string;
  phone?: string;
  email?: string;
  balance: number;
  previous_balance: number;
  status: string;
  user_type: string;
  created_date?: string;
  last_login?: string;
  last_synced_at: string;
  sync_status: string;
  sync_error_message?: string;
  sync_attempts: number;
  profile_created: boolean;
  profile_user_id?: string;
  api_credentials_assigned: boolean;
  assigned_api_credential_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface SyncOperation {
  id: string;
  operation_type: string;
  operation_status: string;
  initiated_at: string;
  completed_at?: string;
  total_clients_processed: number;
  successful_syncs: number;
  failed_syncs: number;
  new_clients_added: number;
  clients_updated: number;
  error_message?: string;
}

export const useMspaceUsersEnhanced = () => {
  const queryClient = useQueryClient();

  // Get stored MSpace users from database
  const {
    data: storedUsers = [],
    isLoading: isLoadingStored,
    error: storedError,
  } = useQuery({
    queryKey: ["mspace-users-stored"],
    queryFn: async (): Promise<MspaceUserEnhanced[]> => {
      const { data, error } = await supabase
        .from("mspace_reseller_clients")
        .select("*")
        .order("last_synced_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch stored MSpace users:", error);
        throw new Error(
          error.message || "Failed to fetch stored MSpace clients",
        );
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get real-time MSpace users via API (legacy compatibility)
  const {
    data: liveUsers = [],
    isLoading: isLoadingLive,
    error: liveError,
  } = useQuery({
    queryKey: ["mspace-users-live"],
    queryFn: async (): Promise<MspaceUserEnhanced[]> => {
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session?.data?.session?.access_token;

        // First, get reseller clients from MSpace API
        const { data: resellerData, error: resellerError } =
          await supabase.functions.invoke("mspace-accounts", {
            body: { operation: "queryresellerclients" },
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          });

        if (resellerError) {
          console.error("Failed to fetch reseller clients:", resellerError);
          throw new Error(
            resellerError.message || "Failed to fetch MSpace clients",
          );
        }

        const resellerClients = resellerData?.resellerClients || [];

        // Also get sub-accounts
        const { data: subAccountData, error: subAccountError } =
          await supabase.functions.invoke("mspace-accounts", {
            body: { operation: "querysubs" },
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          });

        const subAccounts = subAccountData?.subUsers || [];

        // Convert to enhanced format
        const mspaceUsers: MspaceUserEnhanced[] = [
          ...resellerClients.map((client: any) => ({
            id: `reseller_${client.clientUserName}`,
            mspace_client_id: client.clientUserName,
            client_name: client.clientUserName,
            username: client.clientUserName,
            phone: undefined,
            email: undefined,
            balance: parseFloat(client.smsBalance) || 0,
            previous_balance: 0,
            status: "active",
            user_type: "reseller_client",
            created_date: undefined,
            last_login: undefined,
            last_synced_at: new Date().toISOString(),
            sync_status: "live",
            sync_attempts: 0,
            profile_created: false,
            api_credentials_assigned: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          ...subAccounts.map((subUser: any) => ({
            id: `sub_${subUser.subAccUser}`,
            mspace_client_id: subUser.subAccUser,
            client_name: subUser.subAccUser,
            username: subUser.subAccUser,
            phone: undefined,
            email: undefined,
            balance: parseFloat(subUser.smsBalance) || 0,
            previous_balance: 0,
            status: "active",
            user_type: "sub_account",
            created_date: undefined,
            last_login: undefined,
            last_synced_at: new Date().toISOString(),
            sync_status: "live",
            sync_attempts: 0,
            profile_created: false,
            api_credentials_assigned: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        ];

        return mspaceUsers;
      } catch (error) {
        console.error("Error fetching live MSpace users:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: false, // Disabled by default, can be enabled when needed
  });

  // Get recent sync operations
  const { data: recentSyncOps = [], isLoading: isLoadingSyncOps } = useQuery({
    queryKey: ["mspace-sync-operations"],
    queryFn: async (): Promise<SyncOperation[]> => {
      const { data, error } = await supabase
        .from("mspace_sync_operations")
        .select("*")
        .order("initiated_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Failed to fetch sync operations:", error);
        return [];
      }

      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Manual sync mutation using new enhanced function
  const syncWithDatabase = useMutation({
    mutationFn: async () => {
      const session = await supabase.auth.getSession();
      const accessToken = session?.data?.session?.access_token;

      // Call both endpoints to sync and save to database
      const [resellerResponse, subAccountResponse] = await Promise.all([
        supabase.functions.invoke("mspace-accounts-enhanced", {
          body: {
            operation: "queryresellerclients",
            saveToDatabase: true,
          },
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        }),
        supabase.functions.invoke("mspace-accounts-enhanced", {
          body: {
            operation: "querysubs",
            saveToDatabase: true,
          },
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
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
      const resellerSynced = data.reseller?.sync_results?.total || 0;
      const subAccountsSynced = data.subAccounts?.sync_results?.total || 0;
      const totalSynced = resellerSynced + subAccountsSynced;

      toast.success(`Successfully synced ${totalSynced} clients to database!`);
      queryClient.invalidateQueries({ queryKey: ["mspace-users-stored"] });
      queryClient.invalidateQueries({ queryKey: ["mspace-sync-operations"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to sync clients: ${error.message}`);
    },
  });

  // Scheduled sync mutation
  const scheduledSync = useMutation({
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
        `Scheduled sync completed! Synced ${data.total_synced} clients.`,
      );
      queryClient.invalidateQueries({ queryKey: ["mspace-users-stored"] });
      queryClient.invalidateQueries({ queryKey: ["mspace-sync-operations"] });
    },
    onError: (error: any) => {
      toast.error(`Scheduled sync failed: ${error.message}`);
    },
  });

  // Legacy refresh user data mutation (now uses database)
  const refreshUserData = useMutation({
    mutationFn: async (userId: string) => {
      // Find the client in stored data
      const client = storedUsers.find(
        (u) => u.id === userId || u.mspace_client_id === userId,
      );
      if (!client) {
        throw new Error("Client not found in database");
      }

      // Mark for re-sync by updating sync status
      const { error } = await supabase
        .from("mspace_reseller_clients")
        .update({
          sync_status: "pending",
          sync_attempts: client.sync_attempts + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["mspace-users-stored"] });
      return { success: true, message: "User marked for re-sync" };
    },
    onSuccess: () => {
      toast.success("User data refresh requested");
    },
    onError: (error: any) => {
      toast.error(`Failed to refresh user data: ${error.message}`);
    },
  });

  // Update user balance (enhanced with database tracking)
  const updateUserBalance = useMutation({
    mutationFn: async ({
      userId,
      amount,
      userType,
    }: {
      userId: string;
      amount: number;
      userType: "sub_account" | "reseller_client";
    }) => {
      // Use the original API to perform the actual top-up
      const operation =
        userType === "sub_account" ? "topupsubaccount" : "topupresellerclient";
      const clientnameField =
        userType === "sub_account" ? "subaccname" : "clientname";

      const { data, error } = await supabase.functions.invoke(
        "mspace-accounts",
        {
          body: {
            operation,
            [clientnameField]: userId.replace(/^(sub_|reseller_)/, ""),
            noOfSms: amount,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to update user balance");
      }

      // Update the database record to reflect the balance change
      const client = storedUsers.find(
        (u) => u.mspace_client_id === userId.replace(/^(sub_|reseller_)/, ""),
      );
      if (client) {
        await supabase
          .from("mspace_reseller_clients")
          .update({
            balance: client.balance + amount,
            previous_balance: client.balance,
            last_synced_at: new Date().toISOString(),
            sync_status: "synced",
            updated_at: new Date().toISOString(),
          })
          .eq("id", client.id);
      }

      return { success: true, newBalance: amount, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mspace-users-stored"] });
      toast.success("User balance updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update user balance: ${error.message}`);
    },
  });

  // Assign API credentials to client
  const assignApiCredentials = useMutation({
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
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mspace-users-stored"] });
      toast.success("API credentials assigned successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to assign API credentials: ${error.message}`);
    },
  });

  return {
    // Primary data sources
    users: storedUsers, // Main users from database
    storedMspaceUsers: storedUsers,
    liveUsers,

    // Loading states
    isLoading: isLoadingStored,
    isLoadingStored,
    isLoadingLive,
    isLoadingSyncOps,

    // Error states
    error: storedError,
    storedError,
    liveError,

    // Sync operations
    recentSyncOps,
    lastSyncOperation: recentSyncOps[0],

    // Mutations
    syncWithDatabase,
    scheduledSync,
    refreshUserData,
    updateUserBalance,
    assignApiCredentials,

    // Legacy compatibility
    fetchAndSyncClients: syncWithDatabase,

    // Statistics
    stats: {
      totalClients: storedUsers.length,
      resellerClients: storedUsers.filter(
        (u) => u.user_type === "reseller_client",
      ).length,
      subAccounts: storedUsers.filter((u) => u.user_type === "sub_account")
        .length,
      syncedRecently: storedUsers.filter((u) => {
        const lastSync = new Date(u.last_synced_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return lastSync > oneHourAgo;
      }).length,
      profilesCreated: storedUsers.filter((u) => u.profile_created).length,
      credentialsAssigned: storedUsers.filter((u) => u.api_credentials_assigned)
        .length,
    },
  };
};
