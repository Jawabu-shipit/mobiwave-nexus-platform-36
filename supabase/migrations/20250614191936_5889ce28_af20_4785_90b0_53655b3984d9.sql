
-- Create WhatsApp messages table for storing sent messages
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.whatsapp_subscriptions(id),
  recipient_phone VARCHAR NOT NULL,
  message_type VARCHAR NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  template_name VARCHAR,
  template_language VARCHAR DEFAULT 'en',
  template_components JSONB DEFAULT '[]'::jsonb,
  whatsapp_message_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp templates table for storing message templates
CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.whatsapp_subscriptions(id),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL DEFAULT 'marketing',
  language VARCHAR NOT NULL DEFAULT 'en',
  header_type VARCHAR,
  header_text TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,
  status VARCHAR NOT NULL DEFAULT 'pending',
  whatsapp_template_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for whatsapp_messages
CREATE POLICY "Users can view their subscription messages" 
  ON public.whatsapp_messages 
  FOR SELECT 
  USING (
    subscription_id IN (
      SELECT ws.id 
      FROM public.whatsapp_subscriptions ws
      JOIN public.user_service_subscriptions uss ON uss.id = ws.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their subscription messages" 
  ON public.whatsapp_messages 
  FOR INSERT 
  WITH CHECK (
    subscription_id IN (
      SELECT ws.id 
      FROM public.whatsapp_subscriptions ws
      JOIN public.user_service_subscriptions uss ON uss.id = ws.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their subscription messages" 
  ON public.whatsapp_messages 
  FOR UPDATE 
  USING (
    subscription_id IN (
      SELECT ws.id 
      FROM public.whatsapp_subscriptions ws
      JOIN public.user_service_subscriptions uss ON uss.id = ws.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );

-- Create RLS policies for whatsapp_templates
CREATE POLICY "Users can view their subscription templates" 
  ON public.whatsapp_templates 
  FOR SELECT 
  USING (
    subscription_id IN (
      SELECT ws.id 
      FROM public.whatsapp_subscriptions ws
      JOIN public.user_service_subscriptions uss ON uss.id = ws.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their subscription templates" 
  ON public.whatsapp_templates 
  FOR INSERT 
  WITH CHECK (
    subscription_id IN (
      SELECT ws.id 
      FROM public.whatsapp_subscriptions ws
      JOIN public.user_service_subscriptions uss ON uss.id = ws.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their subscription templates" 
  ON public.whatsapp_templates 
  FOR UPDATE 
  USING (
    subscription_id IN (
      SELECT ws.id 
      FROM public.whatsapp_subscriptions ws
      JOIN public.user_service_subscriptions uss ON uss.id = ws.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their subscription templates" 
  ON public.whatsapp_templates 
  FOR DELETE 
  USING (
    subscription_id IN (
      SELECT ws.id 
      FROM public.whatsapp_subscriptions ws
      JOIN public.user_service_subscriptions uss ON uss.id = ws.subscription_id
      WHERE uss.user_id = auth.uid()
    )
  );
