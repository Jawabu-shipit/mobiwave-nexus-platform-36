-- Fix API credentials table constraint for proper ON CONFLICT handling
-- Drop existing constraint if it exists and recreate with explicit name
ALTER TABLE public.api_credentials 
DROP CONSTRAINT IF EXISTS api_credentials_user_id_service_name_key;

-- Add named unique constraint
ALTER TABLE public.api_credentials 
ADD CONSTRAINT api_credentials_user_id_service_name_key 
UNIQUE (user_id, service_name);

-- Ensure the api_key_encrypted column exists
ALTER TABLE public.api_credentials 
ADD COLUMN IF NOT EXISTS api_key_encrypted TEXT;

-- Create index for the encrypted column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_api_credentials_api_key_encrypted 
ON public.api_credentials(api_key_encrypted);

-- Update the trigger function to handle updated_at
CREATE OR REPLACE FUNCTION public.update_api_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS update_api_credentials_updated_at ON public.api_credentials;
CREATE TRIGGER update_api_credentials_updated_at
    BEFORE UPDATE ON public.api_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_api_credentials_updated_at();