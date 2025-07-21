-- Fix API credentials table by adding username column if it doesn't exist
DO $$ 
BEGIN
    -- Check if username column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'api_credentials' 
        AND column_name = 'username'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.api_credentials ADD COLUMN username TEXT;
        COMMENT ON COLUMN public.api_credentials.username IS 'Username for the API service';
    END IF;
END $$;