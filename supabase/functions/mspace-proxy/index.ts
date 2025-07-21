import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { endpoint, apiKey, username, operation } = await req.json();

    if (!endpoint || !apiKey) {
      throw new Error("Missing endpoint or apiKey");
    }

    console.log("Proxying request to mspace API:", { endpoint, operation });

    let body: any = { apikey: apiKey };

    // Add username for operations that need it
    if (
      username &&
      (endpoint.includes("resellerclients") || endpoint.includes("subusers"))
    ) {
      body.username = username;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log("Mspace API response:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `Mspace API error (${response.status}): ${responseText}`,
          status: response.status,
          statusText: response.statusText,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // If not JSON, return as text (e.g., balance might just be a number)
      responseData = { result: responseText, raw: true };
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
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
