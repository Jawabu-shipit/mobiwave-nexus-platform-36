import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface Campaign {
  id: string
  user_id: string
  name: string
  description?: string
  campaign_type: string
  status: string
  message_content?: string
  recipient_count: number
  sent_count: number
  delivered_count: number
  failed_count: number
  scheduled_at?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  data_model_id?: string
  target_criteria?: Criteria | null
}

type Criteria = Record<string, string | number | boolean | CriteriaRange | CriteriaContains>
interface CriteriaRange {
  min?: number
  max?: number
}
interface CriteriaContains {
  contains: string
}

interface Recipient {
  id: string
  data: Record<string, unknown>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Route handling
    if (path === '/campaign-api/campaigns') {
      if (method === 'GET') {
        return await getCampaigns(user.id)
      } else if (method === 'POST') {
        const body = await req.json()
        return await createCampaign(user.id, body)
      }
    } else if (path.startsWith('/campaign-api/campaigns/')) {
      const campaignId = path.split('/')[3]
      
      if (method === 'GET') {
        return await getCampaign(user.id, campaignId)
      } else if (method === 'PUT') {
        const body = await req.json()
        return await updateCampaign(user.id, campaignId, body)
      } else if (method === 'DELETE') {
        return await deleteCampaign(user.id, campaignId)
      }
    } else if (path === '/campaign-api/campaigns/send') {
      if (method === 'POST') {
        const body = await req.json()
        return await sendCampaign(user.id, body)
      }
    } else if (path === '/campaign-api/recipients') {
      if (method === 'GET') {
        const modelId = url.searchParams.get('model_id')
        const criteria = url.searchParams.get('criteria')
        return await getRecipients(user.id, modelId, criteria)
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error: unknown) {
    let message = 'Unknown error'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getCampaigns(userId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createCampaign(userId: string, campaignData: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([{
      user_id: userId,
      name: campaignData.name,
      description: campaignData.description,
      campaign_type: campaignData.campaign_type || 'sms',
      status: campaignData.status || 'draft',
      message_content: campaignData.message_content,
      recipient_count: campaignData.recipient_count || 0,
      scheduled_at: campaignData.scheduled_at,
      data_model_id: campaignData.data_model_id,
      target_criteria: campaignData.target_criteria
    }])
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getCampaign(userId: string, campaignId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .eq('id', campaignId)
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateCampaign(userId: string, campaignId: string, updates: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('user_id', userId)
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteCampaign(userId: string, campaignId: string) {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('user_id', userId)
    .eq('id', campaignId)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendCampaign(userId: string, sendData: { campaign_id: string }) {
  const { campaign_id } = sendData

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .eq('id', campaign_id)
    .single()

  if (campaignError || !campaign) {
    throw new Error('Campaign not found or access denied')
  }

  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    throw new Error('Campaign cannot be sent in current status')
  }

  // Get recipients based on data model and criteria
  let recipients: Recipient[] = []
  if (campaign.data_model_id) {
    recipients = await getRecipientsFromModel(userId, campaign.data_model_id, campaign.target_criteria)
  }

  // Update campaign status and recipient count
  await supabase
    .from('campaigns')
    .update({ 
      status: 'sending',
      recipient_count: recipients.length,
      started_at: new Date().toISOString()
    })
    .eq('id', campaign_id)

  // Send messages (integrate with messaging service)
  const sendResults = await sendMessages(campaign, recipients)

  // Update campaign with results
  await supabase
    .from('campaigns')
    .update({
      status: 'completed',
      sent_count: sendResults.sent,
      delivered_count: sendResults.delivered,
      failed_count: sendResults.failed,
      completed_at: new Date().toISOString()
    })
    .eq('id', campaign_id)

  return new Response(
    JSON.stringify({ 
      success: true, 
      sent: sendResults.sent,
      delivered: sendResults.delivered,
      failed: sendResults.failed
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getRecipients(userId: string, modelId: string | null, criteria: string | null) {
  if (!modelId) {
    return new Response(
      JSON.stringify([]),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const recipients = await getRecipientsFromModel(userId, modelId, criteria ? JSON.parse(criteria) as Criteria : null)

  return new Response(
    JSON.stringify(recipients),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getRecipientsFromModel(userId: string, modelId: string, criteria: Criteria | null) {
  // Get all records for the model
  const { data: records, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .eq('model_id', modelId)

  if (error) throw error

  // Apply filtering criteria if provided
  let filteredRecords = records || []
  
  if (criteria && Object.keys(criteria).length > 0) {
    filteredRecords = records?.filter(record => {
      return Object.entries(criteria).every(([field, value]) => {
        const recordValue = record.data[field]
        if (typeof value === 'object' && value !== null) {
          // Handle range queries, etc.
          const v = value as CriteriaRange & CriteriaContains
          if ('min' in v && v.min !== undefined && recordValue < v.min) return false
          if ('max' in v && v.max !== undefined && recordValue > v.max) return false
          if ('contains' in v && v.contains && !String(recordValue).toLowerCase().includes(String(v.contains).toLowerCase())) return false
        } else {
          // Exact match
          return recordValue === value
        }
        return true
      })
    }) || []
  }

  return filteredRecords.map((record): Recipient => ({
    id: record.id,
    data: record.data
  }))
}

async function sendMessages(campaign: Campaign, recipients: Recipient[]): Promise<{ sent: number, delivered: number, failed: number }> {
  let sent = 0
  let delivered = 0
  let failed = 0

  // This is a simplified implementation
  // In a real system, you would integrate with your SMS/messaging service
  for (const recipient of recipients) {
    try {
      // Extract phone number from recipient data
      const phoneField = findPhoneField(recipient.data)
      if (!phoneField) {
        failed++
        continue
      }

      // Call messaging service API
      const messageResult = await sendSingleMessage(
        phoneField,
        campaign.message_content || '',
        campaign.campaign_type
      )

      if (messageResult.success) {
        sent++
        if (messageResult.delivered) {
          delivered++
        }
      } else {
        failed++
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error('Failed to send message to recipient:', error)
      failed++
    }
  }

  return { sent, delivered, failed }
}

function findPhoneField(data: Record<string, unknown>): string | null {
  // Look for common phone field names
  const phoneFields = ['phone', 'mobile', 'cell', 'telephone', 'phone_number', 'mobile_number']
  
  for (const field of phoneFields) {
    const value = data[field]
    if (typeof value === 'string') {
      return value
    }
  }

  // Look for any field that looks like a phone number
  for (const [, value] of Object.entries(data)) {
    if (typeof value === 'string' && /^\+?[\d\s\-\(\)]{7,15}$/.test(value)) {
      return value
    }
  }

  return null
}

async function sendSingleMessage(phone: string, message: string, type: string): Promise<{ success: boolean, delivered: boolean }> {
  // This would integrate with your actual messaging service
  // For now, we'll simulate the API call
  
  try {
    if (type === 'sms') {
      // Call mspace-sms function or external SMS API
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/mspace-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          to: phone,
          message: message
        })
      })

      if (response.ok) {
        return { success: true, delivered: true }
      } else {
        return { success: false, delivered: false }
      }
    }

    // For other message types, implement accordingly
    return { success: true, delivered: true }

  } catch (error) {
    console.error('Message sending failed:', error)
    return { success: false, delivered: false }
  }
}