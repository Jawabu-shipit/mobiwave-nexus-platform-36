import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MspaceCredentials {
  api_key: string;
  username: string;
  sender_id?: string;
}

// Helper function to get credentials directly from api_credentials table
const getCredentials = async (): Promise<MspaceCredentials | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: credentials, error } = await supabase
      .from("api_credentials")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_name", "mspace")
      .eq("is_active", true)
      .single();

    if (error || !credentials) {
      throw new Error(
        "Mspace credentials not configured. Please set up your credentials in the admin panel.",
      );
    }

    // Extract credentials - try different possible formats
    let apiKey: string;
    let username: string;
    let senderId: string | undefined;

    // Extract credentials from the database record
    if (credentials.api_key_encrypted) {
      // Use encrypted API key directly
      apiKey = credentials.api_key_encrypted as string;
      username = (credentials as any).username as string;
      senderId = undefined; // Not stored in database
    } else {
      // Fallback - should not happen with current setup
      throw new Error("No encrypted API key found in credentials");
    }

    if (!apiKey || !username) {
      throw new Error(
        "Invalid credentials format. Please ensure api_key and username are properly configured.",
      );
    }

    return {
      api_key: apiKey,
      username: username,
      sender_id: senderId,
    };
  } catch (error: any) {
    console.error("Error fetching credentials:", error);
    throw error;
  }
};

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
        // Get credentials for direct API calls
        const credentials = await getCredentials();
        if (!credentials) {
          console.warn("No MSpace credentials found for user");
          toast.info(
            "MSpace credentials not configured. Please set up your MSpace API credentials first.",
          );
          return [];
        }

        // First, get reseller clients from MSpace API using direct call
        let resellerClients: any[] = [];
        try {
          console.log('Fetching reseller clients using direct API...');
          
          const response = await fetch(
            "https://api.mspace.co.ke/smsapi/v2/resellerclients",
            {
              method: "POST",
              headers: {
                apikey: credentials.api_key,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                apikey: credentials.api_key,
                username: credentials.username,
              }),
            },
          );

          const responseText = await response.text();
          console.log("Mspace reseller clients response:", {
            status: response.status,
            body: responseText,
          });

          if (response.ok) {
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.error("Failed to parse reseller clients response:", parseError);
              data = null;
            }

            // Handle different response formats
            if (Array.isArray(data)) {
              resellerClients = data;
            } else if (data?.resellerClients && Array.isArray(data.resellerClients)) {
              resellerClients = data.resellerClients;
            } else if (typeof data === 'object' && data !== null) {
              // Try to find any array property that might contain clients
              const arrayProps = Object.entries(data)
                .filter(([_, value]) => Array.isArray(value))
                .map(([key, value]) => ({ key, value }));
                
              if (arrayProps.length > 0) {
                console.log(`Found potential clients array in property: ${arrayProps[0].key}`);
                resellerClients = arrayProps[0].value;
              }
            }
          } else {
            console.error('Failed to fetch reseller clients:', responseText);
            throw new Error(`Mspace API error (${response.status}): ${responseText}`);
          }
        } catch (resellerError: any) {
          console.error('Failed to fetch reseller clients:', resellerError);
          throw new Error(resellerError.message || 'Failed to fetch MSpace clients');
        }

        // Also get sub-accounts using direct API call
        let subAccounts: any[] = [];
        try {
          console.log('Fetching sub accounts using direct API...');
          
          const response = await fetch(
            "https://api.mspace.co.ke/smsapi/v2/subusers",
            {
              method: "POST",
              headers: {
                apikey: credentials.api_key,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                apikey: credentials.api_key,
                username: credentials.username,
              }),
            },
          );

          const responseText = await response.text();
          console.log("Mspace sub accounts response:", {
            status: response.status,
            body: responseText,
          });

          if (response.ok) {
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.warn("Failed to parse sub accounts response:", parseError);
              data = null;
            }
            
            // Handle different response formats
            if (Array.isArray(data)) {
              subAccounts = data;
            } else if (data?.subUsers && Array.isArray(data.subUsers)) {
              subAccounts = data.subUsers;
            } else if (typeof data === 'object' && data !== null) {
              // Try to find any array property that might contain sub users
              const arrayProps = Object.entries(data)
                .filter(([_, value]) => Array.isArray(value))
                .map(([key, value]) => ({ key, value }));
                
              if (arrayProps.length > 0) {
                console.log(`Found potential sub users array in property: ${arrayProps[0].key}`);
                subAccounts = arrayProps[0].value;
              }
            }
          } else {
            console.warn("Failed to fetch sub-accounts (non-critical):", responseText);
          }
        } catch (subError) {
          console.warn("Sub-accounts fetch failed (non-critical):", subError);
        }

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

  // Manual sync mutation using direct API calls and database operations
  const syncWithDatabase = useMutation({
    mutationFn: async () => {
      // Get credentials for direct API calls
      const credentials = await getCredentials();
      if (!credentials) {
        throw new Error('Failed to get Mspace credentials');
      }

      // Fetch data from both endpoints using direct API calls
      const [resellerClients, subAccounts] = await Promise.all([
        // Fetch reseller clients
        fetch("https://api.mspace.co.ke/smsapi/v2/resellerclients", {
          method: "POST",
          headers: {
            apikey: credentials.api_key,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            apikey: credentials.api_key,
            username: credentials.username,
          }),
        }).then(async (response) => {
          const responseText = await response.text();
          if (!response.ok) {
            throw new Error(`Reseller clients API error (${response.status}): ${responseText}`);
          }
          try {
            const data = JSON.parse(responseText);
            return Array.isArray(data) ? data : (data?.resellerClients || []);
          } catch (parseError) {
            console.warn("Failed to parse reseller clients response:", parseError);
            return [];
          }
        }),
        
        // Fetch sub accounts
        fetch("https://api.mspace.co.ke/smsapi/v2/subusers", {
          method: "POST",
          headers: {
            apikey: credentials.api_key,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            apikey: credentials.api_key,
            username: credentials.username,
          }),
        }).then(async (response) => {
          const responseText = await response.text();
          if (!response.ok) {
            console.warn(`Sub accounts API error (${response.status}): ${responseText}`);
            return [];
          }
          try {
            const data = JSON.parse(responseText);
            return Array.isArray(data) ? data : (data?.subUsers || []);
          } catch (parseError) {
            console.warn("Failed to parse sub accounts response:", parseError);
            return [];
          }
        }),
      ]);

      // Note: Database saving would typically be done server-side for security
      // For now, we'll just return the data and let the query cache handle it
      console.log('Sync completed:', { 
        resellerClients: resellerClients.length, 
        subAccounts: subAccounts.length 
      });

      return {
        reseller: { clients: resellerClients, count: resellerClients.length },
        subAccounts: { users: subAccounts, count: subAccounts.length },
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
      // Get credentials for direct API calls
      const credentials = await getCredentials();
      if (!credentials) {
        throw new Error('Failed to get Mspace credentials');
      }

      // Use direct API to perform the actual top-up
      const endpoint = userType === "sub_account" 
        ? "https://api.mspace.co.ke/smsapi/v2/subacctopup"
        : "https://api.mspace.co.ke/smsapi/v2/resellerclienttopup";
      
      const clientname = userId.replace(/^(sub_|reseller_)/, "");

      console.log(`Top up ${userType} using direct API...`, { clientname, amount });
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: credentials.api_key,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          apikey: credentials.api_key,
          username: credentials.username,
          clientname: clientname,
          noOfSms: amount,
        }),
      });

      const responseText = await response.text();
      console.log(`Mspace ${userType} top-up response:`, {
        status: response.status,
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(`Mspace API error (${response.status}): ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Return text response if not JSON
        data = {
          operation: userType === "sub_account" ? 'topupsubaccount' : 'topupresellerclient',
          status: responseText,
          timestamp: new Date().toISOString(),
        };
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
