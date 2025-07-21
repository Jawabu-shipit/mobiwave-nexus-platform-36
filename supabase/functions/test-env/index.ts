import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Test environment variable access (mspace credentials now stored in api_credentials table)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const encryptionKey = Deno.env.get("API_KEY_ENCRYPTION_KEY_B64");

    const envStatus = {
      NOTE: "Mspace credentials are now stored in api_credentials table, not environment variables",
      SUPABASE_URL: supabaseUrl
        ? `Set (${supabaseUrl.substring(0, 30)}...)`
        : "Not set",
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey
        ? `Set (${supabaseServiceKey.substring(0, 10)}...)`
        : "Not set",
      timestamp: new Date().toISOString(),
      deno_version: Deno.version.deno,
      environment: Deno.env.get("ENVIRONMENT") || "unknown",
    };

    console.log("Environment variables status:", envStatus);

    return new Response(JSON.stringify(envStatus, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking environment variables:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
