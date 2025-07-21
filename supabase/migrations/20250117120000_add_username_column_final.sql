-- Add username column to api_credentials table if it doesn't exist
ALTER TABLE public.api_credentials ADD COLUMN IF NOT EXISTS username TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.api_credentials.username IS 'Username for the API service (e.g., MSpace username)';