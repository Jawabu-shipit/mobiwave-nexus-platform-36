import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Notification {
  user_id?: string;
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
}

interface NotificationRequest {
  action: 'create' | 'update' | 'delete' | 'markRead' | 'list';
  notification?: Notification;
  notification_id?: string;
  filters?: {
    status?: string;
    type?: string;
    category?: string;
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

    const { action, notification, notification_id, filters }: NotificationRequest = await req.json()

    switch (action) {
      case 'create': {
        if (!notification) {
          return new Response(
            JSON.stringify({ error: 'Notification data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: newNotification, error: createError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: notification.user_id || user.id,
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info',
            category: notification.category || 'general',
            priority: notification.priority || 'normal',
            action_url: notification.action_url,
            metadata: notification.metadata || {},
            expires_at: notification.expires_at
          })
          .select()
          .single()

        if (createError) throw createError

        return new Response(
          JSON.stringify({ data: newNotification }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'list': {
        let query = supabaseClient
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (filters?.status) {
          query = query.eq('status', filters.status)
        }
        if (filters?.type) {
          query = query.eq('type', filters.type)
        }
        if (filters?.category) {
          query = query.eq('category', filters.category)
        }
        if (filters?.limit) {
          query = query.limit(filters.limit)
        }
        if (filters?.offset) {
          query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1)
        }

        const { data: notifications, error: listError } = await query

        if (listError) throw listError

        return new Response(
          JSON.stringify({ data: notifications }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'markRead': {
        if (!notification_id) {
          return new Response(
            JSON.stringify({ error: 'Notification ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedNotification, error: updateError } = await supabaseClient
          .from('notifications')
          .update({
            status: 'read',
            read_at: new Date().toISOString()
          })
          .eq('id', notification_id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ data: updatedNotification }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        if (!notification_id) {
          return new Response(
            JSON.stringify({ error: 'Notification ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('notifications')
          .delete()
          .eq('id', notification_id)
          .eq('user_id', user.id)

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
    console.error('Error in notifications function:', error)
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