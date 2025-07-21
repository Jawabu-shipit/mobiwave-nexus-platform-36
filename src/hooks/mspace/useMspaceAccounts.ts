
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/components/ui/use-toast';

interface SubAccountPayload {
  clientname: string;
  noOfSms: number;
}

interface SubUser {
  smsBalance: string;
  subAccUser: string;
}

interface ResellerClientApiResponse {
  clientUserName: string;
  smsBalance: string;
}

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

interface BalanceResponse {
  balance: number;
  currency?: string;
  status: string;
  timestamp: string;
}

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

export const useMspaceAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleRetry } = useErrorHandler();

  const querySubAccounts = async (): Promise<SubUser[]> => {
    setIsLoading(true);
    try {
      const accountsOperation = async () => {
        console.log('Fetching sub accounts using direct API...');
        
        // Get credentials
        const credentials = await getCredentials();
        if (!credentials) {
          throw new Error('Failed to get Mspace credentials');
        }
        
        // Make direct API call to Mspace
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

        if (!response.ok) {
          throw new Error(`Mspace API error (${response.status}): ${responseText}`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse sub accounts response:", parseError);
          throw new Error(
            "Invalid sub accounts response format: " + responseText,
          );
        }
        
        // Handle different response formats
        let subUsers: SubUser[] = [];
        
        if (Array.isArray(data)) {
          subUsers = data;
        } else if (data.subUsers && Array.isArray(data.subUsers)) {
          subUsers = data.subUsers;
        } else if (typeof data === 'object' && data !== null) {
          // Try to find any array property that might contain sub users
          const arrayProps = Object.entries(data)
            .filter(([_, value]) => Array.isArray(value))
            .map(([key, value]) => ({ key, value }));
            
          if (arrayProps.length > 0) {
            console.log(`Found potential sub users array in property: ${arrayProps[0].key}`);
            subUsers = arrayProps[0].value;
          }
        }
        
        console.log('Sub accounts data:', subUsers);
        return subUsers || [];
      };

      return await handleRetry(accountsOperation);
    } catch (error: any) {
      handleError(error, {
        operation: 'Query Sub Accounts',
        shouldRetry: true,
        retryFn: () => querySubAccounts()
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const queryResellerClients = async (): Promise<ResellerClient[]> => {
    setIsLoading(true);
    try {
      const clientsOperation = async () => {
        console.log('Fetching reseller clients using direct API...');
        
        // Get credentials
        const credentials = await getCredentials();
        if (!credentials) {
          throw new Error('Failed to get Mspace credentials');
        }
        
        // Make direct API call to Mspace
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

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse reseller clients response:", parseError);
          throw new Error(
            "Invalid reseller clients response format: " + responseText,
          );
        }
        
        if (!data) {
          console.warn('No data returned from MSpace API');
          toast({
            title: 'Warning',
            description: 'No data returned from MSpace API.',
            variant: 'default'
          });
          return [];
        }
        
        console.log('Raw reseller clients data:', data);
        
        // Handle different response formats
        let clientsData: ResellerClientApiResponse[] = [];
        
        if (Array.isArray(data)) {
          // Direct array of clients
          clientsData = data;
        } else if (data.resellerClients && Array.isArray(data.resellerClients)) {
          // Object with resellerClients array
          clientsData = data.resellerClients;
        } else if (typeof data === 'object' && data !== null) {
          // Try to find any array property that might contain clients
          const arrayProps = Object.entries(data)
            .filter(([_, value]) => Array.isArray(value))
            .map(([key, value]) => ({ key, value }));
            
          if (arrayProps.length > 0) {
            // Use the first array property found
            console.log(`Found potential clients array in property: ${arrayProps[0].key}`);
            clientsData = arrayProps[0].value;
          }
        }
        
        // Normalize client data
        const clients = clientsData.map((client: any) => {
          // Handle different property names
          const clientName = client.clientUserName || client.clientname || client.username || '';
          const smsBalance = client.smsBalance || client.balance || client.credits || '0';
          
          return {
            clientname: clientName,
            balance: typeof smsBalance === 'number' ? String(smsBalance) : smsBalance,
            status: client.status || 'active'
          };
        }).filter(client => client.clientname); // Filter out any clients without a name
        
        console.log('Normalized reseller clients:', clients);
        
        if (clients.length === 0) {
          toast({
            title: 'Info',
            description: 'No reseller clients found for your Mspace account.',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Success',
            description: `Found ${clients.length} reseller clients.`,
            variant: 'default'
          });
        }
        
        return clients;
      };

      return await handleRetry(clientsOperation);
    } catch (error: any) {
      console.error('Query reseller clients failed:', error.message);
      
      handleError(error, {
        operation: 'Query Reseller Clients',
        shouldRetry: true,
        retryFn: () => queryResellerClients()
      });
      
      // Show error toast
      toast({
        title: 'Error',
        description: `Failed to fetch reseller clients: ${error.message}`,
        variant: 'destructive'
      });
      
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const topUpSubAccount = async (payload: SubAccountPayload) => {
    setIsLoading(true);
    try {
      const topUpOperation = async () => {
        console.log('Top up sub account using direct API...', payload);
        
        // Get credentials
        const credentials = await getCredentials();
        if (!credentials) {
          throw new Error('Failed to get Mspace credentials');
        }
        
        // Make direct API call to Mspace
        const response = await fetch(
          "https://api.mspace.co.ke/smsapi/v2/subacctopup",
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
              clientname: payload.clientname,
              noOfSms: payload.noOfSms,
            }),
          },
        );

        const responseText = await response.text();
        console.log("Mspace sub account top-up response:", {
          status: response.status,
          body: responseText,
        });

        if (!response.ok) {
          throw new Error(`Mspace API error (${response.status}): ${responseText}`);
        }

        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          // Return text response if not JSON
          return {
            operation: 'topupsubaccount',
            status: responseText,
            timestamp: new Date().toISOString(),
          };
        }
      };

      const result = await handleRetry(topUpOperation);
      
      toast({
        title: 'Success',
        description: `Successfully topped up ${payload.clientname} with ${payload.noOfSms} SMS credits.`,
        variant: 'default'
      });
      
      return result;
    } catch (error: any) {
      handleError(error, {
        operation: 'Top Up Sub Account',
        details: payload,
        shouldRetry: true,
        retryFn: () => topUpSubAccount(payload)
      });
      
      toast({
        title: 'Error',
        description: `Failed to top up sub account: ${error.message}`,
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const topUpResellerClient = async (payload: SubAccountPayload) => {
    setIsLoading(true);
    try {
      const topUpOperation = async () => {
        console.log('Top up reseller client using direct API...', payload);
        
        // Get credentials
        const credentials = await getCredentials();
        if (!credentials) {
          throw new Error('Failed to get Mspace credentials');
        }
        
        // Make direct API call to Mspace
        const response = await fetch(
          "https://api.mspace.co.ke/smsapi/v2/resellerclienttopup",
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
              clientname: payload.clientname,
              noOfSms: payload.noOfSms,
            }),
          },
        );

        const responseText = await response.text();
        console.log("Mspace reseller client top-up response:", {
          status: response.status,
          body: responseText,
        });

        if (!response.ok) {
          throw new Error(`Mspace API error (${response.status}): ${responseText}`);
        }

        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          // Return text response if not JSON
          return {
            operation: 'topupresellerclient',
            status: responseText,
            timestamp: new Date().toISOString(),
          };
        }
      };

      const result = await handleRetry(topUpOperation);
      
      toast({
        title: 'Success',
        description: `Successfully topped up ${payload.clientname} with ${payload.noOfSms} SMS credits.`,
        variant: 'default'
      });
      
      return result;
    } catch (error: any) {
      handleError(error, {
        operation: 'Top Up Reseller Client',
        details: payload,
        shouldRetry: true,
        retryFn: () => topUpResellerClient(payload)
      });
      
      toast({
        title: 'Error',
        description: `Failed to top up reseller client: ${error.message}`,
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkBalance = async (): Promise<BalanceResponse> => {
    setIsLoading(true);
    try {
      const balanceOperation = async () => {
        console.log('Checking SMS balance using direct API...');
        
        // Get credentials
        const credentials = await getCredentials();
        if (!credentials) {
          throw new Error('Failed to get Mspace credentials');
        }
        
        // Make direct API call to Mspace
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

      const result = await handleRetry(balanceOperation);
      
      toast({
        title: 'Balance Check',
        description: `Current balance: ${result.balance.toLocaleString()} ${result.currency}`,
        variant: 'default'
      });
      
      return result;
    } catch (error: any) {
      handleError(error, {
        operation: 'Check Balance',
        shouldRetry: true,
        retryFn: () => checkBalance()
      });
      
      toast({
        title: 'Error',
        description: `Failed to check balance: ${error.message}`,
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    querySubAccounts,
    queryResellerClients,
    topUpSubAccount,
    topUpResellerClient,
    checkBalance,
    isLoading
  };
};
