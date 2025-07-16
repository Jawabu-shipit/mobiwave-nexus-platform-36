import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const webhookData = await req.json()
    console.log('Received webhook:', webhookData)

    // Process delivery status update
    const { message_id, status, delivered_at, failed_reason } = webhookData

    if (!message_id || !status) {
      throw new Error('Invalid webhook data')
    }

    // Update message history
    const updateData: Record<string, unknown> = { status }
    
    if (status === 'delivered' && delivered_at) {
      updateData.delivered_at = delivered_at
    } else if (status === 'failed') {
      updateData.failed_at = new Date().toISOString()
      updateData.error_message = failed_reason
    }

    await supabase
      .from('message_history')
      .update(updateData)
      .eq('provider_message_id', message_id)

    // Update campaign recipients
    await supabase
      .from('campaign_recipients')
      .update(updateData)
      .eq('provider_message_id', message_id)

    // Log the webhook receipt
    console.log(`Updated status for message ${message_id} to ${status}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Status updated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error instanceof Error ? error.message : String(error)) }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
