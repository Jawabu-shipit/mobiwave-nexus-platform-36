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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, amount } = await req.json()

    // Get current credits
    const { data: currentCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits_remaining, credits_used')
      .eq('user_id', user_id)
      .single()

    if (creditsError) {
      throw new Error('Failed to fetch user credits')
    }

    if (currentCredits.credits_remaining < amount) {
      throw new Error('Insufficient credits')
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        credits_remaining: currentCredits.credits_remaining - amount,
        credits_used: (currentCredits.credits_used || 0) + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)

    if (updateError) {
      throw updateError
    }

    // Log transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id,
        transaction_type: 'usage',
        amount: -amount,
        description: 'SMS sent',
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('Failed to log transaction:', transactionError)
    }

    return new Response(
      JSON.stringify({ success: true, remaining_credits: currentCredits.credits_remaining - amount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in deduct-credits function:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
