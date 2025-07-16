import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, segment_id, criteria } = await req.json()

    console.log('Processing user segmentation:', { action, segment_id })

    if (action === 'refresh_segment_users') {
      // Refresh users in a segment based on criteria
      const { data: segment, error: segmentError } = await supabaseClient
        .from('user_segments')
        .select('*')
        .eq('id', segment_id)
        .single()

      if (segmentError || !segment) {
        throw new Error(`Segment not found: ${segmentError?.message}`)
      }

      // Build query based on criteria
      let query = supabaseClient
        .from('profiles')
        .select('id')

      // Apply criteria filters
      if (segment.criteria.user_type) {
        query = query.eq('user_type', segment.criteria.user_type)
      }

      if (segment.criteria.role) {
        query = query.eq('role', segment.criteria.role)
      }

      if (segment.criteria.created_after) {
        query = query.gte('created_at', segment.criteria.created_after)
      }

      let users: { id: string }[];
      let usersError;
      if (segment.criteria.has_premium_services) {
        // 1. Get user_ids with active premium services
        const { data: premiumSubs, error: premiumError } = await supabaseClient
          .from('user_service_subscriptions')
          .select('user_id')
          .eq('status', 'active')
          .in('service_id', ['premium_service_ids']) // Replace with actual premium service IDs

        if (premiumError) {
          throw new Error(`Failed to fetch premium subscriptions: ${premiumError.message}`)
        }
        const premiumUserIds = premiumSubs?.map((sub: { user_id: string }) => sub.user_id) || [];
        // 2. Filter profiles by those user_ids
        if (premiumUserIds.length > 0) {
          const result = await query.in('id', premiumUserIds)
          users = result.data ?? [];
          usersError = result.error;
        } else {
          users = [];
          usersError = undefined;
        }
      } else {
        const result = await query;
        users = result.data ?? [];
        usersError = result.error;
      }

      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`)
      }

      // Clear existing segment members
      await supabaseClient
        .from('user_segment_members')
        .delete()
        .eq('segment_id', segment_id)

      // Add new segment members
      if (users && users.length > 0) {
        const members = users.map((user: { id: string }) => ({
          segment_id: segment_id,
          user_id: user.id,
          added_at: new Date().toISOString()
        }))

        await supabaseClient
          .from('user_segment_members')
          .insert(members)
      }

      // Update segment user count
      await supabaseClient
        .from('user_segments')
        .update({ 
          user_count: users?.length || 0,
          last_updated: new Date().toISOString()
        })
        .eq('id', segment_id)

      console.log(`Refreshed segment ${segment_id} with ${users?.length || 0} users`)

      return new Response(
        JSON.stringify({
          message: 'Segment refreshed successfully',
          user_count: users?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'analyze_segment_potential') {
      // Analyze potential users for a segment based on criteria
      let query = supabaseClient
        .from('profiles')
        .select('id, role, user_type, created_at')

      // Apply criteria to see potential segment size
      if (criteria.user_type) {
        query = query.eq('user_type', criteria.user_type)
      }

      if (criteria.role) {
        query = query.eq('role', criteria.role)
      }

      if (criteria.created_after) {
        query = query.gte('created_at', criteria.created_after)
      }

      const { data: potentialUsers, error: analysisError } = await query

      if (analysisError) {
        throw new Error(`Failed to analyze segment: ${analysisError.message}`)
      }

      return new Response(
        JSON.stringify({
          message: 'Segment analysis completed',
          potential_users: potentialUsers?.length || 0,
          breakdown: {
            by_role: potentialUsers?.reduce((acc: Record<string, number>, user: { role: string }) => {
              acc[user.role] = (acc[user.role] || 0) + 1
              return acc
            }, {}),
            by_user_type: potentialUsers?.reduce((acc: Record<string, number>, user: { user_type: string }) => {
              acc[user.user_type] = (acc[user.user_type] || 0) + 1
              return acc
            }, {})
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )

  } catch (error) {
    console.error('User segmentation error:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
