<<<<<<< HEAD
<<<<<<< HEAD

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
=======
import { serve as _serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"
>>>>>>> 7144a38 (second commit)
=======
import { serve as _serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"
>>>>>>> 364714e (change commit)
import { SendResult } from './types.ts'

export async function storeMessageResult(
  result: SendResult,
  userId: string,
  campaignId: string | undefined,
  senderId: string,
  message: string,
<<<<<<< HEAD
<<<<<<< HEAD
  responseData: any
=======
  responseData: Record<string, unknown>
>>>>>>> 7144a38 (second commit)
=======
  responseData: Record<string, unknown>
>>>>>>> 364714e (change commit)
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const cost = 0.05
  const messageRecord = {
    user_id: userId,
    campaign_id: campaignId || null,
    type: 'sms',
    sender: senderId,
    recipient: result.recipient.replace(/\D/g, ''),
    content: message,
    status: result.success ? 'sent' : 'failed',
    provider: 'mspace',
    provider_message_id: result.messageId,
    cost: result.success ? cost : 0,
    sent_at: result.success ? new Date().toISOString() : null,
    failed_at: result.success ? null : new Date().toISOString(),
    error_message: result.error,
    metadata: { mspace_response: responseData }
  }

  try {
    const { error: dbError } = await supabase
      .from('message_history')
      .insert(messageRecord)

    if (dbError) {
      console.error('Error storing message in database:', dbError)
    }
<<<<<<< HEAD
<<<<<<< HEAD
  } catch (err) {
=======
  } catch (_err) {
>>>>>>> 7144a38 (second commit)
=======
  } catch (_err) {
>>>>>>> 364714e (change commit)
    if (campaignId) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('metadata')
        .eq('id', campaignId)
        .single()

<<<<<<< HEAD
<<<<<<< HEAD
      const existingMetadata = campaign?.metadata as any || {}
      const messages = existingMetadata.messages || []
=======
      const existingMetadata = campaign?.metadata as Record<string, unknown> || {}
      const messages = (existingMetadata.messages as unknown[] ?? [])
>>>>>>> 7144a38 (second commit)
=======
      const existingMetadata = campaign?.metadata as Record<string, unknown> || {}
      const messages = (existingMetadata.messages as unknown[] ?? [])
>>>>>>> 364714e (change commit)
      messages.push(messageRecord)

      await supabase
        .from('campaigns')
        .update({ 
          metadata: { ...existingMetadata, messages }
        })
        .eq('id', campaignId)
    }
  }

  return result.success ? cost : 0
}

export async function deductCredits(userId: string, totalCost: number) {
  if (totalCost <= 0) return

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { error: creditError } = await supabase.rpc('deduct_credits', {
      user_id: userId,
      amount: totalCost
    })

    if (creditError) {
      console.error('Error deducting credits:', creditError)
    }
<<<<<<< HEAD
<<<<<<< HEAD
  } catch (err) {
    console.error('Credits deduction failed:', err)
=======
  } catch (_err) {
    console.error('Credits deduction failed:', _err)
>>>>>>> 7144a38 (second commit)
=======
  } catch (_err) {
    console.error('Credits deduction failed:', _err)
>>>>>>> 364714e (change commit)
  }
}
