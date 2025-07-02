
-- Drop existing policies before recreating them to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Admins can view all user credits" ON public.user_credits;

-- Enable RLS on user_credits if not already enabled
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for user_credits
CREATE POLICY "Users can view their own credits" 
  ON public.user_credits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
  ON public.user_credits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user credits" 
  ON public.user_credits 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Enable RLS on campaigns if not already enabled
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Drop and recreate campaign policies
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can manage all campaigns" ON public.campaigns;

CREATE POLICY "Users can view their own campaigns" 
  ON public.campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
  ON public.campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON public.campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON public.campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all campaigns" 
  ON public.campaigns 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Enable RLS on contacts if not already enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate contact policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can manage all contacts" ON public.contacts;

CREATE POLICY "Users can view their own contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
  ON public.contacts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
  ON public.contacts 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all contacts" 
  ON public.contacts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Enable RLS on credit_transactions if not already enabled
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate transaction policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.credit_transactions;

CREATE POLICY "Users can view their own transactions" 
  ON public.credit_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.credit_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
  ON public.credit_transactions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Create audit table for tracking system changes if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR NOT NULL,
  table_name VARCHAR,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop and recreate audit log policies
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.system_audit_logs;

CREATE POLICY "Only admins can view audit logs" 
  ON public.system_audit_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action VARCHAR,
  p_table_name VARCHAR DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.system_audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;
