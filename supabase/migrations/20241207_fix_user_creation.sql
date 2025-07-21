
-- Ensure user_role type exists before using it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'manager', 'admin', 'super_admin');
  END IF;
END$$;


-- Fix the handle_new_user function to properly handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id UUID;
  user_role_value user_role;
BEGIN
  -- Safely determine the user role, defaulting to 'user' if invalid
  BEGIN
    user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_value := 'user'::user_role;
  END;

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    user_role_value
  );
  
  -- Get default role ID
  SELECT id INTO default_role_id FROM roles WHERE name = 'user' LIMIT 1;
  
  -- Assign default role if it exists
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, default_role_id);
  END IF;
  
  -- Initialize user credits
  INSERT INTO public.user_credits (user_id, credits_remaining, credits_purchased)
  VALUES (NEW.id, 10.00, 10.00);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error and still allow user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

