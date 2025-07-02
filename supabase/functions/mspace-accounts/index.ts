
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { authenticateUser, getApiCredentials } from './auth.ts'
import { makeApiRequest } from './api-client.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AccountOperation {
  operation: string;
  username?: string;
  clientname?: string;
  noOfSms?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { operation, username: _username, clientname, noOfSms } = await req.json() as AccountOperation
    
    if (!operation) {
      throw new Error('Operation type is required')
    }

    console.log('Mspace accounts operation:', operation)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    const { supabase, user } = await authenticateUser(authHeader)
    if (user) {
      console.log('User authenticated successfully:', user.id)
    } else {
      console.log('Using environment variables for authentication')
    }
    
    const { apiKey, mspaceUsername } = await getApiCredentials(supabase, user?.id || null)
    console.log('API credentials retrieved for username:', mspaceUsername)

    const responseData = await makeApiRequest({
      operation,
      username: mspaceUsername,
      apiKey,
      clientname,
      noOfSms
    })

    console.log('Final response data:', responseData)
    return new Response(JSON.stringify(responseData), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in mspace-accounts function:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('Authorization') || error.message.includes('credentials')) {
        statusCode = 401;
      } else if (error.message.includes('Operation type')) {
        statusCode = 400;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        operation: req.method
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
