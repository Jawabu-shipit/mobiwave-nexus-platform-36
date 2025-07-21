import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messageId } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Authorization header required for delivery check",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: "Message ID is required for delivery check" }),
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
    console.log("User authenticated:", user.id);

    // Get user-specific credentials from api_credentials table ONLY
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
          error: `Mspace API credentials not found for user ${user.id}. Please configure credentials in the admin panel under Users > API Credentials. Error: ${credError?.message || "No credentials found"}`,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Decrypt the API key from api_key_encrypted column
    const encryptedApiKey = credentials.api_key_encrypted as string;
    if (!encryptedApiKey) {
      return new Response(
        JSON.stringify({
          error: `Encrypted API key missing in api_key_encrypted column for user ${user.id}. Please re-configure your credentials.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let apiKey: string;
    try {
      apiKey = await decryptApiKey(encryptedApiKey);
    } catch (decryptError) {
      return new Response(
        JSON.stringify({
          error: `Failed to decrypt API key for user ${user.id}: ${decryptError.message}. Please re-configure your credentials.`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get username from the username column directly
    const username = credentials.username as string;

    if (!username) {
      return new Response(
        JSON.stringify({
          error: `Username not found in username column for user ${user.id}. Please re-configure your credentials with a username.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `Successfully retrieved mspace credentials for user ${user.id}, username: ${username}`,
    );

    // Fetch delivery report from Mspace API
    const deliveryData = await fetchDeliveryReport(messageId, username, apiKey);

    return new Response(JSON.stringify(deliveryData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in mspace-delivery function:", error);
    return new Response(
      JSON.stringify({
        error: `Delivery check failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function fetchDeliveryReport(
  messageId: string,
  username: string,
  apiKey: string,
) {
  console.log(
    `Fetching delivery report for message ${messageId} with username ${username}`,
  );

  // Get delivery report from Mspace API
  const response = await fetch(
    "https://api.mspace.co.ke/smsapi/v2/deliveryreport",
    {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        apikey: apiKey,
        username: username,
        messageId: messageId,
      }),
    },
  );

  const responseText = await response.text();
  console.log("Delivery report response status:", response.status);
  console.log("Delivery report response body:", responseText);

  if (!response.ok) {
    throw new Error(`Mspace API error (${response.status}): ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    // If response is not JSON, return as text
    return {
      messageId,
      status: responseText,
      timestamp: new Date().toISOString(),
    };
  }
}
