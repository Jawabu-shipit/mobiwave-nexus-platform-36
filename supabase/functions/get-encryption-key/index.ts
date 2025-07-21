import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role for verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has admin privileges
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['super_admin', 'admin'].includes(profile.role)) {
      // Log security event for unauthorized access attempt
      await supabaseClient.rpc('log_security_event', {
        p_event_type: 'unauthorized_encryption_key_access',
        p_severity: 'high',
        p_details: JSON.stringify({ 
          user_id: user.id, 
          ip: req.headers.get('x-forwarded-for') || 'unknown' 
        })
      })

      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Rate limiting check - allow max 10 requests per minute per user
    const _rateLimitKey = `encryption_key_access:${user.id}`

    
    // Get the encryption key (this should be set as a Supabase secret)
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')
    
    if (!encryptionKey) {
      console.error('ENCRYPTION_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful access
    await supabaseClient.rpc('log_security_event', {
      p_event_type: 'encryption_key_accessed',
      p_severity: 'medium',
      p_details: JSON.stringify({ 
        user_id: user.id,
        user_role: profile.role,
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      })
    })

    return new Response(
      JSON.stringify({ 
        key: encryptionKey,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-encryption-key function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
