import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error: Type declarations not found for esm.sh imports, safe to ignore for Deno Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

interface MenuNode {
  id: string;
  text: string;
  options: string[];
  isEndNode: boolean;
}

interface USSDResponse {
  sessionId: string;
  phoneNumber: string;
  text: string;
  action: 'CON' | 'END';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Require Authorization header and authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    // Deno.env is not always available in Edge Functions, wrap in try/catch for compatibility
    // Use globalThis for Edge Function compatibility
    const supabaseUrl = (globalThis as unknown as Record<string, string>).SUPABASE_URL ?? ''
    const supabaseKey = (globalThis as unknown as Record<string, string>).SUPABASE_SERVICE_ROLE_KEY ?? ''
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authenticated user required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { sessionId, serviceCode, phoneNumber, text } = await req.json() as USSDRequest

    console.log('USSD webhook request:', { sessionId, serviceCode, phoneNumber, text })

    // Find the USSD application for this service code
    const { data: creds, error: credsError } = await supabase
      .from('api_credentials')
      .select('username, api_key')
      .eq('user_id', user.id)
      .eq('service_name', 'mspace')
      .eq('is_active', true)
      .single();

    if (credsError || !creds) {
      return new Response(
        JSON.stringify({ error: 'Mspace API credentials not found for user.' }),
        { status: 403 }
      );
    }

    const apiKey = creds.api_key;
    const username = creds.username;

    const { data: application, error: appError } = await supabase
      .from('mspace_ussd_applications')
      .select('*')
      .eq('service_code', serviceCode)
      .eq('status', 'active')
      .single()

    if (appError || !application) {
      console.error('Application not found:', appError)
      return new Response(
        JSON.stringify({
          sessionId,
          phoneNumber,
          text: 'Service temporarily unavailable.',
          action: 'END'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const menuStructure = application.menu_structure as MenuNode[]
    
    // Parse user input path
    const inputSteps = text ? text.split('*').filter(step => step.length > 0) : []
    // Navigate through menu structure
    let currentNode: MenuNode = menuStructure.find(node => node.id === 'root') || menuStructure[0]
    const navigationPath: string[] = [currentNode.id]
    
    // Process each input step
    for (let i = 0; i < inputSteps.length; i++) {
      const input = inputSteps[i]
      const optionIndex = parseInt(input) - 1
      if (currentNode.isEndNode) {
        break
      }
      
      if (optionIndex < 0 || optionIndex >= currentNode.options.length) {
        // Invalid input - show error and current menu
        const response: USSDResponse = {
          sessionId,
          phoneNumber,
          text: `Invalid input. Please try again.\n\n${currentNode.text}\n${
            currentNode.options.map((option: string, idx: number) => `${idx + 1}. ${option}`).join('\n')
          }`,
          action: 'CON'
        }
        
        return new Response(
          JSON.stringify(response),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Try to find next node based on selected option
      const selectedOption = currentNode.options[optionIndex]
      const nextNode = menuStructure.find(node => 
        node.id !== currentNode.id && 
        (node.text.toLowerCase().includes(selectedOption.toLowerCase()) ||
         node.id.toLowerCase().includes(selectedOption.toLowerCase().replace(/\s+/g, '_')))
      )
      
      if (nextNode) {
        currentNode = nextNode
        navigationPath.push(currentNode.id)
      } else {
        // No matching node found - treat as end
        const response: USSDResponse = {
          sessionId,
          phoneNumber,
          text: `Thank you for using ${serviceCode}. Session ended.`,
          action: 'END'
        }
        
        return new Response(
          JSON.stringify(response),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    // Log session for analytics
    try {
      await supabase
        .from('ussd_sessions')
        .insert({
          session_id: sessionId,
          application_id: application.id,
          phone_number: phoneNumber,
          current_node_id: currentNode.id,
          input_path: inputSteps,
          navigation_path: navigationPath
        })
    } catch (error) {
      console.error('Failed to log session:', error)
    }
    
    // Prepare response
    let responseText = currentNode.text
    let action: 'CON' | 'END' = 'END'
    
    if (!currentNode.isEndNode && currentNode.options.length > 0) {
      responseText += '\n' + currentNode.options.map((option: string, idx: number) => `${idx + 1}. ${option}`).join('\n')
      action = 'CON'
    }
    
    const response: USSDResponse = {
      sessionId,
      phoneNumber,
      text: responseText,
      action
    }

    console.log('USSD response:', response)
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in USSD webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
