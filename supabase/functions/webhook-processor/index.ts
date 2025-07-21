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

    const { event_type, data, webhook_id } = await req.json()

    console.log('Processing webhook event:', { event_type, webhook_id })

    // Get active webhook endpoints for this event type
    const { data: webhooks, error: webhookError } = await supabaseClient
      .from('webhook_endpoints')
      .select('*')
      .eq('is_active', true)
      .contains('events', [event_type])

    if (webhookError) {
      throw new Error(`Failed to fetch webhooks: ${webhookError.message}`)
    }

    console.log('Found webhooks:', webhooks?.length || 0)

    // Send webhook to each endpoint
    const deliveryPromises = webhooks?.map(async (webhook: { id: string; url: string; secret: string; total_deliveries: number }) => {

      try {
        const payload = {
          id: crypto.randomUUID(),
          event_type,
          data,
          created_at: new Date().toISOString(),
          webhook_id: webhook.id
        }

        // Create signature for webhook security
        const signature = await createSignature(JSON.stringify(payload), webhook.secret)

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'User-Agent': 'Lovable-Webhooks/1.0'
          },
          body: JSON.stringify(payload)
        })

        const success = response.ok
        const responseBody = await response.text()

        // Log webhook delivery
        await supabaseClient
          .from('webhook_deliveries')
          .insert({
            webhook_id: webhook.id,
            event_type,
            payload,
            response_status: response.status,
            response_body: responseBody.substring(0, 1000), // Limit response body size
            success,
            delivered_at: new Date().toISOString()
          })

        // Update webhook statistics
        await supabaseClient.rpc('update_webhook_stats', {
          webhook_id: webhook.id,
          success
        })

        console.log(`Webhook delivery to ${webhook.url}:`, success ? 'SUCCESS' : 'FAILED')

        return { webhook_id: webhook.id, success, status: response.status }
      } catch (error) {
        console.error(`Webhook delivery failed for ${webhook.url}:`, error)
        
        // Log failed delivery
        await supabaseClient
          .from('webhook_deliveries')
          .insert({
            webhook_id: webhook.id,
            event_type,
            payload: { event_type, data },
            response_status: 0,
            response_body: (error instanceof Error ? error.message : String(error)),

            success: false,
            delivered_at: new Date().toISOString()
          })

        return { webhook_id: webhook.id, success: false, error: (error instanceof Error ? error.message : String(error)) }

      }
    }) || []

    const results = await Promise.all(deliveryPromises)

    return new Response(
      JSON.stringify({
        message: 'Webhook processing completed',
        results,
        total_webhooks: webhooks?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Webhook processor error:', error)
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
