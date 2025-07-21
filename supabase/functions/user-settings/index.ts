import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SettingsRequest {
  action: 'get' | 'update' | 'getNotificationPreferences' | 'updateNotificationPreferences';
  settings?: {
    theme?: string;
    timezone?: string;
    language?: string;
    dashboard_layout?: Record<string, unknown>;
    auto_save?: boolean;
    two_factor_enabled?: boolean;
    session_timeout?: number;
  };
  notification_preferences?: {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    push_notifications?: boolean;
    marketing_notifications?: boolean;
    notification_types?: Record<string, unknown>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
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

    const { action, settings, notification_preferences }: SettingsRequest = await req.json()

    switch (action) {
      case 'get': {
        const { data: userSettings, error: getError } = await supabaseClient
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (getError && getError.code !== 'PGRST116') {
          throw getError
        }

        if (!userSettings) {
          // Create default settings
          const { data: newSettings, error: createError } = await supabaseClient
            .from('user_settings')
            .insert({
              user_id: user.id,
              theme: 'light',
              timezone: 'UTC',
              language: 'en',
              dashboard_layout: {},
              auto_save: true,
              two_factor_enabled: false,
              session_timeout: 3600
            })
            .select()
            .single()

          if (createError) throw createError

          return new Response(
            JSON.stringify({ data: newSettings }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ data: userSettings }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      case 'update': {
        if (!settings) {
          return new Response(
            JSON.stringify({ error: 'Settings data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedSettings, error: updateError } = await supabaseClient
          .from('user_settings')
          .upsert({
            user_id: user.id,
            ...settings
          })
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ data: updatedSettings }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      case 'getNotificationPreferences': {
        const { data: notifPrefs, error: getNotifError } = await supabaseClient
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (getNotifError && getNotifError.code !== 'PGRST116') {
          throw getNotifError
        }

        if (!notifPrefs) {
          // Create default notification preferences
          const { data: newNotifPrefs, error: createNotifError } = await supabaseClient
            .from('notification_preferences')
            .insert({
              user_id: user.id,
              email_notifications: true,
              sms_notifications: false,
              push_notifications: true,
              marketing_notifications: false,
              notification_types: {
                system: true,
                billing: true,
                security: true,
                campaigns: true
              }
            })
            .select()
            .single()

          if (createNotifError) throw createNotifError

          return new Response(
            JSON.stringify({ data: newNotifPrefs }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ data: notifPrefs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      case 'updateNotificationPreferences': {
        if (!notification_preferences) {
          return new Response(
            JSON.stringify({ error: 'Notification preferences data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedNotifPrefs, error: updateNotifError } = await supabaseClient
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            ...notification_preferences
          })
          .select()
          .single()

        if (updateNotifError) throw updateNotifError

        return new Response(
          JSON.stringify({ data: updatedNotifPrefs }),
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
  } catch (error) {
    console.error('Error in user-settings function:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json',
        },
      }
    )
  }
})