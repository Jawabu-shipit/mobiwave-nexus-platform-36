import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { webhook_id } = await req.json()

    console.log('Testing webhook:', webhook_id)

    // Get webhook endpoint
    const { data: webhook, error: webhookError } = await supabaseClient
      .from('webhook_endpoints')
      .select('*')
      .eq('id', webhook_id)
      .single()

    if (webhookError || !webhook) {
      throw new Error(`Webhook not found: ${webhookError?.message}`)
    }

    // Create test payload
    const testPayload = {
      id: crypto.randomUUID(),
      event_type: 'webhook.test',
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id
      },
      created_at: new Date().toISOString(),
      webhook_id: webhook.id
    }

    // Create signature
    const signature = await createSignature(JSON.stringify(testPayload), webhook.secret)

    console.log('Sending test webhook to:', webhook.url)

    // Send test webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'Lovable-Webhooks/1.0'
      },
      body: JSON.stringify(testPayload)
    })

    const success = response.ok
    const responseBody = await response.text()

    // Log test delivery
    await supabaseClient
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhook.id,
        event_type: 'webhook.test',
        payload: testPayload,
        response_status: response.status,
        response_body: responseBody.substring(0, 1000),
        success,
        delivered_at: new Date().toISOString()
      })

    // Update webhook last_delivery timestamp
    await supabaseClient
      .from('webhook_endpoints')
      .update({
        last_delivery: new Date().toISOString(),
        total_deliveries: webhook.total_deliveries + 1
      })
      .eq('id', webhook.id)

    console.log('Test webhook result:', success ? 'SUCCESS' : 'FAILED')

    return new Response(
      JSON.stringify({
        message: 'Test webhook sent',
        success,
        status: response.status,
        response_body: responseBody.substring(0, 500)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Webhook test error:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),

      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
