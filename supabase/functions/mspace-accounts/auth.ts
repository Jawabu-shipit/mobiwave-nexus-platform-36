import { serve as _serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js"

export async function authenticateUser(authHeader: string) {
  if (!authHeader) {
    throw new Error('Authorization required')
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      console.log('Authentication failed, will use environment variables:', authError?.message)
      // Return null user to indicate fallback to environment variables
      return { supabase, user: null }
    }

    console.log('User authenticated:', user.id)
    return { supabase, user }
  } catch (error) {
    console.log('Authentication error, will use environment variables:', error)
    return { supabase, user: null }
  }
}

export async function getApiCredentials(supabase: SupabaseClient, userId: string | null) {
  // First, try to get credentials from environment variables (more secure)
  const apiKey = Deno.env.get('MSPACE_API_KEY')
  const mspaceUsername = Deno.env.get('MSPACE_USERNAME')

  if (apiKey && mspaceUsername) {
    console.log('Using environment variables for Mspace credentials')
    return { apiKey, mspaceUsername }
  }

  // If no user ID, we can't check database credentials
  if (!userId) {
    throw new Error('Mspace API credentials not configured. Please set MSPACE_API_KEY and MSPACE_USERNAME environment variables.')
  }

  // Fallback to database (for user-specific credentials if needed)
  const { data: credentials, error: credError } = await supabase
    .from('api_credentials')
    .select('*')
    .eq('user_id', userId)
    .eq('service_name', 'mspace')
    .eq('is_active', true)
    .single()

  if (credError || !credentials) {
    console.error('Credentials error:', credError)
    throw new Error('Mspace API credentials not configured. Please set MSPACE_API_KEY and MSPACE_USERNAME environment variables or configure them in Settings.')
  }

  const config = credentials.additional_config as Record<string, unknown>
  const dbApiKey = config?.api_key as string
  const dbUsername = config?.username as string

  if (!dbApiKey || !dbUsername) {
    throw new Error('Incomplete Mspace API credentials. API key and username are required.')
  }

  console.log('Using database credentials for Mspace (consider using environment variables for better security)')
  return { apiKey: dbApiKey, mspaceUsername: dbUsername }
}
