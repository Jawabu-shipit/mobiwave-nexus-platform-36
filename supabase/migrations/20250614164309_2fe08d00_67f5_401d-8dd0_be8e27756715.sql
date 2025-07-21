
-- Add WhatsApp Bulk Messaging Service to the catalog
INSERT INTO services_catalog (service_name, service_type, description, setup_fee, monthly_fee, transaction_fee_type, transaction_fee_amount, is_premium) VALUES
('WhatsApp Business API', 'whatsapp', 'WhatsApp Business API for bulk messaging', 20000, 12000, 'flat', 2, false),
('WhatsApp Cloud API', 'whatsapp', 'Meta WhatsApp Cloud API integration', 15000, 8000, 'flat', 1.5, false),
('WhatsApp Premium', 'whatsapp', 'Premium WhatsApp with rich media support', 35000, 25000, 'percentage', 3, true);

-- Create WhatsApp Subscriptions table
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
