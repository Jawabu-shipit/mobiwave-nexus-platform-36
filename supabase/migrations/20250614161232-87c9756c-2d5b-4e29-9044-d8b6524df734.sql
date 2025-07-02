
-- Real Services Management Tables
CREATE TABLE IF NOT EXISTS services_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL UNIQUE,
  service_type VARCHAR(50) NOT NULL, -- 'ussd', 'shortcode', 'mpesa', 'survey', 'servicedesk'
  description TEXT,
  setup_fee DECIMAL(10,2) DEFAULT 0,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  transaction_fee_type VARCHAR(20) DEFAULT 'none', -- 'percentage', 'flat', 'none'
  transaction_fee_amount DECIMAL(10,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  provider VARCHAR(50) DEFAULT 'mspace',
  configuration_schema JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Service Subscriptions
CREATE TABLE IF NOT EXISTS user_service_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  service_id UUID REFERENCES services_catalog(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'cancelled'
  configuration JSONB DEFAULT '{}',
  setup_fee_paid BOOLEAN DEFAULT false,
  monthly_billing_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MSpace USSD Applications
CREATE TABLE IF NOT EXISTS mspace_ussd_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_service_subscriptions(id),
  service_code VARCHAR(10) UNIQUE NOT NULL,
  callback_url TEXT NOT NULL,
  menu_structure JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  mspace_application_id VARCHAR(100),
  monthly_fee DECIMAL(10,2) DEFAULT 8000,
  setup_fee DECIMAL(10,2) DEFAULT 15000,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MSpace Pesa Integrations  
CREATE TABLE IF NOT EXISTS mspace_pesa_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_service_subscriptions(id),
  paybill_number VARCHAR(20) NOT NULL,
  till_number VARCHAR(20),
  callback_url TEXT NOT NULL,
  callback_response_type VARCHAR(10) DEFAULT 'json', -- 'json' or 'http'
  status VARCHAR(20) DEFAULT 'pending',
  current_balance DECIMAL(15,2) DEFAULT 0,
  last_balance_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Short Code Management
CREATE TABLE IF NOT EXISTS short_code_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_service_subscriptions(id),
  code VARCHAR(10) NOT NULL,
  network VARCHAR(20) NOT NULL, -- 'safaricom', 'airtel', 'telkom', 'all'
  type VARCHAR(20) DEFAULT 'shared', -- 'shared', 'dedicated'
  monthly_fee DECIMAL(10,2),
  setup_fee DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SMS Survey Services
CREATE TABLE IF NOT EXISTS sms_survey_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_service_subscriptions(id),
  response_limit INTEGER DEFAULT 2000,
  current_responses INTEGER DEFAULT 0,
  setup_fee DECIMAL(10,2) DEFAULT 25000,
  monthly_fee DECIMAL(10,2) DEFAULT 8000,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service Desk Subscriptions
CREATE TABLE IF NOT EXISTS service_desk_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_service_subscriptions(id),
  max_users INTEGER DEFAULT 1,
  monthly_fee_per_user DECIMAL(10,2) DEFAULT 6000,
  current_users INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Real Services Catalog
INSERT INTO services_catalog (service_name, service_type, description, setup_fee, monthly_fee, transaction_fee_type, transaction_fee_amount, is_premium) VALUES
('USSD Test-Bed', 'ussd', 'USSD application testing environment', 15000, 8000, 'none', 0, false),
('USSD Shared', 'ussd', 'Shared USSD service code', 25000, 15000, 'none', 0, false),
('USSD Dedicated', 'ussd', 'Dedicated USSD service code', 110000, 40000, 'none', 0, true),
('Short Code Shared', 'shortcode', 'Shared short code across networks', 2500, 15000, 'none', 0, false),
('Short Code Dedicated', 'shortcode', 'Dedicated short code per network', 15000, 15000, 'none', 0, true),
('M-Pesa Integration', 'mpesa', 'M-Pesa payment integration service', 0, 0, 'percentage', 5, false),
('M-Pesa Flat Fee', 'mpesa', 'M-Pesa with flat transaction fee', 0, 0, 'flat', 50, false),
('SMS Survey Service', 'survey', 'SMS survey platform with 2000 responses', 25000, 8000, 'none', 0, false),
('Service Desk', 'servicedesk', 'Help desk ticketing system', 0, 6000, 'none', 0, false),
('Airtime Rewards', 'rewards', 'Automated airtime distribution', 0, 0, 'percentage', 2, false),
('Data Rewards', 'rewards', 'Automated data bundle distribution', 0, 0, 'percentage', 2, false);

-- Add RLS Policies
ALTER TABLE services_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_service_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mspace_ussd_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mspace_pesa_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_code_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_survey_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_desk_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services_catalog (public read)
CREATE POLICY "Anyone can view services catalog" ON services_catalog FOR SELECT USING (true);

-- RLS Policies for user_service_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_service_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subscriptions" ON user_service_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON user_service_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for service-specific tables
CREATE POLICY "Users can view their USSD applications" ON mspace_ussd_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = mspace_ussd_applications.subscription_id AND uss.user_id = auth.uid())
);

CREATE POLICY "Users can view their Pesa integrations" ON mspace_pesa_integrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = mspace_pesa_integrations.subscription_id AND uss.user_id = auth.uid())
);

CREATE POLICY "Users can view their short codes" ON short_code_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = short_code_subscriptions.subscription_id AND uss.user_id = auth.uid())
);

CREATE POLICY "Users can view their survey subscriptions" ON sms_survey_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = sms_survey_subscriptions.subscription_id AND uss.user_id = auth.uid())
);

CREATE POLICY "Users can view their service desk subscriptions" ON service_desk_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_service_subscriptions uss WHERE uss.id = service_desk_subscriptions.subscription_id AND uss.user_id = auth.uid())
);
