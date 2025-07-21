import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";

export interface ClientMspaceCredentials {
  id: string;
  service_name: string;
  username: string;
  is_active: boolean;
  assigned_via_mspace_client?: string;
}

export interface ClientMspaceProfile {
  id: string;
  mspace_client_id: string;
  client_name: string;
  balance: number;
  user_type: string;
  status: string;
  last_synced_at: string;
  api_credentials_assigned: boolean;
  assigned_api_credential_id?: string;
}

export interface MspaceApiOperation {
  operation: string;
  endpoint: string;
  payload?: any;
}

export const useClientMspaceApi = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get client's MSpace profile and assigned credentials
  const {
    data: clientProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["client-mspace-profile", user?.id],
    queryFn: async (): Promise<ClientMspaceProfile | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("mspace_reseller_clients")
        .select("*")
        .eq("profile_user_id", user.id)
        .eq("profile_created", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No profile found - this is expected for clients without MSpace integration
          return null;
        }
        console.error("Error fetching client MSpace profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds to get balance updates
  });

  // Get assigned API credentials
  const { data: assignedCredentials, isLoading: isLoadingCredentials } =
    useQuery({
      queryKey: ["client-mspace-credentials", user?.id],
      queryFn: async (): Promise<ClientMspaceCredentials | null> => {
        if (!user?.id || !clientProfile?.api_credentials_assigned) return null;

        const { data, error } = await supabase
          .from("api_credentials")
          .select("id, service_name, username, is_active")
          .eq("user_id", user.id)
          .eq("service_name", "mspace")
          .eq("is_active", true)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            return null;
          }
          console.error("Error fetching assigned credentials:", error);
          return null;
        }

        return {
          ...data,
          assigned_via_mspace_client: clientProfile?.mspace_client_id,
        };
      },
      enabled: !!user?.id && !!clientProfile?.api_credentials_assigned,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Check if client has MSpace integration
  const hasMspaceIntegration =
    !!clientProfile && clientProfile.api_credentials_assigned;
  const hasActiveCredentials =
    !!assignedCredentials && assignedCredentials.is_active;

  // Send SMS via assigned MSpace credentials
  const sendSMS = useMutation({
    mutationFn: async ({
      recipients,
      message,
      senderId,
    }: {
      recipients: string[];
      message: string;
      senderId?: string;
    }) => {
      if (!hasMspaceIntegration || !hasActiveCredentials) {
        throw new Error("MSpace integration not available for this client");
      }

      const { data, error } = await supabase.functions.invoke("mspace-sms", {
        body: {
          recipients: recipients.join(","),
          message,
          senderId,
          useClientCredentials: true, // Flag to use client's assigned credentials
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `SMS sent successfully! ${data.messageId ? `ID: ${data.messageId}` : ""}`,
      );
      // Refresh balance after SMS is sent
      queryClient.invalidateQueries({
        queryKey: ["client-mspace-profile", user?.id],
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to send SMS: ${error.message}`);
    },
  });

  // Check balance
  const checkBalance = useMutation({
    mutationFn: async () => {
      if (!hasMspaceIntegration || !hasActiveCredentials) {
        throw new Error("MSpace integration not available for this client");
      }

      const { data, error } = await supabase.functions.invoke(
        "mspace-balance",
        {
          body: { useClientCredentials: true },
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update the cached profile with new balance
      if (data.balance !== undefined && clientProfile) {
        queryClient.setQueryData(["client-mspace-profile", user?.id], {
          ...clientProfile,
          balance: data.balance,
          last_synced_at: new Date().toISOString(),
        });
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to check balance: ${error.message}`);
    },
  });

  // Get delivery reports
  const getDeliveryReports = useQuery({
    queryKey: ["client-mspace-delivery", user?.id],
    queryFn: async () => {
      if (!hasMspaceIntegration || !hasActiveCredentials) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke(
        "mspace-delivery",
        {
          body: { useClientCredentials: true },
        },
      );

      if (error) {
        console.error("Error fetching delivery reports:", error);
        return [];
      }

      return data.deliveryReports || [];
    },
    enabled: hasMspaceIntegration && hasActiveCredentials,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  // Refresh client profile data
  const refreshProfile = useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({
        queryKey: ["client-mspace-profile", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["client-mspace-credentials", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["client-mspace-delivery", user?.id],
      });
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Profile data refreshed");
    },
    onError: (error: any) => {
      toast.error(`Failed to refresh: ${error.message}`);
    },
  });

  return {
    // Profile and credentials
    clientProfile,
    assignedCredentials,

    // Integration status
    hasMspaceIntegration,
    hasActiveCredentials,
    integrationStatus: {
      profileExists: !!clientProfile,
      credentialsAssigned: !!clientProfile?.api_credentials_assigned,
      credentialsActive: hasActiveCredentials,
      ready: hasMspaceIntegration && hasActiveCredentials,
    },

    // Loading states
    isLoadingProfile,
    isLoadingCredentials,
    isLoading: isLoadingProfile || isLoadingCredentials,

    // Error states
    error: profileError,

    // API operations
    sendSMS,
    checkBalance,
    getDeliveryReports,
    refreshProfile,

    // Data
    balance: clientProfile?.balance || 0,
    clientId: clientProfile?.mspace_client_id,
    clientName: clientProfile?.client_name,
    lastSynced: clientProfile?.last_synced_at,
    deliveryReports: getDeliveryReports.data || [],

    // Helper functions
    canSendSMS:
      hasMspaceIntegration && hasActiveCredentials && !sendSMS.isPending,
    canCheckBalance:
      hasMspaceIntegration && hasActiveCredentials && !checkBalance.isPending,

    // Status messages
    getStatusMessage: () => {
      if (!clientProfile) {
        return "No MSpace integration available for this account";
      }
      if (!clientProfile.api_credentials_assigned) {
        return "MSpace credentials not assigned. Contact administrator.";
      }
      if (!hasActiveCredentials) {
        return "MSpace credentials inactive. Contact administrator.";
      }
      return "MSpace integration active";
    },

    getStatusType: (): "success" | "warning" | "error" | "info" => {
      if (!clientProfile) return "info";
      if (!clientProfile.api_credentials_assigned) return "warning";
      if (!hasActiveCredentials) return "error";
      return "success";
    },
  };
};
