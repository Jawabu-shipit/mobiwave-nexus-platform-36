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
    const { operation, clientname, noOfSms } = await req.json();
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

    const result = await callMspaceApi(operation, mspaceUsername, apiKey, {
      clientname,
      noOfSms,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
