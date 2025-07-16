
-- First ensure the profiles table exists with correct structure
DO $$ 
BEGIN
  -- Create profiles table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role user_role DEFAULT 'user'::user_role,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id UUID;
  user_role_value user_role := 'user'::user_role;
BEGIN
  -- Log the start of the function for debugging
  RAISE NOTICE 'Starting handle_new_user for user: %', NEW.id;
  
  -- Safely determine the user role, defaulting to 'user' if invalid
  BEGIN
    IF NEW.raw_user_meta_data ? 'role' THEN
      user_role_value := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_role_value := 'user'::user_role;
    RAISE NOTICE 'Role parsing failed, using default: %', user_role_value;
  END;

  -- Insert into profiles - this is the critical part
  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      user_role_value
    );
    RAISE NOTICE 'Profile created successfully for user: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    -- Don't fail the entire user creation, just log the error
  END;
  
  -- Try to get default role ID from roles table (only if it exists)
  BEGIN
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'user' LIMIT 1;
    
    -- Assign default role if roles table exists and has the user role
    IF default_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (NEW.id, default_role_id);
      RAISE NOTICE 'User role assigned for user: %', NEW.id;
    ELSE
      RAISE NOTICE 'No default role found in roles table';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not assign user role: %', SQLERRM;
    -- Don't fail user creation if role assignment fails
  END;
  
  -- Initialize user credits (only if the table exists)
  BEGIN
    INSERT INTO public.user_credits (user_id, credits_remaining, credits_purchased)
    VALUES (NEW.id, 10.00, 10.00);
    RAISE NOTICE 'Credits initialized for user: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not initialize credits: %', SQLERRM;
    -- Don't fail user creation if credits fail
  END;
  
  RAISE NOTICE 'handle_new_user completed successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Make sure the trigger is set up correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
