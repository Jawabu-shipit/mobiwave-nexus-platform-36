-- Add the missing api_key_encrypted column to api_credentials table
ALTER TABLE public.api_credentials 
ADD COLUMN IF NOT EXISTS api_key_encrypted TEXT;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_api_credentials_api_key_encrypted 
ON public.api_credentials(api_key_encrypted);