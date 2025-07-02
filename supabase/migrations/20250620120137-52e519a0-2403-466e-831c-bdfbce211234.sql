
-- Create WhatsApp Subscriptions table first
CREATE TABLE IF NOT EXISTS whatsapp_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_service_subscriptions(id),
  phone_number_id VARCHAR(50) NOT NULL,
  business_account_id VARCHAR(50) NOT NULL,
  webhook_url TEXT NOT NULL,
  verify_token VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  message_limit INTEGER DEFAULT 1000,
  current_messages INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS Policy for WhatsApp subscriptions
ALTER TABLE whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their WhatsApp subscriptions" ON whatsapp_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = whatsapp_subscriptions.subscription_id AND uss.user_id = auth.uid())
);

CREATE POLICY "Users can create their WhatsApp subscriptions" ON whatsapp_subscriptions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = whatsapp_subscriptions.subscription_id AND uss.user_id = auth.uid())
);

CREATE POLICY "Users can update their WhatsApp subscriptions" ON whatsapp_subscriptions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = whatsapp_subscriptions.subscription_id AND uss.user_id = auth.uid())
);

-- Now create WhatsApp Templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES whatsapp_subscriptions(id),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  header_type VARCHAR(20),
  header_text TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'pending',
  whatsapp_template_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create WhatsApp Messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES whatsapp_subscriptions(id),
  recipient_phone VARCHAR(20) NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  template_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for WhatsApp templates
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their WhatsApp templates" ON whatsapp_templates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM whatsapp_subscriptions ws 
    JOIN user_service_subscriptions uss ON ws.subscription_id = uss.id 
    WHERE ws.id = whatsapp_templates.subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their WhatsApp templates" ON whatsapp_templates FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM whatsapp_subscriptions ws 
    JOIN user_service_subscriptions uss ON ws.subscription_id = uss.id 
    WHERE ws.id = whatsapp_templates.subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their WhatsApp templates" ON whatsapp_templates FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM whatsapp_subscriptions ws 
    JOIN user_service_subscriptions uss ON ws.subscription_id = uss.id 
    WHERE ws.id = whatsapp_templates.subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their WhatsApp templates" ON whatsapp_templates FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM whatsapp_subscriptions ws 
    JOIN user_service_subscriptions uss ON ws.subscription_id = uss.id 
    WHERE ws.id = whatsapp_templates.subscription_id AND uss.user_id = auth.uid()
  )
);

-- Add RLS policies for WhatsApp messages
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their WhatsApp messages" ON whatsapp_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM whatsapp_subscriptions ws 
    JOIN user_service_subscriptions uss ON ws.subscription_id = uss.id 
    WHERE ws.id = whatsapp_messages.subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their WhatsApp messages" ON whatsapp_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM whatsapp_subscriptions ws 
    JOIN user_service_subscriptions uss ON ws.subscription_id = uss.id 
    WHERE ws.id = whatsapp_messages.subscription_id AND uss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their WhatsApp messages" ON whatsapp_messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM whatsapp_subscriptions ws 
    JOIN user_service_subscriptions uss ON ws.subscription_id = uss.id 
    WHERE ws.id = whatsapp_messages.subscription_id AND uss.user_id = auth.uid()
  )
);
