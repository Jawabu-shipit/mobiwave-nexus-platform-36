import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Balance check request started')
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Use Supabase secrets for credentials (most secure)
    let apiKey = Deno.env.get('MSPACE_API_KEY')
    let username = Deno.env.get('MSPACE_USERNAME')

    // Try to authenticate user and get user-specific credentials
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      
      if (!authError && user) {
        console.log('User authenticated:', user.id)

        // Try to get user-specific API credentials
        const { data: credentials, error: credError } = await supabase
          .from('api_credentials')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_name', 'mspace')
          .eq('is_active', true)
          .single()

        if (!credError && credentials) {
          console.log('Using user-specific credentials')
          const config = credentials.additional_config as Record<string, unknown>
          apiKey = config?.api_key as string || apiKey
          username = config?.username as string || username
        } else {
          console.log('No user-specific credentials found, using environment variables')
        }
      } else {
        console.log('Authentication failed, using environment variables:', authError?.message)
      }
    } catch (authError) {
      console.log('Authentication error, using environment variables:', authError)
    }

    if (!apiKey || !username) {
      throw new Error('Mspace API credentials not available. Please configure them in environment variables or user settings.')
    }

    console.log('Checking balance for user:', username)

    // Try POST method first (more reliable according to docs)
    let balanceData;
    try {
      const postResponse = await fetch('https://api.mspace.co.ke/smsapi/v2/balance', {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username })
      })

      if (postResponse.ok) {
        const responseText = await postResponse.text()
        console.log('POST Balance response:', responseText)
        
        // Parse response - it might be just a number or JSON
        try {
          balanceData = JSON.parse(responseText)
        } catch {
          // If not JSON, treat as plain number
          const balance = parseInt(responseText.trim())
          if (isNaN(balance)) {
            throw new Error('Invalid balance response format')
          }
          balanceData = { balance, status: 'success' }
        }
      } else {
        throw new Error(`POST request failed: ${postResponse.statusText}`)
      }
    } catch (postError) {
      console.log('POST method failed, trying GET method:', postError)
      
      // Fallback to GET method
      const getResponse = await fetch(
        `https://api.mspace.co.ke/smsapi/v2/balance/apikey=${apiKey}/username=${username}`
      )

      if (!getResponse.ok) {
        throw new Error(`Both POST and GET requests failed. Last error: ${getResponse.statusText}`)
      }

      const responseText = await getResponse.text()
      console.log('GET Balance response:', responseText)
      
      try {
        balanceData = JSON.parse(responseText)
      } catch {
        const balance = parseInt(responseText.trim())
        if (isNaN(balance)) {
          throw new Error('Invalid balance response format')
        }
        balanceData = { balance, status: 'success' }
      }
    }

    // Ensure we have a valid balance
    if (typeof balanceData.balance === 'undefined' && typeof balanceData === 'number') {
      balanceData = { balance: balanceData, status: 'success' }
    }

    if (typeof balanceData.balance === 'undefined') {
      throw new Error('Balance not found in API response')
    }

    console.log('Final balance data:', balanceData)

    return new Response(JSON.stringify(balanceData), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in mspace-balance function:', error)
    return new Response(
      JSON.stringify({ 
        error: (error instanceof Error ? error.message : String(error)),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
