
-- Fix the user creation trigger to ensure profiles are created properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value text := 'user';
BEGIN
  -- Log the start for debugging
  RAISE NOTICE 'Creating profile for user: %', NEW.id;
  
  -- Safely determine the user role
  BEGIN
    IF NEW.raw_user_meta_data ? 'role' THEN
      user_role_value := NEW.raw_user_meta_data->>'role';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_role_value := 'user';
    RAISE NOTICE 'Role parsing failed, using default: %', user_role_value;
  END;

  -- Insert into profiles - this is the critical part that was failing
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    user_role_value
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();
  
  RAISE NOTICE 'Profile created/updated successfully for user: % with role: %', NEW.id, user_role_value;
  
  -- Initialize credits if they don't exist
  INSERT INTO public.user_credits (user_id, credits_remaining, credits_purchased)
  VALUES (NEW.id, 10.00, 10.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  RAISE NOTICE 'Credits initialized for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix existing users without profiles
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  COALESCE((au.raw_user_meta_data->>'role'), 'user') as role,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Initialize credits for users without them
INSERT INTO public.user_credits (user_id, credits_remaining, credits_purchased)
SELECT 
  au.id,
  10.00,
  10.00
FROM auth.users au
LEFT JOIN public.user_credits uc ON au.id = uc.user_id
WHERE uc.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_campaigns_status ON scheduled_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON workflows(trigger_type);
