import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubUser {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  permissions?: Record<string, unknown>;
  credits_allocated?: number;
  service_access?: Record<string, unknown>;
  is_active?: boolean;
}

interface SubUserRequest {
  action: 'create' | 'update' | 'delete' | 'list' | 'allocateCredits';
  sub_user?: SubUser;
  sub_user_id?: string;
  credits_amount?: number;
  filters?: {
    is_active?: boolean;
    role?: string;
    limit?: number;
    offset?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, sub_user, sub_user_id, credits_amount, filters }: SubUserRequest = await req.json()

    switch (action) {
      case 'create': {
        if (!sub_user || !sub_user.email) {
          return new Response(
            JSON.stringify({ error: 'Sub-user email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if email already exists
        const { data: existingUser } = await supabaseClient
          .from('sub_users')
          .select('id')
          .eq('email', sub_user.email)
          .single()

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'Email already in use' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: newSubUser, error: createError } = await supabaseClient
          .from('sub_users')
          .insert({
            parent_user_id: user.id,
            email: sub_user.email,
            first_name: sub_user.first_name,
            last_name: sub_user.last_name,
            role: sub_user.role || 'sub_user',
            permissions: sub_user.permissions || {},
            credits_allocated: sub_user.credits_allocated || 0,
            service_access: sub_user.service_access || {},
            is_active: sub_user.is_active !== undefined ? sub_user.is_active : true
          })
          .select()
          .single()

        if (createError) throw createError

        return new Response(
          JSON.stringify({ data: newSubUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'list': {
        let query = supabaseClient
          .from('sub_users')
          .select('*')
          .eq('parent_user_id', user.id)
          .order('created_at', { ascending: false })

        if (filters?.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active)
        }
        if (filters?.role) {
          query = query.eq('role', filters.role)
        }
        if (filters?.limit) {
          query = query.limit(filters.limit)
        }
        if (filters?.offset) {
          query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1)
        }

        const { data: subUsers, error: listError } = await query

        if (listError) throw listError

        return new Response(
          JSON.stringify({ data: subUsers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        if (!sub_user_id || !sub_user) {
          return new Response(
            JSON.stringify({ error: 'Sub-user ID and data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedSubUser, error: updateError } = await supabaseClient
          .from('sub_users')
          .update({
            first_name: sub_user.first_name,
            last_name: sub_user.last_name,
            role: sub_user.role,
            permissions: sub_user.permissions,
            service_access: sub_user.service_access,
            is_active: sub_user.is_active
          })
          .eq('id', sub_user_id)
          .eq('parent_user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ data: updatedSubUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'allocateCredits': {
        if (!sub_user_id || credits_amount === undefined) {
          return new Response(
            JSON.stringify({ error: 'Sub-user ID and credits amount required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get current sub-user data
        const { data: currentSubUser, error: getCurrentError } = await supabaseClient
          .from('sub_users')
          .select('credits_allocated')
          .eq('id', sub_user_id)
          .eq('parent_user_id', user.id)
          .single()

        if (getCurrentError) throw getCurrentError

        const newCreditsAllocated = (currentSubUser.credits_allocated || 0) + credits_amount

        const { data: creditUpdatedUser, error: creditUpdateError } = await supabaseClient
          .from('sub_users')
          .update({
            credits_allocated: newCreditsAllocated
          })
          .eq('id', sub_user_id)
          .eq('parent_user_id', user.id)
          .select()
          .single()

        if (creditUpdateError) throw creditUpdateError

        return new Response(
          JSON.stringify({ data: creditUpdatedUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        if (!sub_user_id) {
          return new Response(
            JSON.stringify({ error: 'Sub-user ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('sub_users')
          .delete()
          .eq('id', sub_user_id)
          .eq('parent_user_id', user.id)

        if (deleteError) throw deleteError

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default: {
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
  } catch (error: unknown) {
    console.error('Error in sub-users function:', error)
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})