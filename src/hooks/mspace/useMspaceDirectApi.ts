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
}

interface ResellerClient {
  clientUserName: string;
  balance: string;
  status?: string;
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

    // Try to get from direct columns first
    if (credentials.api_key_encrypted && !credentials.api_key) {
      // If using encrypted format and no plain api_key, we can't use direct API calls
      throw new Error(
        "Encrypted credentials detected. Please use the manual input form below to test API calls.",
      );
    }

    // Try direct columns
    apiKey = credentials.api_key as string;
    username = credentials.username as string;
    senderId = credentials.sender_id as string;

    // Fallback to additional_config if direct columns don't exist
    if (!apiKey || !username) {
      const config = credentials.additional_config as any;
      apiKey = apiKey || config?.api_key;
      username = username || config?.username;
      senderId = senderId || config?.sender_id;
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

// Direct API call to mspace balance endpoint
const checkBalanceDirect = async (
  credentials: MspaceCredentials,
): Promise<BalanceResponse> => {
  console.log("Making direct API call to mspace balance endpoint");

  const response = await fetch("https://api.mspace.co.ke/smsapi/v2/balance", {
    method: "POST",
    headers: {
      apikey: credentials.api_key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      apikey: credentials.api_key,
    }),
  });

  const responseText = await response.text();
  console.log("Mspace balance response:", {
    status: response.status,
    body: responseText,
  });

  if (!response.ok) {
    throw new Error(`Mspace API error (${response.status}): ${responseText}`);
  }

  try {
    const data = JSON.parse(responseText);
    return {
      balance: parseInt(data.balance) || parseInt(responseText),
      currency: data.currency || "KES",
      status: "success",
      timestamp: new Date().toISOString(),
    };
  } catch (parseError) {
    // If response is just a number
    const balance = parseInt(responseText.trim());
    if (isNaN(balance)) {
      throw new Error("Invalid balance response format: " + responseText);
    }
    return {
      balance,
      currency: "KES",
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }
};

// Direct API call to get reseller clients
const getResellerClientsDirect = async (
  credentials: MspaceCredentials,
): Promise<ResellerClient[]> => {
  console.log("Making direct API call to mspace reseller clients endpoint");

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

  if (!response.ok) {
    throw new Error(`Mspace API error (${response.status}): ${responseText}`);
  }

  try {
    const data = JSON.parse(responseText);

    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.resellerClients && Array.isArray(data.resellerClients)) {
      return data.resellerClients;
    } else {
      console.warn("Unexpected reseller clients response format:", data);
      return [];
    }
  } catch (parseError) {
    console.error("Failed to parse reseller clients response:", parseError);
    throw new Error(
      "Invalid reseller clients response format: " + responseText,
    );
  }
};

export const useMspaceDirectApi = () => {
  // Query for credentials
  const {
    data: credentials,
    isLoading: credentialsLoading,
    error: credentialsError,
  } = useQuery({
    queryKey: ["mspace-direct-credentials"],
    queryFn: getCredentials,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Balance check mutation
  const checkBalance = useMutation({
    mutationFn: async (): Promise<BalanceResponse> => {
      if (!credentials) {
        throw new Error("Credentials not loaded");
      }
      return checkBalanceDirect(credentials);
    },
    onSuccess: (data) => {
      toast.success(
        `Balance: ${data.balance.toLocaleString()} ${data.currency}`,
      );
    },
    onError: (error: any) => {
      toast.error(`Balance check failed: ${error.message}`);
    },
  });

  // Reseller clients query
  const getResellerClients = useMutation({
    mutationFn: async (): Promise<ResellerClient[]> => {
      if (!credentials) {
        throw new Error("Credentials not loaded");
      }
      return getResellerClientsDirect(credentials);
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.length} reseller clients`);
    },
    onError: (error: any) => {
      toast.error(`Failed to fetch reseller clients: ${error.message}`);
    },
  });

  return {
    // Credentials info
    credentials,
    hasCredentials: !!credentials && !credentialsError,
    credentialsLoading,
    credentialsError,

    // API operations
    checkBalance,
    getResellerClients,

    // Loading states
    isLoading:
      credentialsLoading ||
      checkBalance.isPending ||
      getResellerClients.isPending,
  };
};
