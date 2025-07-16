-- Redo API Credentials Table and Schema
DROP TABLE IF EXISTS public.api_credentials CASCADE;

CREATE TABLE public.api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    api_key_encrypted TEXT,
    additional_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service_name)
);

-- Enable RLS
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own API credentials"
    ON public.api_credentials FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API credentials"
    ON public.api_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API credentials"
    ON public.api_credentials FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API credentials"
    ON public.api_credentials FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_credentials_user_id ON public.api_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_api_credentials_service_name ON public.api_credentials(service_name);
CREATE INDEX IF NOT EXISTS idx_api_credentials_is_active ON public.api_credentials(is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_api_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_api_credentials_updated_at ON public.api_credentials;
CREATE TRIGGER update_api_credentials_updated_at
    BEFORE UPDATE ON public.api_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_api_credentials_updated_at();
