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

export const useMspaceUsersDebug = () => {
  const queryClient = useQueryClient();

  // Debug function to check credentials first
  const checkCredentials = async () => {
    try {
      const session = await supabase.auth.getSession();
      const user = session?.data?.session?.user;

      if (!user) {
        return { hasUser: false, error: "No authenticated user" };
      }

      // Check if user has MSpace credentials
      const { data: credentials, error: credError } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_name", "mspace")
        .eq("is_active", true);

      return {
        hasUser: true,
        userId: user.id,
        hasCredentials: !credError && credentials && credentials.length > 0,
        credentialsCount: credentials?.length || 0,
        credentialsError: credError?.message,
        credentials: credentials,
      };
    } catch (error: any) {
      return { hasUser: false, error: error.message };
    }
  };

  // Get real MSpace users via API with detailed error handling
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mspace-users-debug"],
    queryFn: async (): Promise<MspaceUser[]> => {
      try {
        console.log("🔍 Starting MSpace users fetch...");

        // First, check credentials
        const credentialsCheck = await checkCredentials();
        console.log("📋 Credentials check:", credentialsCheck);

        if (!credentialsCheck.hasUser) {
          throw new Error(`Authentication required: ${credentialsCheck.error}`);
        }

        if (!credentialsCheck.hasCredentials) {
          throw new Error(
            `MSpace API credentials not found. Please configure your MSpace credentials in the admin panel. Found ${credentialsCheck.credentialsCount} credentials. Error: ${credentialsCheck.credentialsError || "None"}`,
          );
        }

        // Get the current session and access token
        const session = await supabase.auth.getSession();
        const accessToken = session?.data?.session?.access_token;

        console.log("🔑 Access token available:", !!accessToken);

        // First, get reseller clients from MSpace API
        console.log("📞 Calling mspace-accounts for reseller clients...");
        const { data: resellerData, error: resellerError } =
          await supabase.functions.invoke("mspace-accounts", {
            body: { operation: "queryresellerclients" },
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          });

        if (resellerError) {
          console.error("❌ Failed to fetch reseller clients:", resellerError);
          console.error("📄 Full error details:", {
            message: resellerError.message,
            details: resellerError.details,
            hint: resellerError.hint,
            code: resellerError.code,
            stack: resellerError.stack,
          });

          // Provide specific error messages based on common issues
          if (
            resellerError.message?.includes("credentials not found") ||
            resellerError.message?.includes("API credentials")
          ) {
            throw new Error(
              "MSpace API credentials not configured properly. Please check your credentials in the admin panel.",
            );
          }

          if (
            resellerError.message?.includes("Authentication failed") ||
            resellerError.message?.includes("Invalid token")
          ) {
            throw new Error(
              "Authentication failed. Please log out and log back in.",
            );
          }

          if (resellerError.message?.includes("decrypt")) {
            throw new Error(
              "Failed to decrypt API credentials. Please reconfigure your MSpace credentials.",
            );
          }

          throw new Error(
            `MSpace API Error: ${resellerError.message || "Unknown error occurred"}`,
          );
        }

        console.log("✅ Reseller data received:", {
          hasData: !!resellerData,
          clientsCount: resellerData?.resellerClients?.length || 0,
        });

        const resellerClients = resellerData?.resellerClients || [];

        // Also get sub-accounts
        console.log("📞 Calling mspace-accounts for sub-accounts...");
        const { data: subAccountData, error: subAccountError } =
          await supabase.functions.invoke("mspace-accounts", {
            body: { operation: "querysubs" },
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          });

        if (subAccountError) {
          console.error("❌ Failed to fetch sub-accounts:", subAccountError);
          console.error("📄 Full sub-account error details:", {
            message: subAccountError.message,
            details: subAccountError.details,
            hint: subAccountError.hint,
            code: subAccountError.code,
          });

          // Sub-account errors are not critical, continue with reseller clients only
          console.warn(
            "⚠️ Continuing with reseller clients only due to sub-account error",
          );
        }

        const subAccounts = subAccountData?.subUsers || [];

        console.log("✅ Sub-account data received:", {
          hasData: !!subAccountData,
          subAccountsCount: subAccounts.length,
        });

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

        console.log("🎉 Successfully processed MSpace users:", {
          totalUsers: mspaceUsers.length,
          resellerClients: resellerClients.length,
          subAccounts: subAccounts.length,
        });

        return mspaceUsers;
      } catch (error: any) {
        console.error("💥 Error fetching MSpace users:", error);
        console.error("📄 Error stack:", error.stack);

        // Don't throw error, return empty array to prevent UI crashes
        toast.error(`MSpace Error: ${error.message}`);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on error to avoid spam
  });

  // Rest of the mutations remain the same
  const refreshUserData = useMutation({
    mutationFn: async (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ["mspace-users-debug"] });
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
      queryClient.invalidateQueries({ queryKey: ["mspace-users-debug"] });
      toast.success("User balance updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update user balance: ${error.message}`);
    },
  });

  const fetchAndSyncClients = useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({ queryKey: ["mspace-users-debug"] });

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
    storedMspaceUsers: users,
    isLoading,
    isLoadingStored: isLoading,
    error,
    refreshUserData,
    updateUserBalance,
    fetchAndSyncClients,
    checkCredentials, // Added for debugging
  };
};
