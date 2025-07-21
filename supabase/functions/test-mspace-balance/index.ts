import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log("Test balance function called");

    // Simple test response
    const testResponse = {
      balance: 1000,
      status: "success",
      currency: "KES",
      timestamp: new Date().toISOString(),
      message: "Test function working",
    };

    console.log("Returning test response:", testResponse);

    return new Response(JSON.stringify(testResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in test function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        message: "Test function error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
