
-- Create missing USSD tables
CREATE TABLE IF NOT EXISTS public.mspace_ussd_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES user_service_subscriptions(id) ON DELETE CASCADE,
    service_code VARCHAR(20) NOT NULL UNIQUE,
    menu_structure JSONB DEFAULT '[]',
    callback_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ussd_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    application_id UUID REFERENCES mspace_ussd_applications(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    current_node_id VARCHAR(100),
    input_path TEXT[] DEFAULT '{}',
    navigation_path TEXT[] DEFAULT '{}',
    session_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.mspace_ussd_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their USSD applications" ON public.mspace_ussd_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_service_subscriptions uss 
            WHERE uss.id = subscription_id 
            AND uss.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their USSD sessions" ON public.ussd_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM mspace_ussd_applications app
            JOIN user_service_subscriptions uss ON uss.id = app.subscription_id
            WHERE app.id = application_id 
            AND uss.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_application_id ON ussd_sessions(application_id);
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_phone_number ON ussd_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_created_at ON ussd_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_mspace_ussd_applications_subscription_id ON mspace_ussd_applications(subscription_id);
