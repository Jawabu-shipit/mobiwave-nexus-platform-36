import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  amount: number
  phoneNumber: string
  accountReference: string
  transactionDesc: string
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

    const { amount, phoneNumber, accountReference, transactionDesc }: PaymentRequest = await req.json()

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // M-Pesa API credentials
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const shortcode = Deno.env.get('MPESA_SHORTCODE')
    const passkey = Deno.env.get('MPESA_PASSKEY')
    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      throw new Error('M-Pesa configuration missing')
    }

    // Generate access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = btoa(`${shortcode}${passkey}${timestamp}`)

    // Format phone number (remove leading 0 and add 254)
    let formattedPhone = phoneNumber.replace(/^0/, '254')
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }

    // Create payment transaction record
    const { data: transaction, error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        phone_number: formattedPhone,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create transaction: ${insertError.message}`)
    }

    // M-Pesa STK Push request
    const stkPushData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || transaction.id,
      TransactionDesc: transactionDesc || `Credit purchase - ${amount} KES`
    }

    console.log('Initiating STK Push:', { 
      shortcode, 
      phone: formattedPhone, 
      amount: Math.round(amount),
      transactionId: transaction.id 
    })

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushData),
    })

    const stkData = await stkResponse.json()
    console.log('STK Push response:', stkData)

    if (stkData.ResponseCode === '0') {
      // Update transaction with M-Pesa details
      await supabase
        .from('payment_transactions')
        .update({
          merchant_request_id: stkData.MerchantRequestID,
          checkout_request_id: stkData.CheckoutRequestID,
          status: 'processing'
        })
        .eq('id', transaction.id)

      return new Response(JSON.stringify({
        success: true,
        transactionId: transaction.id,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        message: 'STK Push sent successfully. Please check your phone.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // Update transaction as failed
      await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          failure_reason: stkData.ResponseDescription || stkData.errorMessage
        })
        .eq('id', transaction.id)

      throw new Error(stkData.ResponseDescription || stkData.errorMessage || 'STK Push failed')
    }

  } catch (error) {
    console.error('M-Pesa payment error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: (error instanceof Error ? error.message : String(error))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})