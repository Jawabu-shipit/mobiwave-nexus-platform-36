
-- Create service activation requests table
CREATE TABLE public.service_activation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  approved_by UUID NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);

-- Add RLS policies for service activation requests
ALTER TABLE public.service_activation_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own service requests" 
  ON public.service_activation_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create service requests" 
  ON public.service_activation_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all service requests" 
  ON public.service_activation_requests 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create user service activations table to track what services each user has access to
CREATE TABLE public.user_service_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_by UUID NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);

-- Add RLS policies for user service activations
ALTER TABLE public.user_service_activations ENABLE ROW LEVEL SECURITY;

-- Users can view their own activations
CREATE POLICY "Users can view their own service activations" 
  ON public.user_service_activations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can manage all activations
CREATE POLICY "Admins can manage all service activations" 
  ON public.user_service_activations 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to auto-activate bulk SMS for new users
CREATE OR REPLACE FUNCTION public.activate_default_services_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bulk_sms_service_id UUID;
BEGIN
  -- Get the bulk SMS service ID (assuming service_type = 'sms')
  SELECT id INTO bulk_sms_service_id 
  FROM public.services_catalog 
  WHERE service_type = 'sms' 
  AND is_active = true 
  LIMIT 1;
  
  -- If bulk SMS service exists, activate it for the new user
  IF bulk_sms_service_id IS NOT NULL THEN
    INSERT INTO public.user_service_activations (user_id, service_id, activated_by)
    VALUES (NEW.id, bulk_sms_service_id, NEW.id)
    ON CONFLICT (user_id, service_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-activate default services when a user profile is created
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.activate_default_services_for_user();

-- Function to handle service activation requests approval
CREATE OR REPLACE FUNCTION public.approve_service_request(
  request_id UUID,
  admin_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_record 
  FROM public.service_activation_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update the request status
  UPDATE public.service_activation_requests 
  SET status = 'approved', 
      approved_at = now(), 
      approved_by = admin_user_id,
      updated_at = now()
  WHERE id = request_id;
  
  -- Activate the service for the user
  INSERT INTO public.user_service_activations (user_id, service_id, activated_by)
  VALUES (request_record.user_id, request_record.service_id, admin_user_id)
  ON CONFLICT (user_id, service_id) 
  DO UPDATE SET 
    is_active = true, 
    activated_at = now(), 
    activated_by = admin_user_id,
    deactivated_at = NULL,
    updated_at = now();
  
  RETURN TRUE;
END;
$$;

-- Function to reject service activation requests
CREATE OR REPLACE FUNCTION public.reject_service_request(
  request_id UUID,
  rejection_reason TEXT DEFAULT NULL,
  admin_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.service_activation_requests 
  SET status = 'rejected', 
      rejection_reason = reject_service_request.rejection_reason,
      approved_by = admin_user_id,
      updated_at = now()
  WHERE id = request_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$;
