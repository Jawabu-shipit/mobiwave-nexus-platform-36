import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkOperationRequest {
  operation: 'export' | 'import' | 'validate' | 'merge'
  data?: any
  contactIds?: string[]
  options?: Record<string, any>
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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    const { operation, data, contactIds, options }: BulkOperationRequest = await req.json()

    let result: any = {}

    switch (operation) {
      case 'export':
        // Export contacts to CSV/JSON
        const { data: contacts, error: exportError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.user.id)

        if (exportError) throw exportError

        result = {
          contacts,
          format: options?.format || 'json',
          count: contacts.length
        }
        break

      case 'import':
        // Import contacts with validation
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid import data')
        }

        const contactsToImport = data.map(contact => ({
          ...contact,
          user_id: user.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { data: imported, error: importError } = await supabase
          .from('contacts')
          .insert(contactsToImport)
          .select()

        if (importError) throw importError

        result = {
          imported: imported.length,
          contacts: imported
        }
        break

      case 'validate':
        // Validate contact data
        if (!contactIds || contactIds.length === 0) {
          throw new Error('No contacts specified for validation')
        }

        const { data: validateContacts, error: validateError } = await supabase
          .from('contacts')
          .select('*')
          .in('id', contactIds)
          .eq('user_id', user.user.id)

        if (validateError) throw validateError

        const validationResults = validateContacts.map(contact => {
          const phoneValid = /^(\+254|254|0)[17][0-9]{8}$/.test(contact.phone?.replace(/\s/g, '') || '')
          const emailValid = contact.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) : true

          return {
            id: contact.id,
            name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
            phone: contact.phone,
            email: contact.email,
            phoneValid,
            emailValid,
            isValid: phoneValid && emailValid,
            errors: [
              ...(!phoneValid ? ['Invalid phone number format'] : []),
              ...(!emailValid ? ['Invalid email format'] : [])
            ]
          }
        })

        result = {
          total: validationResults.length,
          valid: validationResults.filter(r => r.isValid).length,
          invalid: validationResults.filter(r => !r.isValid).length,
          results: validationResults
        }
        break

      case 'merge':
        // Merge duplicate contacts
        if (!options?.keepContactId || !options?.duplicateIds) {
          throw new Error('Keep contact ID and duplicate IDs are required for merge operation')
        }

        // Delete duplicate contacts
        const { error: mergeError } = await supabase
          .from('contacts')
          .delete()
          .in('id', options.duplicateIds)
          .eq('user_id', user.user.id)

        if (mergeError) throw mergeError

        result = {
          mergedCount: options.duplicateIds.length,
          keepContactId: options.keepContactId
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Log the operation
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.user.id,
        action: `bulk_contact_${operation}`,
        resource_type: 'contacts',
        metadata: {
          operation,
          result,
          contactIds: contactIds || [],
        },
        severity: 'low',
      })

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in bulk-contact-operations function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})