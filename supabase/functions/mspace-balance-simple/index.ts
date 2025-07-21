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
    console.log("Simple balance check request started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "missing",
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      throw new Error(
        "Authentication failed: " + (authError?.message || "No user"),
      );
    }

    console.log("User authenticated:", user.id);

    // For now, return a mock response to test the basic function
    const mockResponse = {
      balance: 500,
      status: "success",
      currency: "KES",
      timestamp: new Date().toISOString(),
      userId: user.id,
      message: "Simplified function working",
    };

    console.log("Returning response:", mockResponse);

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in simple mspace-balance function:", error);

    const errorResponse = {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };

    console.log("Error response:", errorResponse);

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
