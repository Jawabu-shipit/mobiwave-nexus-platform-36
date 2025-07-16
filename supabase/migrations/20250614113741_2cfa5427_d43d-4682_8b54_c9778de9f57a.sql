
-- First, let's ensure we have a robust trigger function that handles all scenarios
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

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to sync existing users without profiles
CREATE OR REPLACE FUNCTION public.sync_existing_users()
RETURNS TABLE(synced_count INTEGER, error_count INTEGER) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  synced_users INTEGER := 0;
  error_users INTEGER := 0;
BEGIN
  -- Loop through auth.users that don't have profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      -- Create missing profile
      INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at)
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
        COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
        COALESCE((user_record.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
        user_record.created_at
      );
      
      -- Initialize credits if they don't exist
      INSERT INTO public.user_credits (user_id, credits_remaining, credits_purchased)
      VALUES (user_record.id, 10.00, 10.00)
      ON CONFLICT (user_id) DO NOTHING;
      
      synced_users := synced_users + 1;
      RAISE NOTICE 'Synced user: % (%)', user_record.email, user_record.id;
      
    EXCEPTION WHEN OTHERS THEN
      error_users := error_users + 1;
      RAISE WARNING 'Failed to sync user % (%): %', user_record.email, user_record.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT synced_users, error_users;
END;
$$;

-- Run the sync function to fix existing users
SELECT * FROM public.sync_existing_users();
