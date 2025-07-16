
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js"
// ...existing code...

export async function authenticateUser(authHeader: string) {
  if (!authHeader) {
    throw new Error('Authorization required')
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError || !user) {
    throw new Error('Authentication failed: ' + (authError?.message || 'User not found'))
  }

  console.log('User authenticated:', user.id)
  return { supabase, user }
}

// Import the decryption function
import { decryptApiKey } from "../mspace-balance/index.ts";

export async function getApiCredentials(supabase: SupabaseClient, userId: string | null) {
  if (!userId) {
    throw new Error('User ID is required');
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

  // Get username from additional_config
  const config = credentials.additional_config as Record<string, unknown>;
  const username = config?.username as string;
  
  if (!username) {
    throw new Error('Username not found in credentials');
  }

  // Try to get the encrypted API key first
  let apiKeyValue: string;
  if (credentials.api_key_encrypted) {
    try {
      console.log('Using encrypted API key from database');
      apiKeyValue = await decryptApiKey(credentials.api_key_encrypted);
    } catch (decryptError) {
      console.error('Failed to decrypt API key:', decryptError);
      
      // Fallback to additional_config if decryption fails
      apiKeyValue = config?.api_key as string;
      
      if (!apiKeyValue) {
        throw new Error('Failed to decrypt API key and no fallback found in additional_config');
      }
    }
  } else {
    // If no encrypted key, try to get from additional_config
    apiKeyValue = config?.api_key as string;
    
    if (!apiKeyValue) {
      throw new Error('API key not found in credentials');
    }
  }

  return {
    apiKey: apiKeyValue,
    mspaceUsername: username
  };
}

interface ApiRequestConfig {
  operation: string;
  username: string;
  apiKey: string;
  clientname?: string;
  noOfSms?: number;
}

function getEndpointAndPayload(config: ApiRequestConfig) {
  const { operation, username, clientname, noOfSms } = config;
  let endpoint = '';
  type Payload =
    | { username: string }
    | { username: string; subaccname: string; noOfSms: number }
    | { username: string; clientname: string; noOfSms: number };
  let payload: Payload = { username };
  switch(operation) {
    case 'subAccounts':
    case 'querysubs':
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/subusers';
      break;
    case 'resellerClients':
    case 'queryresellerclients':
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/resellerclients';
      break;
    case 'topUpSubAccount':
    case 'topupsub':
      if (!clientname || !noOfSms) {
        throw new Error('Client name and SMS quantity required for top-up');
      }
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/subacctopup';
      payload = {
        username,
        subaccname: clientname,
        noOfSms
      };
      break;
    case 'topUpResellerClient':
    case 'topupresellerclient':
      if (!clientname || !noOfSms) {
        throw new Error('Client name and SMS quantity required for top-up');
      }
      endpoint = 'https://api.mspace.co.ke/smsapi/v2/resellerclienttopup';
      payload = {
        username,
        clientname,
        noOfSms
      };
      break;
    default:
      throw new Error(`Invalid operation: ${operation}`);
  }
  return { endpoint, payload };
}

// This function is no longer used - we've replaced it with a simpler implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _buildGetUrl(operation: string, endpoint: string, apiKey: string, username: string, clientname?: string, noOfSms?: number) {
  switch(operation) {
    case 'subAccounts':
    case 'querysubs':
      // Try the documented format for subusers
      return `${endpoint}/apikey=${apiKey}/username=${username}`;
    case 'resellerClients':
    case 'queryresellerclients':
      // Try the documented format for reseller clients
      return `${endpoint}/apikey=${apiKey}/username=${username}`;
    case 'topUpSubAccount':
    case 'topupsub':
      return `${endpoint}/apikey=${apiKey}/username=${username}/subaccname=${clientname}/noofsms=${noOfSms}`;
    case 'topUpResellerClient':
    case 'topupresellerclient':
      return `${endpoint}/apikey=${apiKey}/username=${username}/clientname=${clientname}/noofsms=${noOfSms}`;
    default:
      throw new Error(`GET URL not supported for operation: ${operation}`);
  }
}

// This function is no longer used - we've replaced it with a simpler implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _tryGetMethod(_config: ApiRequestConfig, _endpoint: string): never {
  console.warn('_tryGetMethod is deprecated and should not be used');
  throw new Error('This method is deprecated');
}

// No duplicate function needed

export async function makeApiRequest(config: ApiRequestConfig) {
  const { endpoint, payload } = getEndpointAndPayload(config);
  // Mask API key for logs
  const maskedApiKey = config.apiKey ? `${config.apiKey.slice(0, 6)}...${config.apiKey.slice(-4)}` : 'undefined';
  
  // Generate a request ID for tracking
  const requestId = crypto.randomUUID().substring(0, 8);
  
  console.log(`[${requestId}] Processing operation:`, config.operation);
  console.log(`[${requestId}] Username:`, config.username);
  console.log(`[${requestId}] API Key (masked):`, maskedApiKey);
  console.log(`[${requestId}] Endpoint:`, endpoint);
  console.log(`[${requestId}] Payload:`, JSON.stringify(payload));
  
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`[${requestId}] Attempt ${attempt + 1}/${maxRetries}`);
    
    try {
      // Use only POST method with JSON for consistency
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': config.apiKey,
          'X-Request-ID': requestId
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`[${requestId}] Response status:`, response.status, response.statusText);
      const responseText = await response.text();
      console.log(`[${requestId}] Response body:`, responseText);
      
      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status} ${response.statusText}`);
      }
      
      // Parse and validate the response
      try {
        // Try to parse as JSON first
        const jsonData = JSON.parse(responseText);
        
        // Handle different response formats based on operation
        if (config.operation === 'queryresellerclients' || config.operation === 'resellerClients') {
          // For reseller clients, we expect an array or an object with a resellerClients array
          if (Array.isArray(jsonData)) {
            // Direct array of clients
            console.log(`[${requestId}] Successfully parsed JSON array of clients:`, jsonData);
            return jsonData;
          } else if (jsonData && typeof jsonData === 'object') {
            if (Array.isArray(jsonData.resellerClients)) {
              // Object with resellerClients array
              console.log(`[${requestId}] Successfully parsed JSON with resellerClients array:`, jsonData.resellerClients);
              return jsonData.resellerClients;
            } else if (jsonData.message && typeof jsonData.message === 'string') {
              // Check if message contains client data in a different format
              console.log(`[${requestId}] Response contains message field, checking for client data`);
              
              // Try to parse the message as JSON if it looks like JSON
              if (jsonData.message.trim().startsWith('[') || jsonData.message.trim().startsWith('{')) {
                try {
                  const messageData = JSON.parse(jsonData.message);
                  if (Array.isArray(messageData)) {
                    console.log(`[${requestId}] Successfully parsed client data from message field:`, messageData);
                    return messageData;
                  }
                } catch (innerError) {
                  console.log(`[${requestId}] Failed to parse message as JSON:`, innerError);
                }
              }
              
              // If we get here, we couldn't find client data in the expected format
              console.warn(`[${requestId}] Could not find client data in response:`, jsonData);
              return []; // Return empty array instead of throwing
            }
          }
          
          // If we get here, the response didn't match any expected format
          console.warn(`[${requestId}] Response doesn't match expected format for reseller clients:`, jsonData);
          return []; // Return empty array instead of throwing
        } else {
          // For other operations, just return the parsed JSON
          console.log(`[${requestId}] Successfully parsed JSON response:`, jsonData);
          return jsonData;
        }
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse response as JSON:`, parseError);
        
        // For reseller clients, check if the response might be XML
        if ((config.operation === 'queryresellerclients' || config.operation === 'resellerClients') && 
            responseText.includes('<clientUserName>') && responseText.includes('<smsBalance>')) {
          
          console.log(`[${requestId}] Response appears to be XML, attempting to extract client data`);
          try {
            const clients = [];
            const clientMatches = responseText.match(/<client>[\s\S]*?<\/client>/gs);
            
            if (clientMatches && clientMatches.length > 0) {
              for (const clientXml of clientMatches) {
                const userNameMatch = clientXml.match(/<clientUserName>([\s\S]*?)<\/clientUserName>/);
                const balanceMatch = clientXml.match(/<smsBalance>([\s\S]*?)<\/smsBalance>/);
                
                if (userNameMatch && userNameMatch[1] && balanceMatch && balanceMatch[1]) {
                  clients.push({
                    clientUserName: userNameMatch[1].trim(),
                    smsBalance: balanceMatch[1].trim()
                  });
                }
              }
              
              if (clients.length > 0) {
                console.log(`[${requestId}] Successfully extracted ${clients.length} clients from XML`);
                return clients;
              }
            }
          } catch (xmlError) {
            console.error(`[${requestId}] Failed to extract client data from XML:`, xmlError);
          }
        }
        
        // If we get here, we couldn't parse the response
        throw new Error(`Could not parse response: ${responseText}`);
      }
    } catch (error) {
      lastError = error;
      console.error(`[${requestId}] Attempt ${attempt + 1} failed:`, error);
      
      // If this is the last attempt, we'll throw the error after the loop
      if (attempt < maxRetries - 1) {
        // Otherwise, wait before retrying with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`[${requestId}] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we've exhausted all retries and still don't have data, throw the last error
  throw lastError || new Error(`All API request attempts failed for operation: ${config.operation}`);
}

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
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const { operation, username: _username, clientname, noOfSms } = await req.json() as AccountOperation
    
    if (!operation) {
      throw new Error('Operation type is required')
    }

    console.log('Mspace accounts operation:', operation)

    const { supabase, user } = await authenticateUser(authHeader)
    if (!user) {
      throw new Error('Authentication required: user not found')
    }
    console.log('User authenticated successfully:', user.id)

    // Special operation to just check if credentials exist
    if (operation === 'checkCredentials') {
      try {
        // Check if credentials exist without actually retrieving the API key
        const { data: credentials, error: credError } = await supabase
          .from('api_credentials')
          .select('id, additional_config, api_key_encrypted')
          .eq('user_id', user.id)
          .eq('service_name', 'mspace')
          .eq('is_active', true)
          .single();
        
        // Define a type for the additional_config object
        interface AdditionalConfig {
          username?: string;
          [key: string]: unknown;
        }
        
        const exists = !credError && !!credentials && (
          !!credentials.api_key_encrypted || 
          (credentials.additional_config && 
           typeof credentials.additional_config === 'object' && 
           'username' in (credentials.additional_config as AdditionalConfig))
        );
        
        console.log('Credentials check result:', exists);
        return new Response(JSON.stringify({ exists }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (checkError) {
        console.error('Error checking credentials:', checkError);
        return new Response(JSON.stringify({ exists: false, error: String(checkError) }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // For all other operations, get the full credentials
    const { apiKey, mspaceUsername } = await getApiCredentials(supabase, user.id)
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

  } catch (error: unknown) {
    console.error('Error in mspace-accounts function:', error);
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Categorize errors for better client-side handling
    let errorType = 'UNKNOWN_ERROR';
    
    if (errorMessage.includes('API returned error status')) {
      statusCode = 502; // Bad Gateway - upstream API error
      errorType = 'API_ERROR';
    } else if (errorMessage.includes('Authentication') || errorMessage.includes('credentials') || 
               errorMessage.includes('Authorization')) {
      statusCode = 401; // Unauthorized
      errorType = 'AUTH_ERROR';
    } else if (errorMessage.includes('parse') || errorMessage.includes('Invalid')) {
      statusCode = 422; // Unprocessable Entity - parsing error
      errorType = 'PARSING_ERROR';
    } else if (errorMessage.includes('Operation type')) {
      statusCode = 400; // Bad Request - invalid operation
      errorType = 'INVALID_OPERATION';
    }
    
    // Create a structured error response
    const errorResponse = {
      error: errorMessage,
      errorType: errorType,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID().substring(0, 8),
      operation: req.method
    };
    
    // Log the structured error for easier debugging
    console.error('Structured error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
