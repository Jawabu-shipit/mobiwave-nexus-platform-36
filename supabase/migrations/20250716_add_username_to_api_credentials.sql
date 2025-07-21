-- Add username column to api_credentials table
ALTER TABLE public.api_credentials ADD COLUMN username TEXT NOT NULL DEFAULT '';

-- Optionally, update existing rows if needed (set to empty string or migrate from another source)
UPDATE public.api_credentials SET username = '' WHERE username IS NULL;
