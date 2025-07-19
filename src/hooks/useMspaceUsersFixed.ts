import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MspaceUser {
  id: string;
  mspace_client_id: string;
  client_name: string;
  username?: string;
  phone?: string;
  email?: string;
  balance: number;
  status: string;
  user_type: string;
  created_date?: string;
  last_login?: string;
  created_at: string;
  fetched_at: string;
  updated_at: string;
}

export const useMspaceUsersFixed = () => {
  const queryClient = useQueryClient();

  // Get real MSpace users via API with improved error handling
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mspace-users-fixed"],
    queryFn: async (): Promise<MspaceUser[]> => {
      try {
        // Check if user is authenticated first
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.warn("User not authenticated, skipping MSpace fetch");
          return [];
        }

        // Check if user has MSpace credentials
        const { data: credentials, error: credError } = await supabase
          .from("api_credentials")
          .select("id")
          .eq("user_id", user.id)
          .eq("service_name", "mspace")
          .eq("is_active", true)
          .limit(1);

        if (credError || !credentials || credentials.length === 0) {
          console.warn("No MSpace credentials found for user");
          toast.info(
            "MSpace credentials not configured. Please set up your MSpace API credentials first.",
          );
          return [];
        }

        // Get the current session and access token
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

        let resellerClients: any[] = [];
        if (resellerError) {
          console.error("Failed to fetch reseller clients:", resellerError);

          // Provide user-friendly error messages
          if (
            resellerError.message?.includes("credentials not found") ||
            resellerError.message?.includes("API credentials")
          ) {
            toast.error(
              "MSpace API credentials not properly configured. Please check your credentials in the admin panel.",
            );
          } else if (resellerError.message?.includes("decrypt")) {
            toast.error(
              "Failed to decrypt API credentials. Please reconfigure your MSpace credentials.",
            );
          } else if (resellerError.message?.includes("Authentication failed")) {
            toast.error(
              "Authentication failed. Please log out and log back in.",
            );
          } else {
            toast.error(
              `MSpace API Error: ${resellerError.message || "Unknown error"}`,
            );
          }

          // Don't throw error, just return empty array
          return [];
        } else {
          resellerClients = resellerData?.resellerClients || [];
        }

        // Also get sub-accounts (optional - don't fail if this doesn't work)
        let subAccounts: any[] = [];
        try {
          const { data: subAccountData, error: subAccountError } =
            await supabase.functions.invoke("mspace-accounts", {
              body: { operation: "querysubs" },
              headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {},
            });

          if (subAccountError) {
            console.warn(
              "Failed to fetch sub-accounts (non-critical):",
              subAccountError,
            );
          } else {
            subAccounts = subAccountData?.subUsers || [];
          }
        } catch (subError) {
          console.warn("Sub-accounts fetch failed (non-critical):", subError);
        }

        // Combine both types of users
        const mspaceUsers: MspaceUser[] = [
          ...resellerClients.map((client: any) => ({
            id: `reseller_${client.clientUserName}`,
            mspace_client_id: client.clientUserName,
            client_name: client.clientUserName,
            username: client.clientUserName,
            phone: undefined,
            email: undefined,
            balance: parseFloat(client.smsBalance) || 0,
            status: "active",
            user_type: "reseller_client",
            created_date: undefined,
            last_login: undefined,
            created_at: new Date().toISOString(),
            fetched_at: new Date().toISOString(),
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
            status: "active",
            user_type: "sub_account",
            created_date: undefined,
            last_login: undefined,
            created_at: new Date().toISOString(),
            fetched_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        ];

        if (mspaceUsers.length > 0) {
          toast.success(
            `Successfully loaded ${mspaceUsers.length} MSpace clients`,
          );
        }

        return mspaceUsers;
      } catch (error: any) {
        console.error("Error fetching MSpace users:", error);

        // Don't throw error, show toast and return empty array
        toast.error(`Failed to load MSpace data: ${error.message}`);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry to avoid error spam
  });

  const refreshUserData = useMutation({
    mutationFn: async (userId: string) => {
      // Refresh user data by re-fetching from MSpace API
      queryClient.invalidateQueries({ queryKey: ["mspace-users-fixed"] });
      return { success: true, message: "User data refreshed successfully" };
    },
    onSuccess: () => {
      toast.success("User data refreshed successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to refresh user data: ${error.message}`);
    },
  });

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
      // Use real MSpace API to top up user balance
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

      return { success: true, newBalance: amount, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mspace-users-fixed"] });
      toast.success("User balance updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update user balance: ${error.message}`);
    },
  });

  const fetchAndSyncClients = useMutation({
    mutationFn: async () => {
      // Force refresh of MSpace clients data
      queryClient.invalidateQueries({ queryKey: ["mspace-users-fixed"] });

      // Also refresh balance data
      try {
        const { data: balanceData, error: balanceError } =
          await supabase.functions.invoke("mspace-balance");

        if (balanceError) {
          console.warn("Failed to refresh balance:", balanceError);
        }

        return {
          success: true,
          message: "Clients synced successfully",
          balance: balanceData?.balance,
        };
      } catch (error) {
        console.warn("Balance refresh failed:", error);
        return { success: true, message: "Clients synced successfully" };
      }
    },
    onSuccess: (data) => {
      toast.success(
        `M-Space clients synced successfully${data.balance ? ` (Balance: ${data.balance})` : ""}`,
      );
    },
    onError: (error: any) => {
      toast.error(`Failed to sync clients: ${error.message}`);
    },
  });

  return {
    users,
    storedMspaceUsers: users, // Alias for backward compatibility
    isLoading,
    isLoadingStored: isLoading, // Alias for backward compatibility
    error,
    refreshUserData,
    updateUserBalance,
    fetchAndSyncClients,
  };
};
