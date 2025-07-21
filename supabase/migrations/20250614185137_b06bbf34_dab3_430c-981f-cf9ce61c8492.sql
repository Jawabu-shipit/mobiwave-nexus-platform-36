
-- Create the ussd_sessions table for tracking USSD session data
CREATE TABLE public.ussd_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR NOT NULL,
  application_id UUID REFERENCES public.mspace_ussd_applications(id),
  phone_number VARCHAR NOT NULL,
  current_node_id VARCHAR NOT NULL,
  input_path TEXT[] DEFAULT '{}',
  navigation_path TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for ussd_sessions
ALTER TABLE public.ussd_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view sessions for their applications
CREATE POLICY "Users can view their USSD sessions" 
  ON public.ussd_sessions 
  FOR SELECT 
  USING (
    application_id IN (
      SELECT id FROM public.mspace_ussd_applications 
      WHERE subscription_id IN (
        SELECT id FROM public.user_service_subscriptions 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy to allow inserting sessions (for webhook)
CREATE POLICY "Allow inserting USSD sessions" 
  ON public.ussd_sessions 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow updating sessions (for webhook)
CREATE POLICY "Allow updating USSD sessions" 
  ON public.ussd_sessions 
  FOR UPDATE 
  USING (true);

-- Add index for better performance
CREATE INDEX idx_ussd_sessions_application_id ON public.ussd_sessions(application_id);
CREATE INDEX idx_ussd_sessions_phone_number ON public.ussd_sessions(phone_number);
CREATE INDEX idx_ussd_sessions_created_at ON public.ussd_sessions(created_at);
