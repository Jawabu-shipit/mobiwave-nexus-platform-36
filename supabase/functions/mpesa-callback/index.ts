import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const callbackData = await req.json()
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2))

    const { Body } = callbackData
    const { stkCallback } = Body

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback

    // Store callback data
    await supabase
      .from('mpesa_callbacks')
      .insert({
        checkout_request_id: CheckoutRequestID,
        merchant_request_id: MerchantRequestID,
        result_code: ResultCode,
        result_desc: ResultDesc,
        callback_data: callbackData,
        processed: false
      })

    // Process the callback
    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item as Array<{ Name: string; Value: string | number }>
      const amount = metadata.find((item) => item.Name === 'Amount')?.Value
      const mpesaReceiptNumber = metadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value
      const transactionDate = metadata.find((item) => item.Name === 'TransactionDate')?.Value
      const phoneNumber = metadata.find((item) => item.Name === 'PhoneNumber')?.Value

      console.log('Payment successful:', {
        checkoutRequestId: CheckoutRequestID,
        amount,
        receipt: mpesaReceiptNumber,
        phone: phoneNumber
      })

      // Update payment transaction
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate ? new Date(transactionDate.toString()).toISOString() : null,
          amount: amount
        })
        .eq('checkout_request_id', CheckoutRequestID)

      if (updateError) {
        console.error('Failed to update payment transaction:', updateError)
      }

      // Mark callback as processed
      await supabase
        .from('mpesa_callbacks')
        .update({ processed: true })
        .eq('checkout_request_id', CheckoutRequestID)

    } else {
      // Payment failed
      console.log('Payment failed:', {
        checkoutRequestId: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      })

      // Update payment transaction as failed
      await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          failure_reason: ResultDesc
        })
        .eq('checkout_request_id', CheckoutRequestID)

      // Mark callback as processed
      await supabase
        .from('mpesa_callbacks')
        .update({ processed: true })
        .eq('checkout_request_id', CheckoutRequestID)
    }

    return new Response(JSON.stringify({
      ResultCode: 0,
      ResultDesc: 'Success'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return new Response(JSON.stringify({
      ResultCode: 1,
      ResultDesc: 'Failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})