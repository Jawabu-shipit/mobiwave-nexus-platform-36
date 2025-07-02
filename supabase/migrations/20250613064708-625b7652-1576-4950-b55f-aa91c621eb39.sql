
-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Enable read access for authenticated users to own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Fix user_credits table RLS if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_credits' AND table_schema = 'public') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
        DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;
        
        -- Create proper policies
        CREATE POLICY "Enable read access for users to own credits" 
        ON public.user_credits FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Enable insert for system during user creation" 
        ON public.user_credits FOR INSERT 
        WITH CHECK (true);
        
        CREATE POLICY "Enable update for users to own credits" 
        ON public.user_credits FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value user_role := 'user'::user_role;
BEGIN
  -- Log the start for debugging
  RAISE NOTICE 'Creating profile for user: %', NEW.id;
  
  -- Safely determine the user role
  BEGIN
    IF NEW.raw_user_meta_data ? 'role' THEN
      user_role_value := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_role_value := 'user'::user_role;
    RAISE NOTICE 'Role parsing failed, using default: %', user_role_value;
  END;

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    user_role_value
  );
  
  RAISE NOTICE 'Profile created successfully for user: % with role: %', NEW.id, user_role_value;
  
  -- Try to initialize credits if table exists
  BEGIN
    INSERT INTO public.user_credits (user_id, credits_remaining, credits_purchased)
    VALUES (NEW.id, 10.00, 10.00);
    RAISE NOTICE 'Credits initialized for user: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not initialize credits: %', SQLERRM;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
