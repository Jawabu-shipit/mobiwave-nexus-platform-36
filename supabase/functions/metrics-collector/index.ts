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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get real-time system metrics
    const [
      { data: campaigns },
      { data: users },
      { data: services },
      { data: subscriptions }
    ] = await Promise.all([
      supabase.from('campaigns').select('status, sent_count, delivered_count, failed_count'),
      supabase.from('profiles').select('id, created_at'),
      supabase.from('services_catalog').select('id, is_active'),
      supabase.from('user_service_subscriptions').select('status')
    ])

    const metrics = {
      campaigns: {
        total: campaigns?.length || 0,
        active: campaigns?.filter((c: { status: string }) => c.status === 'sending').length || 0,
        completed: campaigns?.filter((c: { status: string }) => c.status === 'sent').length || 0,
        totalSent: campaigns?.reduce((sum: number, c: { sent_count?: number }) => sum + (c.sent_count || 0), 0) || 0,
        totalDelivered: campaigns?.reduce((sum: number, c: { delivered_count?: number }) => sum + (c.delivered_count || 0), 0) || 0
      },
      users: {
        total: users?.length || 0,
        newToday: users?.filter((u: { created_at: string }) => {
          const today = new Date().toDateString()
          return new Date(u.created_at).toDateString() === today
        }).length || 0
      },
      services: {
        total: services?.length || 0,
        active: services?.filter((s: { is_active: boolean }) => s.is_active).length || 0
      },
      subscriptions: {
        total: subscriptions?.length || 0,
        active: subscriptions?.filter((s: { status: string }) => s.status === 'active').length || 0,
        pending: subscriptions?.filter((s: { status: string }) => s.status === 'pending').length || 0
      },
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ success: true, metrics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Metrics collector error:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})