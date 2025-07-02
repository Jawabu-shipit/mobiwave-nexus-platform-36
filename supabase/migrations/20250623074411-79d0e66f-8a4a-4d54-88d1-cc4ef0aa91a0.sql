
-- First, let's ensure we have proper foreign key relationships
ALTER TABLE user_service_subscriptions 
ADD CONSTRAINT fk_user_service_subscriptions_service_id 
FOREIGN KEY (service_id) REFERENCES services_catalog(id) ON DELETE CASCADE;

-- Create a plans table for proper subscription management
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
  features JSONB DEFAULT '[]'::jsonb,
  service_limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user plan subscriptions
CREATE TABLE IF NOT EXISTS user_plan_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, service_limits) VALUES
('Free Plan', 'Basic access with limited features', 0, 'monthly', 
 '["SMS Campaigns", "Basic Support"]'::jsonb,
 '{"sms_limit": 100, "contacts_limit": 500}'::jsonb),
('Starter Plan', 'Perfect for small businesses', 19.99, 'monthly',
 '["SMS Campaigns", "Email Campaigns", "Basic WhatsApp", "Service Desk", "Priority Support"]'::jsonb,
 '{"sms_limit": 1000, "email_limit": 2000, "contacts_limit": 5000, "whatsapp_limit": 500}'::jsonb),
('Business Plan', 'Advanced features for growing businesses', 49.99, 'monthly',
 '["All Starter Features", "Advanced WhatsApp", "USSD", "Shortcode", "M-Pesa Integration", "Advanced Analytics", "API Access"]'::jsonb,
 '{"sms_limit": 5000, "email_limit": 10000, "contacts_limit": 25000, "whatsapp_limit": 2500}'::jsonb),
('Enterprise Plan', 'Complete solution for large organizations', 99.99, 'monthly',
 '["All Business Features", "Custom Integrations", "Dedicated Support", "White Label", "Advanced Security"]'::jsonb,
 '{"sms_limit": -1, "email_limit": -1, "contacts_limit": -1, "whatsapp_limit": -1}'::jsonb);

-- Create service access rules based on plans
CREATE TABLE IF NOT EXISTS plan_service_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,
  is_included BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Define which services are included in each plan
INSERT INTO plan_service_access (plan_id, service_type, is_included, requires_approval) VALUES
-- Free Plan - Only SMS campaigns included by default
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 'sms', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 'email', false, true),
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 'whatsapp', false, true),
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 'servicedesk', false, true),
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 'ussd', false, true),
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 'shortcode', false, true),
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 'mpesa', false, true),

-- Starter Plan
((SELECT id FROM subscription_plans WHERE name = 'Starter Plan'), 'sms', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Starter Plan'), 'email', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Starter Plan'), 'whatsapp', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Starter Plan'), 'servicedesk', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Starter Plan'), 'ussd', false, true),
((SELECT id FROM subscription_plans WHERE name = 'Starter Plan'), 'shortcode', false, true),
((SELECT id FROM subscription_plans WHERE name = 'Starter Plan'), 'mpesa', false, true),

-- Business Plan
((SELECT id FROM subscription_plans WHERE name = 'Business Plan'), 'sms', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Business Plan'), 'email', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Business Plan'), 'whatsapp', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Business Plan'), 'servicedesk', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Business Plan'), 'ussd', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Business Plan'), 'shortcode', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Business Plan'), 'mpesa', true, false),

-- Enterprise Plan - All services included
((SELECT id FROM subscription_plans WHERE name = 'Enterprise Plan'), 'sms', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Enterprise Plan'), 'email', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Enterprise Plan'), 'whatsapp', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Enterprise Plan'), 'servicedesk', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Enterprise Plan'), 'ussd', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Enterprise Plan'), 'shortcode', true, false),
((SELECT id FROM subscription_plans WHERE name = 'Enterprise Plan'), 'mpesa', true, false);

-- Assign all existing users to Free Plan by default
INSERT INTO user_plan_subscriptions (user_id, plan_id, status)
SELECT p.id, sp.id, 'active'
FROM profiles p
CROSS JOIN subscription_plans sp
WHERE sp.name = 'Free Plan'
AND NOT EXISTS (
  SELECT 1 FROM user_plan_subscriptions ups 
  WHERE ups.user_id = p.id
);

-- Create a function to check if user has access to a service type
CREATE OR REPLACE FUNCTION public.user_has_service_access(user_uuid UUID, service_type_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN := false;
BEGIN
  -- Check if user has an active plan that includes this service
  SELECT COALESCE(psa.is_included, false) INTO has_access
  FROM user_plan_subscriptions ups
  JOIN subscription_plans sp ON ups.plan_id = sp.id
  JOIN plan_service_access psa ON sp.id = psa.plan_id
  WHERE ups.user_id = user_uuid 
    AND ups.status = 'active'
    AND psa.service_type = service_type_name
    AND sp.is_active = true;
  
  -- If not included in plan, check if they have an active subscription for this specific service
  IF NOT has_access THEN
    SELECT EXISTS(
      SELECT 1 FROM user_service_subscriptions uss
      JOIN services_catalog sc ON uss.service_id = sc.id
      WHERE uss.user_id = user_uuid 
        AND uss.status = 'active'
        AND sc.service_type = service_type_name
    ) INTO has_access;
  END IF;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on new tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_service_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (readable by all authenticated users)
CREATE POLICY "Plans are viewable by authenticated users" ON subscription_plans
  FOR SELECT TO authenticated USING (true);

-- RLS policies for user_plan_subscriptions
CREATE POLICY "Users can view their own plan subscriptions" ON user_plan_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all plan subscriptions" ON user_plan_subscriptions
  FOR ALL TO authenticated USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- RLS policies for plan_service_access (readable by all authenticated users)
CREATE POLICY "Service access rules are viewable by authenticated users" ON plan_service_access
  FOR SELECT TO authenticated USING (true);
