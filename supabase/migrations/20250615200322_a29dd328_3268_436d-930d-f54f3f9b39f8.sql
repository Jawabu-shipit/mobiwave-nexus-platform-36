
-- Create missing tables for Phase 7 functionality

-- User segments table for user segmentation
CREATE TABLE public.user_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  user_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User segment members table
CREATE TABLE public.user_segment_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID REFERENCES public.user_segments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(segment_id, user_id)
);

-- Webhook endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]',
  secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_delivery TIMESTAMP WITH TIME ZONE,
  delivery_success_rate NUMERIC DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0
);

-- Webhook deliveries table
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service templates table
CREATE TABLE public.service_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_segments
CREATE POLICY "Authenticated users can view user segments" ON public.user_segments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin users can manage user segments" ON public.user_segments
  FOR ALL TO authenticated 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- RLS policies for user_segment_members
CREATE POLICY "Authenticated users can view segment members" ON public.user_segment_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin users can manage segment members" ON public.user_segment_members
  FOR ALL TO authenticated 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- RLS policies for webhook_endpoints
CREATE POLICY "Authenticated users can view webhooks" ON public.webhook_endpoints
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin users can manage webhooks" ON public.webhook_endpoints
  FOR ALL TO authenticated 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- RLS policies for webhook_deliveries
CREATE POLICY "Authenticated users can view webhook deliveries" ON public.webhook_deliveries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert webhook deliveries" ON public.webhook_deliveries
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS policies for service_templates
CREATE POLICY "Authenticated users can view service templates" ON public.service_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin users can manage service templates" ON public.service_templates
  FOR ALL TO authenticated 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Function to update webhook stats
CREATE OR REPLACE FUNCTION update_webhook_stats(webhook_id UUID, success BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.webhook_endpoints 
  SET 
    total_deliveries = total_deliveries + 1,
    delivery_success_rate = (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE wd.success = true)::FLOAT / COUNT(*)::FLOAT) * 100, 
        0
      )
      FROM public.webhook_deliveries wd 
      WHERE wd.webhook_id = update_webhook_stats.webhook_id
    ),
    last_delivery = now()
  WHERE id = webhook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
