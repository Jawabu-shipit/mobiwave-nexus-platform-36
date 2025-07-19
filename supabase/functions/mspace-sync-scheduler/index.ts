import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SyncConfig {
  sync_interval_minutes: number;
  max_sync_attempts: number;
  batch_size: number;
  enable_auto_sync: boolean;
  sync_balance_threshold: number;
  auto_create_profiles: boolean;
  notification_on_sync_failure: boolean;
}

interface UserCredentials {
  user_id: string;
  username: string;
  api_key_encrypted: string;
  is_active: boolean;
}

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

async function getSyncConfig(supabase: SupabaseClient): Promise<SyncConfig> {
  const { data: configs, error } = await supabase
    .from("mspace_sync_config")
    .select("config_key, config_value")
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch sync config:", error);
    // Return default config
    return {
      sync_interval_minutes: 30,
      max_sync_attempts: 3,
      batch_size: 50,
      enable_auto_sync: true,
      sync_balance_threshold: 0.1,
      auto_create_profiles: false,
      notification_on_sync_failure: true,
    };
  }

  const config: any = {};
  configs?.forEach((c) => {
    config[c.config_key] = JSON.parse(c.config_value as string);
  });

  return {
    sync_interval_minutes: config.sync_interval_minutes || 30,
    max_sync_attempts: config.max_sync_attempts || 3,
    batch_size: config.batch_size || 50,
    enable_auto_sync: config.enable_auto_sync !== false,
    sync_balance_threshold: config.sync_balance_threshold || 0.1,
    auto_create_profiles: config.auto_create_profiles || false,
    notification_on_sync_failure: config.notification_on_sync_failure !== false,
  };
}

async function getActiveCredentials(
  supabase: SupabaseClient,
): Promise<UserCredentials[]> {
  const { data: credentials, error } = await supabase
    .from("api_credentials")
    .select("user_id, username, api_key_encrypted, is_active")
    .eq("service_name", "mspace")
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch credentials: ${error.message}`);
  }

  return credentials || [];
}

async function callMspaceApi(
  endpoint: string,
  username: string,
  apiKey: string,
): Promise<any> {
  const payload = {
    apikey: apiKey,
    username: username,
  };

  console.log(`Calling MSpace API: ${endpoint} for user: ${username}`);

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

  if (!response.ok) {
    throw new Error(`MSpace API error (${response.status}): ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    return {
      status: responseText,
      timestamp: new Date().toISOString(),
    };
  }
}

async function syncUserClients(
  supabase: SupabaseClient,
  userCredentials: UserCredentials,
  operationId: string,
  config: SyncConfig,
): Promise<{
  success: boolean;
  synced: number;
  errors: number;
  details: any[];
}> {
  const results = {
    success: true,
    synced: 0,
    errors: 0,
    details: [] as any[],
  };

  try {
    // Decrypt API key
    const apiKey = await decryptApiKey(userCredentials.api_key_encrypted);

    // Sync reseller clients
    try {
      const resellerResponse = await callMspaceApi(
        "https://api.mspace.co.ke/smsapi/v2/resellerclients",
        userCredentials.username,
        apiKey,
      );

      if (
        resellerResponse.resellerClients &&
        Array.isArray(resellerResponse.resellerClients)
      ) {
        const saveResults = await saveClientsToDatabase(
          supabase,
          resellerResponse.resellerClients,
          "reseller_client",
          operationId,
        );
        results.synced += saveResults.saved + saveResults.updated;
        results.errors += saveResults.errors;
        results.details.push(...saveResults.details);
      }
    } catch (error) {
      console.error(
        `Failed to sync reseller clients for ${userCredentials.username}:`,
        error,
      );
      results.errors++;
      results.success = false;

      await supabase.rpc("log_sync_message", {
        p_operation_id: operationId,
        p_client_id: userCredentials.username,
        p_level: "error",
        p_message: `Failed to sync reseller clients: ${error.message}`,
        p_details: { error: error.message },
      });
    }

    // Sync sub-accounts
    try {
      const subAccountResponse = await callMspaceApi(
        "https://api.mspace.co.ke/smsapi/v2/subusers",
        userCredentials.username,
        apiKey,
      );

      if (
        subAccountResponse.subUsers &&
        Array.isArray(subAccountResponse.subUsers)
      ) {
        const saveResults = await saveClientsToDatabase(
          supabase,
          subAccountResponse.subUsers,
          "sub_account",
          operationId,
        );
        results.synced += saveResults.saved + saveResults.updated;
        results.errors += saveResults.errors;
        results.details.push(...saveResults.details);
      }
    } catch (error) {
      console.error(
        `Failed to sync sub-accounts for ${userCredentials.username}:`,
        error,
      );
      results.errors++;
      results.success = false;

      await supabase.rpc("log_sync_message", {
        p_operation_id: operationId,
        p_client_id: userCredentials.username,
        p_level: "error",
        p_message: `Failed to sync sub-accounts: ${error.message}`,
        p_details: { error: error.message },
      });
    }
  } catch (error) {
    console.error(
      `Failed to decrypt credentials for ${userCredentials.username}:`,
      error,
    );
    results.errors++;
    results.success = false;

    await supabase.rpc("log_sync_message", {
      p_operation_id: operationId,
      p_client_id: userCredentials.username,
      p_level: "error",
      p_message: `Failed to decrypt credentials: ${error.message}`,
      p_details: { error: error.message },
    });
  }

  return results;
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
        } else {
          results.updated++;
          results.details.push({
            client_id: mspaceClientId,
            action: "updated",
            balance_change: balance - existing.balance,
          });
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
        } else {
          results.saved++;
          results.details.push({
            client_id: mspaceClientId,
            action: "created",
            balance: balance,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing client:`, error);
      results.errors++;
    }
  }

  return results;
}

async function performScheduledSync(
  supabase: SupabaseClient,
  triggerType: "scheduled" | "manual" = "scheduled",
): Promise<any> {
  console.log("Starting MSpace scheduled sync...");

  // Get sync configuration
  const config = await getSyncConfig(supabase);

  if (!config.enable_auto_sync && triggerType === "scheduled") {
    console.log("Auto sync is disabled, skipping scheduled sync");
    return { message: "Auto sync is disabled" };
  }

  // Start sync operation
  const { data: operationId, error: opError } = await supabase.rpc(
    "start_sync_operation",
    {
      p_operation_type:
        triggerType === "manual" ? "manual_sync" : "scheduled_sync",
      p_initiated_by: null, // System initiated
      p_metadata: {
        trigger_type: triggerType,
        sync_interval: config.sync_interval_minutes,
        started_at: new Date().toISOString(),
      },
    },
  );

  if (opError) {
    throw new Error(`Failed to start sync operation: ${opError.message}`);
  }

  let totalSynced = 0;
  let totalErrors = 0;
  let totalProcessed = 0;
  const syncDetails: any[] = [];

  try {
    // Get all active credentials
    const credentials = await getActiveCredentials(supabase);
    console.log(`Found ${credentials.length} active MSpace credentials`);

    // Process each user's credentials
    for (const userCreds of credentials) {
      console.log(`Syncing clients for user: ${userCreds.username}`);

      const syncResult = await syncUserClients(
        supabase,
        userCreds,
        operationId,
        config,
      );

      totalSynced += syncResult.synced;
      totalErrors += syncResult.errors;
      totalProcessed++;
      syncDetails.push({
        username: userCreds.username,
        synced: syncResult.synced,
        errors: syncResult.errors,
        success: syncResult.success,
      });

      await supabase.rpc("log_sync_message", {
        p_operation_id: operationId,
        p_client_id: userCreds.username,
        p_level: syncResult.success ? "info" : "warn",
        p_message: `User sync completed: ${syncResult.synced} synced, ${syncResult.errors} errors`,
        p_details: { sync_result: syncResult },
      });
    }

    // Complete sync operation
    const overallStatus = totalErrors === 0 ? "completed" : "partial";
    await supabase.rpc("complete_sync_operation", {
      p_operation_id: operationId,
      p_status: overallStatus,
      p_total_processed: totalProcessed,
      p_successful: totalSynced,
      p_failed: totalErrors,
      p_new_added: syncDetails.reduce((sum, d) => sum + d.synced, 0),
      p_updated: 0, // This would need more detailed tracking
      p_error_message:
        totalErrors > 0 ? `${totalErrors} sync errors occurred` : null,
    });

    console.log(
      `Sync completed: ${totalSynced} clients synced, ${totalErrors} errors`,
    );

    return {
      success: true,
      operation_id: operationId,
      total_synced: totalSynced,
      total_errors: totalErrors,
      total_processed: totalProcessed,
      sync_details: syncDetails,
      status: overallStatus,
    };
  } catch (error) {
    console.error("Sync operation failed:", error);

    // Mark operation as failed
    await supabase.rpc("complete_sync_operation", {
      p_operation_id: operationId,
      p_status: "failed",
      p_total_processed: totalProcessed,
      p_successful: totalSynced,
      p_failed: totalErrors + 1,
      p_new_added: 0,
      p_updated: 0,
      p_error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Parse request body
    let triggerType = "scheduled";
    let authRequired = false;

    try {
      const body = await req.json();
      triggerType = body.trigger_type || "scheduled";
      authRequired = body.trigger_type === "manual";
    } catch {
      // Default to scheduled if no body
    }

    // For manual triggers, require authentication
    if (authRequired) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization required for manual sync" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profile?.user_type !== "admin") {
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Perform the sync
    const result = await performScheduledSync(
      supabase,
      triggerType as "scheduled" | "manual",
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in mspace-sync-scheduler:", error);
    return new Response(
      JSON.stringify({
        error: `Sync operation failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
