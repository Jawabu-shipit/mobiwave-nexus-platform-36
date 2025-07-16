
-- Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'manager', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the profiles table to use the enum if the column exists but isn't using the enum
DO $$ BEGIN
    -- Check if the role column exists and update it to use the enum
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- Alter the column to use the enum type
        ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::text::user_role;
        -- Set default value
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;
    ELSE
        -- Add the role column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'user'::user_role;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not modify role column: %', SQLERRM;
END $$;

-- Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id UUID;
  user_role_value user_role := 'user'::user_role;
BEGIN
  -- Safely determine the user role, defaulting to 'user' if invalid
  BEGIN
    IF NEW.raw_user_meta_data ? 'role' THEN
      user_role_value := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;
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
  
  -- Get default role ID from roles table
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'user' LIMIT 1;
  
  -- Assign default role if roles table exists and has the user role
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, default_role_id);
  END IF;
  
  -- Initialize user credits if the table exists
  BEGIN
    INSERT INTO public.user_credits (user_id, credits_remaining, credits_purchased)
    VALUES (NEW.id, 10.00, 10.00);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not initialize credits: %', SQLERRM;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
