
-- Phase 1: Critical Security Fixes

-- 1. Create RLS policies for api_credentials table
CREATE POLICY "Users can view own API credentials" 
ON public.api_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API credentials" 
ON public.api_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API credentials" 
ON public.api_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API credentials" 
ON public.api_credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on api_credentials
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for WhatsApp tables
ALTER TABLE public.whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own WhatsApp subscriptions" 
ON public.whatsapp_subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_service_subscriptions uss 
    WHERE uss.id = subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own WhatsApp subscriptions" 
ON public.whatsapp_subscriptions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_service_subscriptions uss 
    WHERE uss.id = subscription_id AND uss.user_id = auth.uid()
  )
);

-- 3. Create RLS policies for WhatsApp templates
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own WhatsApp templates" 
ON public.whatsapp_templates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.whatsapp_subscriptions ws
    JOIN public.user_service_subscriptions uss ON ws.subscription_id = uss.id
    WHERE ws.id = subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own WhatsApp templates" 
ON public.whatsapp_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.whatsapp_subscriptions ws
    JOIN public.user_service_subscriptions uss ON ws.subscription_id = uss.id
    WHERE ws.id = subscription_id AND uss.user_id = auth.uid()
  )
);

-- 4. Create RLS policies for WhatsApp messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own WhatsApp messages" 
ON public.whatsapp_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.whatsapp_subscriptions ws
    JOIN public.user_service_subscriptions uss ON ws.subscription_id = uss.id
    WHERE ws.id = subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own WhatsApp messages" 
ON public.whatsapp_messages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.whatsapp_subscriptions ws
    JOIN public.user_service_subscriptions uss ON ws.subscription_id = uss.id
    WHERE ws.id = subscription_id AND uss.user_id = auth.uid()
  )
);

-- 5. Secure Mspace tables (admin only access)
ALTER TABLE public.mspace_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access Mspace users" 
ON public.mspace_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  )
);

-- 6. Create security events table for audit logging
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB DEFAULT '{}',
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security_events (admin access only)
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access security events" 
ON public.security_events 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  )
);

-- 7. Add failed login tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 8. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type VARCHAR(100),
  p_severity VARCHAR(20) DEFAULT 'medium',
  p_details JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    details
  ) VALUES (
    auth.uid(),
    p_event_type,
    p_severity,
    p_details
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;
