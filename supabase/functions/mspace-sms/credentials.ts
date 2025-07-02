import { createClient } from "npm:@supabase/supabase-js"

export async function getApiCredentials(authHeader: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  if (!authHeader) {
    throw new Error('Authorization required')
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  
  if (authError || !user) {
    throw new Error('Invalid authorization')
  }

  const { data: credentials, error: credError } = await supabase
    .from('api_credentials')
    .select('*')
    .eq('user_id', user.id)
    .eq('service_name', 'mspace')
    .eq('is_active', true)
    .single()

  if (credError || !credentials) {
    throw new Error('Mspace API credentials not configured. Please configure them in Settings.')
  }

  const config = credentials.additional_config as Record<string, unknown>
  const apiKey = config?.api_key as string || Deno.env.get('MSPACE_API_KEY')
  const username = config?.username as string
  const defaultSenderId = config?.sender_id as string || 'MOBIWAVE'

  if (!apiKey || !username) {
    throw new Error('Incomplete Mspace API credentials. Please check your settings.')
  }

  return { user, apiKey, username, defaultSenderId }
}
