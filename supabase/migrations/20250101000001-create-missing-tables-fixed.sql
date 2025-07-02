-- Create missing tables for real data integration

-- Message history table for tracking all sent messages
CREATE TABLE IF NOT EXISTS message_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  message_type VARCHAR(50) NOT NULL, -- 'sms', 'email', 'whatsapp'
  recipient VARCHAR(255) NOT NULL,
  message_content TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  cost DECIMAL(10,4) DEFAULT 0,
  provider VARCHAR(100),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USSD sessions table
CREATE TABLE IF NOT EXISTS ussd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  ussd_code VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'timeout', 'cancelled'
  steps_completed INTEGER DEFAULT 0,
  session_data JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table (if not exists)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id VARCHAR(255),
  payment_method VARCHAR(100), -- 'mpesa', 'card', 'bank_transfer'
  payment_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credits table (if not exists)
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits_remaining DECIMAL(10,2) DEFAULT 0,
  credits_purchased DECIMAL(10,2) DEFAULT 0,
  credits_used DECIMAL(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table (if not exists)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL, -- 'sms', 'email', 'whatsapp', 'mixed'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
  message_content TEXT,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API logs table for tracking API usage
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER, -- in milliseconds
  request_size INTEGER,
  response_size INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  limit_count INTEGER NOT NULL DEFAULT 100,
  window_seconds INTEGER NOT NULL DEFAULT 3600,
  current_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign analytics table
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  messages_pending INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_history_user_id ON message_history(user_id);
CREATE INDEX IF NOT EXISTS idx_message_history_created_at ON message_history(created_at);
CREATE INDEX IF NOT EXISTS idx_message_history_status ON message_history(status);
CREATE INDEX IF NOT EXISTS idx_message_history_type ON message_history(message_type);

CREATE INDEX IF NOT EXISTS idx_ussd_sessions_user_id ON ussd_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_created_at ON ussd_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_status ON ussd_sessions(status);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, method);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_created ON system_metrics(metric_name, created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_date ON campaign_analytics(campaign_id, date);

-- Enable RLS on all tables
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ussd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Message history policies
CREATE POLICY "Users can view their own message history" ON message_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message history" ON message_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message history" ON message_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- USSD sessions policies
CREATE POLICY "Users can view their own USSD sessions" ON ussd_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own USSD sessions" ON ussd_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own USSD sessions" ON ussd_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit transactions" ON credit_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User credits policies
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON user_credits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON user_credits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" ON campaigns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- API logs policies
CREATE POLICY "Users can view their own API logs" ON api_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API logs" ON api_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Rate limits policies
CREATE POLICY "Users can view their own rate limits" ON rate_limits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rate limits" ON rate_limits
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- System metrics policies (admin only)
CREATE POLICY "Admin can view system metrics" ON system_metrics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Campaign analytics policies
CREATE POLICY "Users can view their own campaign analytics" ON campaign_analytics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_analytics.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Admin policies for all tables
CREATE POLICY "Admins can view all message history" ON message_history
  FOR ALL TO authenticated USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view all USSD sessions" ON ussd_sessions
  FOR ALL TO authenticated USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view all credit transactions" ON credit_transactions
  FOR ALL TO authenticated USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view all user credits" ON user_credits
  FOR ALL TO authenticated USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view all campaigns" ON campaigns
  FOR ALL TO authenticated USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_message_history_updated_at BEFORE UPDATE ON message_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ussd_sessions_updated_at BEFORE UPDATE ON ussd_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_transactions_updated_at BEFORE UPDATE ON credit_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demonstration (optional - remove in production)
-- This will be removed in production
INSERT INTO message_history (user_id, message_type, recipient, message_content, status, cost, created_at) 
SELECT 
  p.id,
  (ARRAY['sms', 'email', 'whatsapp'])[floor(random() * 3 + 1)],
  '+254' || (700000000 + floor(random() * 99999999))::text,
  'Sample message content for testing',
  (ARRAY['delivered', 'failed', 'pending'])[floor(random() * 3 + 1)],
  random() * 0.1,
  NOW() - (random() * interval '30 days')
FROM profiles p
WHERE p.role = 'client'
LIMIT 100;

-- Insert sample campaigns
INSERT INTO campaigns (user_id, name, description, campaign_type, status, message_content, recipient_count, sent_count, delivered_count, failed_count, created_at)
SELECT 
  p.id,
  'Sample Campaign ' || generate_series,
  'This is a sample campaign for testing purposes',
  (ARRAY['sms', 'email', 'whatsapp'])[floor(random() * 3 + 1)],
  (ARRAY['draft', 'sent', 'completed'])[floor(random() * 3 + 1)],
  'Sample campaign message content',
  floor(random() * 1000 + 100)::integer,
  floor(random() * 800 + 50)::integer,
  floor(random() * 750 + 40)::integer,
  floor(random() * 50 + 5)::integer,
  NOW() - (random() * interval '60 days')
FROM profiles p
CROSS JOIN generate_series(1, 5)
WHERE p.role = 'client'
LIMIT 50;

-- Insert sample credit transactions
INSERT INTO credit_transactions (user_id, transaction_type, amount, description, payment_method, status, created_at)
SELECT 
  p.id,
  (ARRAY['purchase', 'usage', 'refund'])[floor(random() * 3 + 1)],
  (random() * 100 + 10)::decimal(10,2),
  'Sample transaction for testing',
  (ARRAY['mpesa', 'card', 'bank_transfer'])[floor(random() * 3 + 1)],
  (ARRAY['completed', 'pending', 'failed'])[floor(random() * 3 + 1)],
  NOW() - (random() * interval '90 days')
FROM profiles p
WHERE p.role = 'client'
LIMIT 200;

-- Insert sample user credits
INSERT INTO user_credits (user_id, credits_remaining, credits_purchased, credits_used, last_purchase_date, created_at)
SELECT 
  p.id,
  (random() * 500 + 50)::decimal(10,2),
  (random() * 1000 + 100)::decimal(10,2),
  (random() * 300 + 20)::decimal(10,2),
  NOW() - (random() * interval '30 days'),
  NOW() - (random() * interval '180 days')
FROM profiles p
WHERE p.role = 'client'
ON CONFLICT (user_id) DO NOTHING;