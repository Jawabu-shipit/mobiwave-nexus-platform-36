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
    console.log("Fixing API credentials schema...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Check if username column exists
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "api_credentials")
      .eq("table_schema", "public")
      .eq("column_name", "username");

    if (columnsError) {
      console.error("Error checking columns:", columnsError);
      throw new Error(`Failed to check table schema: ${columnsError.message}`);
    }

    console.log("Column check result:", columns);

    if (!columns || columns.length === 0) {
      console.log("Username column does not exist, adding it...");
      
      // Add username column using raw SQL
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.api_credentials ADD COLUMN username TEXT;'
      });

      if (alterError) {
        console.error("Error adding username column:", alterError);
        throw new Error(`Failed to add username column: ${alterError.message}`);
      }

      console.log("Username column added successfully");
    } else {
      console.log("Username column already exists");
    }

    // Check current table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "api_credentials")
      .eq("table_schema", "public")
      .order("ordinal_position");

    if (tableError) {
      console.error("Error getting table info:", tableError);
    } else {
      console.log("Current api_credentials table structure:", tableInfo);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "API credentials schema check completed",
        tableStructure: tableInfo,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in fix-api-credentials-schema function:", error);

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