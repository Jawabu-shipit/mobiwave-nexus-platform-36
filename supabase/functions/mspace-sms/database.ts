import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SendResult } from './types.ts'

export async function storeMessageResult(
  result: SendResult,
  userId: string,
  campaignId: string | undefined,
  senderId: string,
  message: string,
  responseData: Record<string, unknown>
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
  } catch (_err) {
    if (campaignId) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('metadata')
        .eq('id', campaignId)
        .single()

      const existingMetadata = campaign?.metadata as Record<string, unknown> || {}
      const messages = (existingMetadata.messages as unknown[] ?? [])
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
  } catch (err) {
    console.error('Credits deduction failed:', err)
  }
}
