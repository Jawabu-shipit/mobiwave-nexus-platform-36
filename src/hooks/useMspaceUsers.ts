
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useMspaceUsers = () => {
  const queryClient = useQueryClient();

  // Get real MSpace users via API
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['mspace-users'],
    queryFn: async (): Promise<MspaceUser[]> => {
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
            status: 'active',
            user_type: 'reseller_client',
            created_date: undefined,
            last_login: undefined,
            created_at: new Date().toISOString(),
            fetched_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          ...subAccounts.map((subUser: any) => ({
            id: `sub_${subUser.subAccUser}`,
            mspace_client_id: subUser.subAccUser,
            client_name: subUser.subAccUser,
            username: subUser.subAccUser,
            phone: undefined,
            email: undefined,
            balance: parseFloat(subUser.smsBalance) || 0,
            status: 'active',
            user_type: 'sub_account',
            created_date: undefined,
            last_login: undefined,
            created_at: new Date().toISOString(),
            fetched_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        ];

        return mspaceUsers;
      } catch (error) {
        console.error('Error fetching MSpace users:', error);
        // Fallback to empty array if API fails
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const refreshUserData = useMutation({
    mutationFn: async (userId: string) => {
      // Refresh user data by re-fetching from MSpace API
      queryClient.invalidateQueries({ queryKey: ['mspace-users'] });
      return { success: true, message: 'User data refreshed successfully' };
    },
    onSuccess: () => {
      toast.success('User data refreshed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to refresh user data: ${error.message}`);
    }
  });

  const updateUserBalance = useMutation({
    mutationFn: async ({ userId, amount, userType }: { userId: string; amount: number; userType: 'sub_account' | 'reseller_client' }) => {
      // Get credentials for direct API calls
      const credentials = await getCredentials();
      if (!credentials) {
        throw new Error('Failed to get Mspace credentials');
      }

      // Use real MSpace API to top up user balance
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

      return { success: true, newBalance: amount, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mspace-users'] });
      toast.success('User balance updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update user balance: ${error.message}`);
    }
  });

  const fetchAndSyncClients = useMutation({
    mutationFn: async () => {
      // Force refresh of MSpace clients data
      queryClient.invalidateQueries({ queryKey: ['mspace-users'] });
      
      // Also refresh balance data using direct API
      let balance = null;
      try {
        const credentials = await getCredentials();
        if (credentials) {
          const response = await fetch(
            "https://api.mspace.co.ke/smsapi/v2/balance",
            {
              method: "POST",
              headers: {
                apikey: credentials.api_key,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                apikey: credentials.api_key,
              }),
            },
          );

          const responseText = await response.text();
          if (response.ok) {
            try {
              const data = JSON.parse(responseText);
              balance = parseInt(data.balance) || parseInt(responseText);
            } catch (parseError) {
              balance = parseInt(responseText.trim());
            }
          }
        }
      } catch (error) {
        console.warn("Balance refresh failed:", error);
      }

      return { success: true, message: 'Clients synced successfully', balance: balance };
    },
    onSuccess: (data) => {
      toast.success(`M-Space clients synced successfully${data.balance ? ` (Balance: ${data.balance})` : ''}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to sync clients: ${error.message}`);
    }
  });

  return {
    users,
    storedMspaceUsers: users, // Alias for backward compatibility
    isLoading,
    isLoadingStored: isLoading, // Alias for backward compatibility
    error,
    refreshUserData,
    updateUserBalance,
    fetchAndSyncClients
  };
};
