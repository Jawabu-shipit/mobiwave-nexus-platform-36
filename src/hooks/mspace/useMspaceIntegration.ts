import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MspaceCredentials {
  api_key: string;
  username: string;
  sender_id?: string;
}

interface BalanceResponse {
  balance: number;
  currency?: string;
  status: string;
  timestamp: string;
  source?: "edge_function" | "manual_test";
}

interface ResellerClient {
  clientUserName: string;
  balance: string;
  status?: string;
}

interface SubUser {
  username: string;
  balance: string;
  status?: string;
}

// Get user credentials from database
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
      return null;
    }

    // Handle encrypted vs plain credentials
    if (credentials.api_key_encrypted && !credentials.api_key) {
      throw new Error("ENCRYPTED_CREDENTIALS");
    }

    // Extract credentials from direct columns
    const apiKey = credentials.api_key as string;
    const username = credentials.username as string;
    const senderId = credentials.sender_id as string;

    if (!apiKey || !username) {
      throw new Error("Invalid credentials format");
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

// Call mspace-balance edge function
const checkBalanceViaEdgeFunction = async (): Promise<BalanceResponse> => {
  console.log("Calling mspace-balance edge function");

  const { data, error } = await supabase.functions.invoke("mspace-balance", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`Balance check failed: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    ...data,
    source: "edge_function",
  };
};

// Call mspace-proxy edge function for reseller clients
const getResellerClientsViaEdgeFunction = async (): Promise<
  ResellerClient[]
> => {
  console.log("Calling mspace-proxy for reseller clients");

  const { data, error } = await supabase.functions.invoke("mspace-proxy", {
    body: {
      endpoint: "https://api.mspace.co.ke/smsapi/v2/resellerclients",
      operation: "resellerclients",
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`Reseller clients fetch failed: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return Array.isArray(data) ? data : data.resellerClients || [];
};

// Call mspace-proxy edge function for sub users
const getSubUsersViaEdgeFunction = async (): Promise<SubUser[]> => {
  console.log("Calling mspace-proxy for sub users");

  const { data, error } = await supabase.functions.invoke("mspace-proxy", {
    body: {
      endpoint: "https://api.mspace.co.ke/smsapi/v2/subusers",
      operation: "subusers",
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`Sub users fetch failed: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return Array.isArray(data) ? data : data.subUsers || [];
};

export const useMspaceIntegration = () => {
  // Query for credentials
  const {
    data: credentials,
    isLoading: credentialsLoading,
    error: credentialsError,
  } = useQuery({
    queryKey: ["mspace-credentials"],
    queryFn: getCredentials,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Balance check using edge function
  const checkBalance = useMutation({
    mutationFn: checkBalanceViaEdgeFunction,
    onSuccess: (data) => {
      toast.success(
        `✅ Balance: ${data.balance.toLocaleString()} ${data.currency || "SMS"}`,
        {
          description:
            data.source === "edge_function"
              ? "Retrieved via backend"
              : "Manual test",
        },
      );
    },
    onError: (error: any) => {
      console.error("Balance check error:", error);
      toast.error(`❌ Balance check failed: ${error.message}`, {
        description: "Try using the manual API tester below",
      });
    },
  });

  // Reseller clients using edge function
  const getResellerClients = useMutation({
    mutationFn: getResellerClientsViaEdgeFunction,
    onSuccess: (data) => {
      toast.success(`✅ Found ${data.length} reseller clients`);
    },
    onError: (error: any) => {
      console.error("Reseller clients error:", error);
      toast.error(`❌ Failed to fetch reseller clients: ${error.message}`);
    },
  });

  // Sub users using edge function
  const getSubUsers = useMutation({
    mutationFn: getSubUsersViaEdgeFunction,
    onSuccess: (data) => {
      toast.success(`✅ Found ${data.length} sub users`);
    },
    onError: (error: any) => {
      console.error("Sub users error:", error);
      toast.error(`❌ Failed to fetch sub users: ${error.message}`);
    },
  });

  const hasCredentials = !!credentials && !credentialsError;
  const hasEncryptedCredentials =
    credentialsError?.message === "ENCRYPTED_CREDENTIALS";

  return {
    // Credentials info
    credentials,
    hasCredentials,
    hasEncryptedCredentials,
    credentialsLoading,
    credentialsError,

    // API operations
    checkBalance,
    getResellerClients,
    getSubUsers,

    // Loading states
    isLoading:
      credentialsLoading ||
      checkBalance.isPending ||
      getResellerClients.isPending ||
      getSubUsers.isPending,

    // Helper functions
    canUseDirectAPI: hasCredentials && !hasEncryptedCredentials,
    needsManualTesting: !hasCredentials || hasEncryptedCredentials,
  };
};
