import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Import the decryption function
const ENCRYPTION_KEY_B64 = Deno.env.get("API_KEY_ENCRYPTION_KEY_B64") ?? "";
if (!ENCRYPTION_KEY_B64) {
  throw new Error(
    "API_KEY_ENCRYPTION_KEY_B64 environment variable is required for encryption/decryption.",
  );
}
const ENCRYPTION_KEY = Uint8Array.from(atob(ENCRYPTION_KEY_B64), (c) =>
  c.charCodeAt(0),
);

// Decrypts base64(iv):base64(ciphertext) to string
async function decryptApiKey(encrypted: string): Promise<string> {
  const [ivB64, cipherB64] = encrypted.split(":");
  if (!ivB64 || !cipherB64)
    throw new Error("Invalid encrypted API key format.");
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    ENCRYPTION_KEY,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes,
  );
  return new TextDecoder().decode(plainBuffer);
}

export async function getApiCredentials(
  supabase: SupabaseClient,
  userId: string | null,
) {
  if (!userId) {
    throw new Error("User ID is required for mspace operations");
  }

  // Get user-specific credentials from api_credentials table ONLY
  const { data: credentials, error: credError } = await supabase
    .from("api_credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("service_name", "mspace")
    .eq("is_active", true)
    .single();

  if (credError || !credentials) {
    console.error("Credentials error:", credError);
    throw new Error(
      `Mspace API credentials not found for user ${userId}. Please configure credentials in the admin panel under Users > API Credentials. Error: ${credError?.message || "No credentials found"}`,
    );
  }

  // Get username from the username column directly
  const username = credentials.username as string;

  if (!username) {
    throw new Error(
      `Username not found in username column for user ${userId}. Please re-configure your credentials with a username.`,
    );
  }

  // Decrypt the API key from api_key_encrypted column (NO FALLBACK)
  const encryptedApiKey = credentials.api_key_encrypted as string;
  if (!encryptedApiKey) {
    throw new Error(
      `Encrypted API key missing in api_key_encrypted column for user ${userId}. Please re-configure your credentials.`,
    );
  }

  let apiKeyValue: string;
  try {
    console.log(`Decrypting API key for user ${userId}`);
    apiKeyValue = await decryptApiKey(encryptedApiKey);
    console.log(`Successfully decrypted API key for user ${userId}`);
  } catch (decryptError) {
    console.error("Failed to decrypt API key:", decryptError);
    throw new Error(
      `Failed to decrypt API key for user ${userId}: ${decryptError.message}. Please re-configure your credentials.`,
    );
  }

  console.log(
    `Retrieved credentials for user ${userId}, username: ${username}`,
  );

  return {
    apiKey: apiKeyValue,
    mspaceUsername: username,
  };
}

async function saveClientsToDatabase(
  supabase: SupabaseClient,
  clients: any[],
  userType: string,
  operationId?: string,
) {
  const results = {
    total: clients.length,
    saved: 0,
    updated: 0,
    errors: 0,
    details: [] as any[],
  };

  for (const client of clients) {
    try {
      const mspaceClientId =
        userType === "reseller_client"
          ? client.clientUserName
          : client.subAccUser;
      const balance = parseFloat(client.smsBalance) || 0;

      const clientData = {
        mspace_client_id: mspaceClientId,
        client_name: mspaceClientId,
        username: mspaceClientId,
        balance: balance,
        status: "active",
        user_type: userType,
        last_synced_at: new Date().toISOString(),
        sync_status: "synced",
        sync_attempts: 0,
        metadata: {
          original_data: client,
          last_api_response: new Date().toISOString(),
        },
      };

      // Try to find existing record
      const { data: existing, error: findError } = await supabase
        .from("mspace_reseller_clients")
        .select("*")
        .eq("mspace_client_id", mspaceClientId)
        .single();

      if (findError && findError.code !== "PGRST116") {
        console.error(
          `Error finding existing client ${mspaceClientId}:`,
          findError,
        );
        results.errors++;
        continue;
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("mspace_reseller_clients")
          .update({
            balance: balance,
            previous_balance: existing.balance,
            last_synced_at: new Date().toISOString(),
            sync_status: "synced",
            metadata: clientData.metadata,
            updated_at: new Date().toISOString(),
          })
          .eq("mspace_client_id", mspaceClientId);

        if (updateError) {
          console.error(
            `Error updating client ${mspaceClientId}:`,
            updateError,
          );
          results.errors++;

          if (operationId) {
            await supabase.rpc("log_sync_message", {
              p_operation_id: operationId,
              p_client_id: mspaceClientId,
              p_level: "error",
              p_message: `Failed to update client: ${updateError.message}`,
              p_details: { error: updateError },
            });
          }
        } else {
          results.updated++;
          results.details.push({
            client_id: mspaceClientId,
            action: "updated",
            balance_change: balance - existing.balance,
          });

          if (operationId) {
            await supabase.rpc("log_sync_message", {
              p_operation_id: operationId,
              p_client_id: mspaceClientId,
              p_level: "info",
              p_message: `Client updated successfully`,
              p_details: {
                new_balance: balance,
                previous_balance: existing.balance,
              },
            });
          }
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("mspace_reseller_clients")
          .insert(clientData);

        if (insertError) {
          console.error(
            `Error inserting client ${mspaceClientId}:`,
            insertError,
          );
          results.errors++;

          if (operationId) {
            await supabase.rpc("log_sync_message", {
              p_operation_id: operationId,
              p_client_id: mspaceClientId,
              p_level: "error",
              p_message: `Failed to insert new client: ${insertError.message}`,
              p_details: { error: insertError },
            });
          }
        } else {
          results.saved++;
          results.details.push({
            client_id: mspaceClientId,
            action: "created",
            balance: balance,
          });

          if (operationId) {
            await supabase.rpc("log_sync_message", {
              p_operation_id: operationId,
              p_client_id: mspaceClientId,
              p_level: "info",
              p_message: `New client created successfully`,
              p_details: { balance: balance },
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error processing client:`, error);
      results.errors++;
    }
  }

  return results;
}

async function callMspaceApi(
  operation: string,
  username: string,
  apiKey: string,
  additionalParams?: Record<string, unknown>,
) {
  let endpoint: string;
  let payload: Record<string, unknown> = { apikey: apiKey };

  switch (operation) {
    case "querysubs":
      endpoint = "https://api.mspace.co.ke/smsapi/v2/subusers";
      payload.username = username;
      break;

    case "queryresellerclients":
      endpoint = "https://api.mspace.co.ke/smsapi/v2/resellerclients";
      payload.username = username;
      break;

    case "topupsubaccount":
      if (!additionalParams?.clientname || !additionalParams?.noOfSms) {
        throw new Error(
          "Client name and SMS quantity required for sub-account top-up",
        );
      }
      endpoint = "https://api.mspace.co.ke/smsapi/v2/subacctopup";
      payload = {
        apikey: apiKey,
        username: username,
        clientname: additionalParams.clientname,
        noOfSms: additionalParams.noOfSms,
      };
      break;

    case "topupresellerclient":
      if (!additionalParams?.clientname || !additionalParams?.noOfSms) {
        throw new Error(
          "Client name and SMS quantity required for reseller client top-up",
        );
      }
      endpoint = "https://api.mspace.co.ke/smsapi/v2/resellerclienttopup";
      payload = {
        apikey: apiKey,
        username: username,
        clientname: additionalParams.clientname,
        noOfSms: additionalParams.noOfSms,
      };
      break;

    default:
      throw new Error(`Unknown mspace operation: ${operation}`);
  }

  console.log(`Calling mspace API: ${operation} at ${endpoint}`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log(`Mspace API response status: ${response.status}`);
  console.log(`Mspace API response body: ${responseText}`);

  if (!response.ok) {
    throw new Error(`Mspace API error (${response.status}): ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    // Return text response if not JSON
    return {
      operation,
      status: responseText,
      timestamp: new Date().toISOString(),
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { operation, clientname, noOfSms, saveToDatabase } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Authorization header required for mspace operations",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!operation) {
      return new Response(
        JSON.stringify({
          error:
            "Operation is required (querysubs, queryresellerclients, topupsubaccount, topupresellerclient)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: `Authentication failed: ${authError?.message || "Invalid token"}`,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Mspace accounts operation:", operation);
    console.log("User ID:", user.id);
    console.log("Save to database:", saveToDatabase);

    // Special handling for balance check operation
    if (operation === "balance") {
      // Check if user has credentials configured
      const { data: credentials, error: credError } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_name", "mspace")
        .eq("is_active", true)
        .single();

      if (credError || !credentials) {
        return new Response(
          JSON.stringify({
            error: `Mspace API credentials not found for user ${user.id}. Please configure credentials in the admin panel under Users > API Credentials.`,
            hasCredentials: false,
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          message:
            "Credentials configured. Use mspace-balance function for balance checks.",
          hasCredentials: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // For all other operations, get the full credentials
    const { apiKey, mspaceUsername } = await getApiCredentials(
      supabase,
      user.id,
    );
    console.log("API credentials retrieved for username:", mspaceUsername);

    // Check if this is a sync operation that should save to database
    const shouldSaveToDb = ["querysubs", "queryresellerclients"].includes(
      operation,
    );
    const shouldStartSyncOperation = shouldSaveToDb && saveToDatabase;

    let operationId: string | undefined;

    // Start sync operation tracking if requested
    if (shouldStartSyncOperation) {
      const { data: syncOpData, error: syncOpError } = await supabase.rpc(
        "start_sync_operation",
        {
          p_operation_type: "manual_sync",
          p_initiated_by: user.id,
          p_metadata: { operation, triggered_by: "api_call" },
        },
      );

      if (syncOpError) {
        console.error("Failed to start sync operation:", syncOpError);
      } else {
        operationId = syncOpData;
      }
    }

    try {
      const result = await callMspaceApi(operation, mspaceUsername, apiKey, {
        clientname,
        noOfSms,
      });

      // Save to database if it's a query operation and saveToDatabase flag is set
      let saveResults;
      if (shouldSaveToDb && shouldStartSyncOperation) {
        if (operation === "queryresellerclients" && result.resellerClients) {
          saveResults = await saveClientsToDatabase(
            supabase,
            result.resellerClients,
            "reseller_client",
            operationId,
          );
        } else if (operation === "querysubs" && result.subUsers) {
          saveResults = await saveClientsToDatabase(
            supabase,
            result.subUsers,
            "sub_account",
            operationId,
          );
        }

        // Complete sync operation
        if (operationId && saveResults) {
          await supabase.rpc("complete_sync_operation", {
            p_operation_id: operationId,
            p_status: saveResults.errors === 0 ? "completed" : "partial",
            p_total_processed: saveResults.total,
            p_successful: saveResults.saved + saveResults.updated,
            p_failed: saveResults.errors,
            p_new_added: saveResults.saved,
            p_updated: saveResults.updated,
            p_error_message:
              saveResults.errors > 0
                ? `${saveResults.errors} clients failed to sync`
                : null,
          });
        }
      }

      // Return enhanced result with sync information
      const responseData = {
        ...result,
        sync_results: saveResults || null,
        operation_id: operationId || null,
        saved_to_database: shouldSaveToDb && shouldStartSyncOperation,
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      // If sync operation was started, mark it as failed
      if (operationId) {
        await supabase.rpc("complete_sync_operation", {
          p_operation_id: operationId,
          p_status: "failed",
          p_total_processed: 0,
          p_successful: 0,
          p_failed: 1,
          p_new_added: 0,
          p_updated: 0,
          p_error_message:
            error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error("Error in mspace-accounts function:", error);
    return new Response(
      JSON.stringify({
        error: `Mspace accounts operation failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
