-- Minimal tables for real data integration (no dependencies)

-- Message history table for tracking all sent messages
CREATE TABLE IF NOT EXISTS message_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID,
  message_type VARCHAR(50) NOT NULL DEFAULT 'sms',
  recipient VARCHAR(255) NOT NULL,
  message_content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  cost DECIMAL(10,4) DEFAULT 0,
  provider VARCHAR(100),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL DEFAULT 'sms',
  status VARCHAR(50) DEFAULT 'draft',
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

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'usage',
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id VARCHAR(255),
  payment_method VARCHAR(100),
  payment_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_remaining DECIMAL(10,2) DEFAULT 0,
  credits_purchased DECIMAL(10,2) DEFAULT 0,
  credits_used DECIMAL(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER,
  request_size INTEGER,
  response_size INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Add basic indexes
CREATE INDEX IF NOT EXISTS idx_message_history_user_id ON message_history(user_id);
CREATE INDEX IF NOT EXISTS idx_message_history_created_at ON message_history(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- Insert some sample data for immediate testing
INSERT INTO campaigns (user_id, name, description, campaign_type, status, recipient_count, sent_count, delivered_count, failed_count, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Welcome Campaign', 'Welcome new users', 'sms', 'completed', 1500, 1450, 1380, 70, NOW() - interval '7 days'),
('00000000-0000-0000-0000-000000000001', 'Promotional Offer', 'Special discount campaign', 'sms', 'completed', 2300, 2250, 2100, 150, NOW() - interval '14 days'),
('00000000-0000-0000-0000-000000000001', 'Payment Reminder', 'Payment due reminders', 'sms', 'completed', 800, 780, 750, 30, NOW() - interval '3 days'),
('00000000-0000-0000-0000-000000000002', 'Product Launch', 'New product announcement', 'sms', 'sent', 1200, 1150, 1100, 50, NOW() - interval '1 day'),
('00000000-0000-0000-0000-000000000002', 'Survey Request', 'Customer feedback survey', 'sms', 'draft', 500, 0, 0, 0, NOW());

INSERT INTO message_history (user_id, campaign_id, message_type, recipient, message_content, status, cost, created_at) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM campaigns LIMIT 1), 'sms', '+254700123456', 'Welcome to our service!', 'delivered', 0.05, NOW() - interval '7 days'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM campaigns LIMIT 1), 'sms', '+254700123457', 'Welcome to our service!', 'delivered', 0.05, NOW() - interval '7 days'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM campaigns LIMIT 1), 'sms', '+254700123458', 'Welcome to our service!', 'failed', 0.05, NOW() - interval '7 days'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM campaigns OFFSET 1 LIMIT 1), 'sms', '+254700123459', 'Special offer just for you!', 'delivered', 0.05, NOW() - interval '14 days'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM campaigns OFFSET 1 LIMIT 1), 'sms', '+254700123460', 'Special offer just for you!', 'delivered', 0.05, NOW() - interval '14 days');

INSERT INTO credit_transactions (user_id, transaction_type, amount, description, status, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'purchase', 100.00, 'Credit purchase via M-Pesa', 'completed', NOW() - interval '30 days'),
('00000000-0000-0000-0000-000000000001', 'usage', -25.50, 'SMS campaign charges', 'completed', NOW() - interval '7 days'),
('00000000-0000-0000-0000-000000000001', 'usage', -15.75, 'SMS campaign charges', 'completed', NOW() - interval '14 days'),
('00000000-0000-0000-0000-000000000002', 'purchase', 200.00, 'Credit purchase via Card', 'completed', NOW() - interval '45 days'),
('00000000-0000-0000-0000-000000000002', 'usage', -45.25, 'SMS campaign charges', 'completed', NOW() - interval '1 day');

INSERT INTO user_credits (user_id, credits_remaining, credits_purchased, credits_used, last_purchase_date, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 58.75, 100.00, 41.25, NOW() - interval '30 days', NOW() - interval '60 days'),
('00000000-0000-0000-0000-000000000002', 154.75, 200.00, 45.25, NOW() - interval '45 days', NOW() - interval '90 days')
ON CONFLICT (user_id) DO UPDATE SET
  credits_remaining = EXCLUDED.credits_remaining,
  credits_purchased = EXCLUDED.credits_purchased,
  credits_used = EXCLUDED.credits_used,
  last_purchase_date = EXCLUDED.last_purchase_date;

INSERT INTO api_logs (endpoint, method, status_code, response_time, created_at) VALUES
('/api/sms/send', 'POST', 200, 150, NOW() - interval '1 hour'),
('/api/campaigns', 'GET', 200, 85, NOW() - interval '2 hours'),
('/api/analytics', 'GET', 200, 220, NOW() - interval '3 hours'),
('/api/credits', 'GET', 200, 95, NOW() - interval '4 hours'),
('/api/sms/send', 'POST', 200, 165, NOW() - interval '5 hours');

INSERT INTO system_metrics (metric_name, metric_value, metric_unit, created_at) VALUES
('cpu_usage', 45.5, 'percent', NOW() - interval '5 minutes'),
('memory_usage', 68.2, 'percent', NOW() - interval '5 minutes'),
('response_time', 145.8, 'milliseconds', NOW() - interval '5 minutes'),
('active_connections', 23, 'count', NOW() - interval '5 minutes'),
('requests_per_minute', 156, 'count', NOW() - interval '5 minutes');