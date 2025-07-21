import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error: Type declarations not found for esm.sh imports, safe to ignore for Deno Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CredentialsRequest {
  action: 'get' | 'set' | 'test' | 'delete';
  credentials?: {
    api_key: string;
    username: string;
    sender_id?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // Deno.env is not always available in Edge Functions, wrap in try/catch for compatibility
    // Use globalThis as any for Edge Function compatibility and to avoid TS errors
    const supabaseUrl = (globalThis as Record<string, unknown>).SUPABASE_URL as string ?? ''
    const supabaseKey = (globalThis as Record<string, unknown>).SUPABASE_SERVICE_ROLE_KEY as string ?? ''
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }
    // Only allow access to user-specific credentials. Remove any fallback to env or global credentials.

    const { action, credentials }: CredentialsRequest = await req.json()

    switch (action) {
      case 'get': {
        const { data: existingCreds, error: getError } = await supabase
          .from('api_credentials')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_name', 'mspace')
          .eq('is_active', true)
          .single()

        if (getError && getError.code !== 'PGRST116') {
          throw getError
        }

        return new Response(JSON.stringify({ 
          credentials: existingCreds ? {
            username: existingCreds.additional_config?.username,
            sender_id: existingCreds.additional_config?.sender_id,
            has_api_key: !!existingCreds.additional_config?.api_key,
            created_at: existingCreds.created_at
          } : null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'set': {
        if (!credentials?.api_key || !credentials?.username) {
          throw new Error('API key and username are required')
        }

        // Test credentials first
        const testResponse = await fetch('https://api.mspace.co.ke/smsapi/v2/balance', {
          method: 'POST',
          headers: {
            'apikey': credentials.api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username: credentials.username })
        })

        if (!testResponse.ok) {
          throw new Error('Invalid MSpace credentials - authentication failed')
        }

        // Upsert credentials
        const { data: _savedCreds, error: saveError } = await supabase
          .from('api_credentials')
          .upsert({
            user_id: user.id,
            service_name: 'mspace',
            additional_config: {
              api_key: credentials.api_key,
              username: credentials.username,
              sender_id: credentials.sender_id || 'MSPACE'
            },
            is_active: true
          }, {
            onConflict: 'user_id,service_name'
          })
          .select()
          .single()

        if (saveError) throw saveError

        return new Response(JSON.stringify({ 
          success: true,
          message: 'MSpace credentials saved and verified successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'test': {
        const { data: creds, error: credsError } = await supabase
          .from('api_credentials')
          .select('username, api_key')
          .eq('user_id', user.id)
          .eq('service_name', 'mspace')
          .eq('is_active', true)
          .single();

        if (credsError || !creds) {
          return new Response(
            JSON.stringify({ error: 'Mspace API credentials not found for user.' }),
            { status: 403 }
          );
        }

        const apiKey = creds.api_key;
        const username = creds.username;

        const testResponse = await fetch('https://api.mspace.co.ke/smsapi/v2/balance', {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username: username })
        })

        const responseText = await testResponse.text()
        let balance = 0

        try {
          const parsed = JSON.parse(responseText)
          balance = parsed.balance || parseInt(responseText)
        } catch {
          balance = parseInt(responseText) || 0
        }

        return new Response(JSON.stringify({ 
          success: testResponse.ok,
          balance: testResponse.ok ? balance : null,
          message: testResponse.ok ? 'Credentials are valid' : 'Invalid credentials'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'delete': {
        const { error: deleteError } = await supabase
          .from('api_credentials')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('service_name', 'mspace')

        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ 
          success: true,
          message: 'MSpace credentials deleted successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in mspace-credentials function:', error)
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