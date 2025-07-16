
-- Phase 5: SMS Survey Platform tables
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  question_flow JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  target_audience JSONB DEFAULT '{}'::jsonb,
  distribution_channels JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  respondent_phone TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);

-- Phase 6: Service Desk Integration tables
CREATE TABLE public.service_desk_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.service_desk_subscriptions(id) NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed')),
  assigned_to UUID,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  sla_due_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.service_desk_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('comment', 'status_change', 'assignment', 'priority_change')),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rewards System tables
CREATE TABLE public.reward_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('airtime', 'data_bundle')),
  amount NUMERIC NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  budget NUMERIC NOT NULL,
  spent NUMERIC NOT NULL DEFAULT 0,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  successful_distributions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.reward_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.reward_campaigns(id) ON DELETE CASCADE NOT NULL,
  recipient_phone TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  provider_reference TEXT,
  error_message TEXT,
  distributed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 7: Analytics and API Management tables
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  event_type TEXT NOT NULL,
  service_type TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_desk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own surveys" ON public.surveys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view survey responses for their surveys" ON public.survey_responses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.surveys WHERE id = survey_responses.survey_id AND user_id = auth.uid()
  ));

CREATE POLICY "Anyone can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage tickets in their service desk" ON public.service_desk_tickets
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.service_desk_subscriptions sds
    JOIN public.user_service_subscriptions uss ON sds.subscription_id = uss.id
    WHERE sds.id = service_desk_tickets.subscription_id AND uss.user_id = auth.uid()
  ));

CREATE POLICY "Users can view ticket activities for accessible tickets" ON public.ticket_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.service_desk_tickets sdt
    JOIN public.service_desk_subscriptions sds ON sdt.subscription_id = sds.id
    JOIN public.user_service_subscriptions uss ON sds.subscription_id = uss.id
    WHERE sdt.id = ticket_activities.ticket_id AND uss.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own reward campaigns" ON public.reward_campaigns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view distributions for their campaigns" ON public.reward_distributions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.reward_campaigns WHERE id = reward_distributions.campaign_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own analytics events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view usage for their API keys" ON public.api_usage
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.api_keys WHERE id = api_usage.api_key_id AND user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_surveys_user_id ON public.surveys(user_id);
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_service_desk_tickets_subscription_id ON public.service_desk_tickets(subscription_id);
CREATE INDEX idx_ticket_activities_ticket_id ON public.ticket_activities(ticket_id);
CREATE INDEX idx_reward_campaigns_user_id ON public.reward_campaigns(user_id);
CREATE INDEX idx_reward_distributions_campaign_id ON public.reward_distributions(campaign_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_usage_api_key_id ON public.api_usage(api_key_id);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at);

-- Generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TKT-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM now()) * 1000)::BIGINT::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON public.service_desk_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Function to log analytics events
CREATE OR REPLACE FUNCTION log_analytics_event(
  p_event_type TEXT,
  p_service_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_revenue NUMERIC DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (user_id, event_type, service_type, metadata, revenue)
  VALUES (auth.uid(), p_event_type, p_service_type, p_metadata, p_revenue)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
