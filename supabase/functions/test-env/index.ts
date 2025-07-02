import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

<<<<<<< HEAD
serve(async (req) => {
=======
serve((req) => {
>>>>>>> 364714e (change commit)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Test environment variable access
    const mspaceApiKey = Deno.env.get('MSPACE_API_KEY')
    const mspaceUsername = Deno.env.get('MSPACE_USERNAME')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const envStatus = {
      MSPACE_API_KEY: mspaceApiKey ? `Set (${mspaceApiKey.substring(0, 10)}...)` : 'Not set',
      MSPACE_USERNAME: mspaceUsername ? `Set (${mspaceUsername})` : 'Not set',
      SUPABASE_URL: supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? `Set (${supabaseServiceKey.substring(0, 10)}...)` : 'Not set',
      timestamp: new Date().toISOString(),
      deno_version: Deno.version.deno,
      environment: Deno.env.get('ENVIRONMENT') || 'unknown'
    }

    console.log('Environment variables status:', envStatus)

    return new Response(JSON.stringify(envStatus, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error checking environment variables:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})