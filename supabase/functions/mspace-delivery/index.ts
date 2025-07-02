<<<<<<< HEAD
<<<<<<< HEAD

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"
>>>>>>> 7144a38 (second commit)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    const { messageId, messageIds, batchMode } = requestBody
    
    // Either messageId (single) or messageIds (batch) must be provided
    if (!messageId && (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0)) {
      throw new Error('Either messageId or messageIds array is required')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization required')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    // Get API credentials
    const { data: credentials, error: credError } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_name', 'mspace')
      .eq('is_active', true)
      .single()

    if (credError || !credentials) {
      throw new Error('Mspace API credentials not configured')
    }

<<<<<<< HEAD
    const config = credentials.additional_config as any
    const apiKey = config?.api_key || Deno.env.get('MSPACE_API_KEY')
    const username = config?.username
=======
    const config = credentials.additional_config as Record<string, unknown>
    const apiKey = (config?.api_key as string) || Deno.env.get('MSPACE_API_KEY')
    const username = config?.username as string
>>>>>>> 7144a38 (second commit)

    if (!apiKey || !username) {
      throw new Error('Incomplete Mspace API credentials')
    }

    // Handle batch mode
    if (batchMode && messageIds) {
      const results = []
      
      for (const id of messageIds) {
        try {
          const response = await fetchDeliveryReport(id, username, apiKey)
          if (response && response.message && response.message.length > 0) {
            results.push(response.message[0])
          }
        } catch (error) {
          console.error(`Error getting delivery report for messageId ${id}:`, error)
          // Continue with next message ID even if one fails
        }
      }
      
      return new Response(JSON.stringify(results), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Handle single mode
    const reportData = await fetchDeliveryReport(messageId, username, apiKey)
    console.log('Delivery report response:', reportData)

    return new Response(JSON.stringify(reportData), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in mspace-delivery function:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function fetchDeliveryReport(messageId: string, username: string, apiKey: string) {
  // Get delivery report from Mspace API
  const response = await fetch('https://api.mspace.co.ke/smsapi/v2/deliveryreport', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': apiKey
    },
    body: JSON.stringify({
      username,
      messageId
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to get delivery report: ${response.statusText}`)
  }

  return await response.json()
}
=======
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
    const requestBody = await req.json()
    const { messageId, messageIds, batchMode } = requestBody
    
    // Either messageId (single) or messageIds (batch) must be provided
    if (!messageId && (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0)) {
      throw new Error('Either messageId or messageIds array is required')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization required')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    // Get API credentials
    const { data: credentials, error: credError } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_name', 'mspace')
      .eq('is_active', true)
      .single()

    if (credError || !credentials) {
      throw new Error('Mspace API credentials not configured')
    }

    const config = credentials.additional_config as Record<string, unknown>
    const apiKey = (config?.api_key as string) || Deno.env.get('MSPACE_API_KEY')
    const username = config?.username as string

    if (!apiKey || !username) {
      throw new Error('Incomplete Mspace API credentials')
    }

    // Handle batch mode
    if (batchMode && messageIds) {
      const results = []
      
      for (const id of messageIds) {
        try {
          const response = await fetchDeliveryReport(id, username, apiKey)
          if (response && response.message && response.message.length > 0) {
            results.push(response.message[0])
          }
        } catch (error) {
          console.error(`Error getting delivery report for messageId ${id}:`, error)
          // Continue with next message ID even if one fails
        }
      }
      
      return new Response(JSON.stringify(results), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Handle single mode
    const reportData = await fetchDeliveryReport(messageId, username, apiKey)
    console.log('Delivery report response:', reportData)

    return new Response(JSON.stringify(reportData), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in mspace-delivery function:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),

      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function fetchDeliveryReport(messageId: string, username: string, apiKey: string) {
  // Get delivery report from Mspace API
  const response = await fetch('https://api.mspace.co.ke/smsapi/v2/deliveryreport', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': apiKey
    },
    body: JSON.stringify({
      username,
      messageId
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to get delivery report: ${response.statusText}`)
  }

  return await response.json()
}
>>>>>>> 364714e (change commit)
