import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  contactIds: string[]
  validationType: 'phone' | 'email' | 'all'
}

// Phone validation function for Kenyan numbers
function validateKenyanPhone(phone: string): { isValid: boolean; formatted?: string; error?: string } {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }

  // Remove all non-digits
  const cleaned = phone.replace(/[^0-9]/g, '')
  
  // Handle different formats
  if (cleaned.match(/^07[0-9]{8}$/)) {
    // Convert 07xxxxxxxx to +254xxxxxxxx
    return { isValid: true, formatted: '+254' + cleaned.substr(1) }
  } else if (cleaned.match(/^01[0-9]{8}$/)) {
    // Convert 01xxxxxxxx to +254xxxxxxxx  
    return { isValid: true, formatted: '+254' + cleaned.substr(1) }
  } else if (cleaned.match(/^2547[0-9]{8}$/)) {
    // 2547xxxxxxxx to +2547xxxxxxxx
    return { isValid: true, formatted: '+' + cleaned }
  } else if (cleaned.match(/^2541[0-9]{8}$/)) {
    // 2541xxxxxxxx to +2541xxxxxxxx
    return { isValid: true, formatted: '+' + cleaned }
  } else if (cleaned.length === 12 && cleaned.match(/^254[17][0-9]{8}$/)) {
    // Valid 12-digit starting with 254
    return { isValid: true, formatted: '+' + cleaned }
  } else {
    return { isValid: false, error: 'Invalid Kenyan phone number format' }
  }
}

// Email validation function
function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: true } // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return {
    isValid: emailRegex.test(email),
    error: emailRegex.test(email) ? undefined : 'Invalid email format'
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify user authentication
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { contactIds, validationType }: ValidationRequest = await req.json()

    if (!contactIds || contactIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No contacts specified for validation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get contacts to validate
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, phone, email, first_name, last_name')
      .in('id', contactIds)
      .eq('user_id', user.user.id)

    if (contactsError) {
      throw contactsError
    }

    interface ValidationResult {
      id: string
      name: string
      originalPhone: string | null
      originalEmail: string | null
      isValid: boolean
      errors: (string | undefined)[]
      phoneValidation?: { isValid: boolean; formatted?: string; error?: string }
      formattedPhone?: string
      emailValidation?: { isValid: boolean; error?: string }
    }
    const validationResults: ValidationResult[] = contacts.map(contact => {
      const result: ValidationResult = {
        id: contact.id,
        name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown',
        originalPhone: contact.phone,
        originalEmail: contact.email,
        isValid: true,
        errors: []
      }

      // Validate phone if requested
      if (validationType === 'phone' || validationType === 'all') {
        const phoneValidation = validateKenyanPhone(contact.phone)
        result.phoneValidation = phoneValidation
        if (!phoneValidation.isValid) {
          result.isValid = false
          result.errors.push(phoneValidation.error)
        } else {
          result.formattedPhone = phoneValidation.formatted
        }
      }

      // Validate email if requested
      if (validationType === 'email' || validationType === 'all') {
        const emailValidation = validateEmail(contact.email)
        result.emailValidation = emailValidation
        if (!emailValidation.isValid) {
          result.isValid = false
          result.errors.push(emailValidation.error)
        }
      }

      return result
    })

    const summary = {
      total: validationResults.length,
      valid: validationResults.filter(r => r.isValid).length,
      invalid: validationResults.filter(r => !r.isValid).length,
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        summary,
        results: validationResults
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    let message = 'Unknown error'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    console.error('Error in contact-validation function:', error)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})