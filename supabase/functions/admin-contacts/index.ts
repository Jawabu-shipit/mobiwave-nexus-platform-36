import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkContactAction {
  action: 'delete' | 'activate' | 'suspend' | 'move' | 'email'
  contactIds: string[]
  groupId?: string
  emailContent?: string
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

    // Verify user is admin
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single()

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, contactIds, groupId, emailContent }: BulkContactAction = await req.json()

    if (!contactIds || contactIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No contacts selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: Record<string, unknown> = {}

    switch (action) {
      case 'delete': {
        const { error: deleteError } = await supabase
          .from('contacts')
          .delete()
          .in('id', contactIds)
        if (deleteError) throw deleteError
        result = { deleted: contactIds.length }
        break
      }
      case 'activate': {
        const { error: activateError } = await supabase
          .from('contacts')
          .update({ is_active: true })
          .in('id', contactIds)
        if (activateError) throw activateError
        result = { activated: contactIds.length }
        break
      }
      case 'suspend': {
        const { error: suspendError } = await supabase
          .from('contacts')
          .update({ is_active: false })
          .in('id', contactIds)
        if (suspendError) throw suspendError
        result = { suspended: contactIds.length }
        break
      }
      case 'move': {
        if (!groupId) {
          return new Response(
            JSON.stringify({ error: 'Group ID required for move action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        // Remove from all existing groups first
        const { error: removeError } = await supabase
          .from('contact_group_members')
          .delete()
          .in('contact_id', contactIds)
        if (removeError) throw removeError
        // Add to new group
        const insertData = contactIds.map(contactId => ({
          contact_id: contactId,
          group_id: groupId,
        }))
        const { error: addError } = await supabase
          .from('contact_group_members')
          .insert(insertData)
        if (addError) throw addError
        result = { moved: contactIds.length, groupId }
        break
      }
      case 'email': {
        // Get contact emails
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('email, first_name, last_name')
          .in('id', contactIds)
          .not('email', 'is', null)
        if (contactsError) throw contactsError
        // Here you would integrate with an email service
        // For now, just log the action
        console.log(`Sending email to ${contacts.length} contacts:`, emailContent)
        result = { emailsSent: contacts.length }
        break
      }
      default: {
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Log the admin action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.user.id,
        action: `bulk_contact_${action}`,
        resource_type: 'contacts',
        metadata: {
          contactIds,
          result,
          groupId: groupId || null,
        },
        severity: 'medium',
      })

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    let message = 'Unknown error'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    console.error('Error in admin-contacts function:', error)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})