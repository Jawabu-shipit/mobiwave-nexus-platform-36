import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- Helper: Save credentials with encryption ---
/**
 * Save or update mspace API credentials for a user, encrypting the API key before storing.
 * Usage: await saveMspaceApiCredentials(supabase, userId, apiKey, username)
 */
export async function saveMspaceApiCredentials(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  apiKey: string,
  username: string,
) {
  const encryptedApiKey = await encryptApiKey(apiKey);
  const additional_config = { username };
  // Upsert credentials (insert or update if exists)
  const { error } = await supabaseClient.from("api_credentials").upsert(
    [
      {
        user_id: userId,
        service_name: "mspace",
        api_key_encrypted: encryptedApiKey,
        additional_config,
        is_active: true,
      },
    ],
    { onConflict: "user_id,service_name" },
  );
  if (error) throw new Error("Failed to save credentials: " + error.message);
}

// --- AES-GCM encryption/decryption helpers ---
// The encryption key must be 32 bytes (256 bits) for AES-256-GCM
const ENCRYPTION_KEY_B64 = Deno.env.get("API_KEY_ENCRYPTION_KEY_B64") ?? "";
if (!ENCRYPTION_KEY_B64) {
  throw new Error(
    "API_KEY_ENCRYPTION_KEY_B64 environment variable is required for encryption/decryption.",
  );
}
const ENCRYPTION_KEY = Uint8Array.from(atob(ENCRYPTION_KEY_B64), (c) =>
  c.charCodeAt(0),
);

// Encrypts a string and returns base64(iv):base64(ciphertext)
export async function encryptApiKey(plainText: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const key = await crypto.subtle.importKey(
    "raw",
    ENCRYPTION_KEY,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const encoded = new TextEncoder().encode(plainText);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
  return `${ivB64}:${cipherB64}`;
}

// Decrypts base64(iv):base64(ciphertext) to string
export async function decryptApiKey(encrypted: string): Promise<string> {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Balance check request started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Authenticate user and get user-specific credentials
    let apiKey: string | undefined = undefined;
    let username: string | undefined = undefined;
    let userId: string | undefined = undefined;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

      if (!authError && user) {
        userId = user.id;
        console.log("User authenticated:", userId);

        // Get user-specific API credentials
        const { data: credentials, error: credError } = await supabase
          .from("api_credentials")
          .select("*")
          .eq("user_id", userId)
          .eq("service_name", "mspace")
          .eq("is_active", true)
          .single();

        if (!credError && credentials) {
          console.log("Using user-specific credentials");
          console.log("Credentials structure:", {
            id: credentials.id,
            service_name: credentials.service_name,
            has_api_key_encrypted: !!credentials.api_key_encrypted,
            has_username: !!credentials.username,
            has_additional_config: !!credentials.additional_config,
            is_active: credentials.is_active,
            columns: Object.keys(credentials),
          });

          // Decrypt the API key
          const encryptedApiKey = credentials.api_key_encrypted as string;
          if (!encryptedApiKey) {
            throw new Error(
              "Encrypted API key is missing in api_key_encrypted column.",
            );
          }
          apiKey = await decryptApiKey(encryptedApiKey);
          // Get username - try direct column first, then additional_config as fallback
          username = credentials.username as string;
          if (!username) {
            const config = credentials.additional_config as Record<
              string,
              unknown
            >;
            username = config?.username as string;
            console.log("Tried additional_config for username:", {
              config,
              username,
            });
          }

          console.log("Final username value:", username);
        } else {
          throw new Error(
            `No user-specific credentials found for user: ${userId}. Error: ${credError?.message || "No credentials found"}`,
          );
        }
      } else {
        console.log("Authentication failed:", authError?.message);
      }
    } catch (authError) {
      console.log("Authentication error:", authError);
    }

    if (!apiKey || !username) {
      throw new Error(
        "Mspace API credentials not available. Please configure them in user settings.",
      );
    }

    console.log("Checking balance with API key for user:", username);

    // Use the correct mspace API format from documentation
    console.log("Making balance request to mspace API");
    const response = await fetch("https://api.mspace.co.ke/smsapi/v2/balance", {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ apikey: apiKey }),
    });

    const responseText = await response.text();
    console.log("Balance response status:", response.status);
    console.log("Balance response body:", responseText);

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}. Response: ${responseText}`,
      );
    }

    // Parse response according to mspace documentation
    let balanceData;
    try {
      balanceData = JSON.parse(responseText);

      // Ensure we have a balance field
      if (typeof balanceData.balance !== "undefined") {
        // Success - normalize the response format
        balanceData = {
          balance: parseInt(balanceData.balance),
          status: "success",
          currency: balanceData.currency || "KES",
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error("Invalid response format: missing balance field");
      }
    } catch (parseError) {
      // If not JSON, try to parse as plain number (fallback)
      const balance = parseInt(responseText.trim());
      if (!isNaN(balance)) {
        balanceData = {
          balance,
          status: "success",
          currency: "KES",
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error("Invalid balance response format: " + responseText);
      }
    }

    console.log("Final balance data:", balanceData);

    return new Response(JSON.stringify(balanceData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in mspace-balance function:", error);

    const errorResponse = {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      function_name: "mspace-balance",
    };

    console.log("Returning error response:", errorResponse);

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
