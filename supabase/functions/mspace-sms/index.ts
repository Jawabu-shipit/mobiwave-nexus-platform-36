
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMSRequest } from './types.ts'
import { getApiCredentials } from './credentials.ts'
import { sendSMSToRecipient } from './sms-sender.ts'
import { storeMessageResult, deductCredits } from './database.ts'
import { MspaceErrorHandler } from './enhanced-error-handler.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipients, message, senderId, campaignId } = await req.json() as SMSRequest
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Recipients array is required and cannot be empty' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message content is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { user, apiKey, username, defaultSenderId } = await getApiCredentials(authHeader)
    const actualSenderId = senderId || defaultSenderId

    console.log(`Processing SMS request for ${recipients.length} recipients`)

    const results = []
    let totalCost = 0
    let successCount = 0
    let failCount = 0

    // Process recipients in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const result = await sendSMSToRecipient(recipient, message, apiKey, username, actualSenderId)
          const cost = await storeMessageResult(result, user.id, campaignId, actualSenderId, message, result as unknown as Record<string, unknown>)
          
          if (result.success) {
            successCount++
          } else {
            failCount++
          }
          
          totalCost += cost
          return result
        } catch (error) {
          const enhancedError = MspaceErrorHandler.handleApiError(error, `Batch processing for ${recipient}`)
          failCount++
          return {
            recipient,
            success: false,
            message: enhancedError.message,
            error: enhancedError.message
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Add small delay between batches to be respectful to the API
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Deduct credits after all processing is complete
    try {
      await deductCredits(user.id, totalCost)
    } catch (error) {
      console.error('Failed to deduct credits:', error)
      // Don't fail the entire request if credit deduction fails
    }

    const responseData = {
      success: successCount > 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failCount,
        totalCost: Number(totalCost.toFixed(4))
      },
      metadata: {
        campaignId,
        senderId: actualSenderId,
        messageLength: message.length,
        batchSize,
        processingTime: new Date().toISOString()
      }
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Critical error in mspace-sms function:', error)
    
    const enhancedError = MspaceErrorHandler.handleApiError(error, 'SMS function execution')
    
    return new Response(
      JSON.stringify({ 
        error: 'SMS service temporarily unavailable',
        details: enhancedError.message,
        code: enhancedError.code,
        retryable: enhancedError.retryable
      }),
      { 
        status: enhancedError.httpStatus, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
