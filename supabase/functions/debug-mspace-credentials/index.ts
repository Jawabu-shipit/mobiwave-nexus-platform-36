import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Debug credentials request started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client
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
      throw new Error(
        `Authentication failed: ${authError?.message || "Invalid token"}`,
      );
    }

    console.log("User authenticated:", user.id);

    // Get credentials and inspect the full structure
    const { data: credentials, error: credError } = await supabase
      .from("api_credentials")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_name", "mspace")
      .eq("is_active", true);

    const debugInfo = {
      user_id: user.id,
      user_email: user.email,
      credentials_query: {
        error: credError
          ? {
              message: credError.message,
              details: credError.details,
              hint: credError.hint,
              code: credError.code,
            }
          : null,
        found_count: credentials?.length || 0,
        credentials: credentials
          ? credentials.map((cred) => ({
              id: cred.id,
              service_name: cred.service_name,
              has_api_key_encrypted: !!cred.api_key_encrypted,
              api_key_encrypted_length: cred.api_key_encrypted?.length || 0,
              has_username: !!cred.username,
              username_value: cred.username,
              has_sender_id: !!cred.sender_id,
              sender_id_value: cred.sender_id,
              is_active: cred.is_active,
              created_at: cred.created_at,
              all_columns: Object.keys(cred),
            }))
          : [],
      },
      environment: {
        has_encryption_key: !!Deno.env.get("API_KEY_ENCRYPTION_KEY_B64"),
        encryption_key_length:
          Deno.env.get("API_KEY_ENCRYPTION_KEY_B64")?.length || 0,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Debug info:", JSON.stringify(debugInfo, null, 2));

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in debug function:", error);

    const errorResponse = {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse, null, 2), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
