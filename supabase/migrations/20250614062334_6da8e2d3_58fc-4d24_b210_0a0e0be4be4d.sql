
-- Create table for Mspace reseller clients
CREATE TABLE public.mspace_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mspace_client_id VARCHAR UNIQUE NOT NULL,
  client_name VARCHAR NOT NULL,
  username VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  balance DECIMAL(10,2) DEFAULT 0,
  status VARCHAR DEFAULT 'active',
  created_date TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  user_type VARCHAR DEFAULT 'mspace_client',
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for user type mappings
CREATE TABLE public.user_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_type VARCHAR NOT NULL CHECK (user_type IN ('real', 'demo', 'mspace_client')),
  source VARCHAR NOT NULL CHECK (source IN ('database', 'mspace_api')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for mspace_users
ALTER TABLE public.mspace_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage mspace users" 
ON public.mspace_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- Add RLS policies for user_types
ALTER TABLE public.user_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage user types" 
ON public.user_types 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- Update profiles table to add user_type column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        ALTER TABLE public.profiles ADD COLUMN user_type VARCHAR DEFAULT 'demo';
    END IF;
END $$;

-- Update existing admin and super_admin users to be 'real' type
UPDATE public.profiles 
SET user_type = 'real' 
WHERE role IN ('super_admin', 'admin');
