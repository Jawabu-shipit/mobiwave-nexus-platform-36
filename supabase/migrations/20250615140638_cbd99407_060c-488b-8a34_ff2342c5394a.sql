
-- Add indexes for better performance on user-service queries
CREATE INDEX IF NOT EXISTS idx_user_service_subscriptions_user_id ON user_service_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_subscriptions_service_id ON user_service_subscriptions(service_id);
CREATE INDEX IF NOT EXISTS idx_user_service_subscriptions_status ON user_service_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_service_subscriptions_user_service ON user_service_subscriptions(user_id, service_id);

CREATE INDEX IF NOT EXISTS idx_user_service_activations_user_id ON user_service_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_service_activations_service_id ON user_service_activations(service_id);
CREATE INDEX IF NOT EXISTS idx_user_service_activations_active ON user_service_activations(is_active);

-- Enable real-time for user service tables
ALTER TABLE user_service_subscriptions REPLICA IDENTITY FULL;
ALTER TABLE user_service_activations REPLICA IDENTITY FULL;
ALTER TABLE services_catalog REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_service_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_service_activations;
ALTER PUBLICATION supabase_realtime ADD TABLE services_catalog;

-- Create a view for efficient user-service queries combining both tables
CREATE OR REPLACE VIEW user_services_overview AS
SELECT 
  p.id as user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.user_type,
  sc.id as service_id,
  sc.service_name,
  sc.service_type,
  sc.description,
  sc.setup_fee,
  sc.monthly_fee,
  sc.is_premium,
  sc.is_active as service_available,
  COALESCE(usa.is_active, false) as is_activated,
  usa.activated_at,
  usa.activated_by,
  uss.status as subscription_status,
  uss.configuration,
  uss.setup_fee_paid,
  uss.monthly_billing_active,
  uss.activated_at as subscription_activated_at,
  CASE 
    WHEN usa.is_active = true THEN 'active'
    WHEN uss.status = 'active' THEN 'subscribed'
    WHEN uss.status IS NOT NULL THEN uss.status
    ELSE 'available'
  END as overall_status
FROM profiles p
CROSS JOIN services_catalog sc
LEFT JOIN user_service_activations usa ON p.id = usa.user_id AND sc.id = usa.service_id
LEFT JOIN user_service_subscriptions uss ON p.id = uss.user_id AND sc.id = uss.service_id
WHERE sc.is_active = true
ORDER BY p.email, sc.service_name;

-- Add RLS policies for the view
ALTER VIEW user_services_overview SET (security_invoker = true);

-- Create function to get user services with eligibility
CREATE OR REPLACE FUNCTION get_user_services(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  user_type TEXT,
  service_id UUID,
  service_name TEXT,
  service_type TEXT,
  description TEXT,
  setup_fee NUMERIC,
  monthly_fee NUMERIC,
  is_premium BOOLEAN,
  service_available BOOLEAN,
  is_activated BOOLEAN,
  activated_at TIMESTAMPTZ,
  subscription_status TEXT,
  overall_status TEXT,
  is_eligible BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uso.user_id,
    uso.email,
    uso.first_name,
    uso.last_name,
    uso.role,
    uso.user_type,
    uso.service_id,
    uso.service_name,
    uso.service_type,
    uso.description,
    uso.setup_fee,
    uso.monthly_fee,
    uso.is_premium,
    uso.service_available,
    uso.is_activated,
    uso.activated_at,
    uso.subscription_status,
    uso.overall_status,
    -- Basic eligibility rules (can be enhanced)
    CASE 
      WHEN uso.is_premium = true AND uso.user_type = 'demo' THEN false
      WHEN uso.service_available = false THEN false
      ELSE true
    END as is_eligible
  FROM user_services_overview uso
  WHERE (target_user_id IS NULL OR uso.user_id = target_user_id);
END;
$$;

-- Create trigger function for real-time notifications
CREATE OR REPLACE FUNCTION notify_service_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify on user service activation changes
  IF TG_TABLE_NAME = 'user_service_activations' THEN
    PERFORM pg_notify(
      'service_status_change',
      json_build_object(
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'service_id', COALESCE(NEW.service_id, OLD.service_id),
        'is_active', COALESCE(NEW.is_active, false),
        'operation', TG_OP,
        'timestamp', now()
      )::text
    );
  END IF;
  
  -- Notify on subscription changes
  IF TG_TABLE_NAME = 'user_service_subscriptions' THEN
    PERFORM pg_notify(
      'service_status_change',
      json_build_object(
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'service_id', COALESCE(NEW.service_id, OLD.service_id),
        'status', COALESCE(NEW.status, 'deleted'),
        'operation', TG_OP,
        'timestamp', now()
      )::text
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for real-time notifications
DROP TRIGGER IF EXISTS user_service_activations_notify ON user_service_activations;
CREATE TRIGGER user_service_activations_notify
  AFTER INSERT OR UPDATE OR DELETE ON user_service_activations
  FOR EACH ROW EXECUTE FUNCTION notify_service_status_change();

DROP TRIGGER IF EXISTS user_service_subscriptions_notify ON user_service_subscriptions;
CREATE TRIGGER user_service_subscriptions_notify
  AFTER INSERT OR UPDATE OR DELETE ON user_service_subscriptions
  FOR EACH ROW EXECUTE FUNCTION notify_service_status_change();

-- Create function for bulk service operations
CREATE OR REPLACE FUNCTION bulk_service_operation(
  user_ids UUID[],
  service_id UUID,
  operation TEXT, -- 'activate', 'deactivate', 'subscribe', 'unsubscribe'
  performed_by UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  user_id UUID,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  operation_result RECORD;
BEGIN
  -- Validate operation
  IF operation NOT IN ('activate', 'deactivate', 'subscribe', 'unsubscribe') THEN
    RAISE EXCEPTION 'Invalid operation: %', operation;
  END IF;
  
  -- Process each user
  FOREACH target_user_id IN ARRAY user_ids
  LOOP
    BEGIN
      IF operation = 'activate' THEN
        INSERT INTO user_service_activations (user_id, service_id, activated_by)
        VALUES (target_user_id, service_id, performed_by)
        ON CONFLICT (user_id, service_id) 
        DO UPDATE SET 
          is_active = true,
          activated_at = now(),
          activated_by = performed_by,
          updated_at = now();
        
        user_id := target_user_id;
        success := true;
        message := 'Service activated successfully';
        
      ELSIF operation = 'deactivate' THEN
        UPDATE user_service_activations 
        SET is_active = false, 
            deactivated_at = now(),
            updated_at = now()
        WHERE user_service_activations.user_id = target_user_id 
        AND user_service_activations.service_id = bulk_service_operation.service_id;
        
        user_id := target_user_id;
        success := true;
        message := 'Service deactivated successfully';
        
      END IF;
      
      RETURN NEXT;
      
    EXCEPTION WHEN OTHERS THEN
      user_id := target_user_id;
      success := false;
      message := SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$;
