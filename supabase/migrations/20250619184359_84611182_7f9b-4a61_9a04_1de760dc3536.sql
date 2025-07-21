
-- First, let's update the database to match the expected schema from database-schema-update.sql

-- Add missing columns to profiles table to match what components expect
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'sms' CHECK (type IN ('sms', 'email', 'whatsapp', 'push')),
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content TEXT;

-- Create missing tables that components are trying to access
CREATE TABLE IF NOT EXISTS public.mspace_pesa_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    callback_url TEXT NOT NULL,
    consumer_key VARCHAR(255),
    consumer_secret VARCHAR(255),
    shortcode VARCHAR(20),
    passkey TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit', 'purchase', 'refund')),
    description TEXT,
    reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to system_audit_logs for compatibility
ALTER TABLE public.system_audit_logs 
ADD COLUMN IF NOT EXISTS table_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS record_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS old_data JSONB,
ADD COLUMN IF NOT EXISTS new_data JSONB;

-- Enable RLS on new tables
ALTER TABLE public.mspace_pesa_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can manage their own mpesa integrations" ON public.mspace_pesa_integrations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credit transactions" ON public.credit_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Add the tables from database-schema-update.sql that are missing

-- API keys table (encrypted storage) - updated version
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    service VARCHAR(100) NOT NULL,
    environment VARCHAR(20) DEFAULT 'production',
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events table
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB DEFAULT '{}',
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_message_history_recipient ON message_history(recipient);
CREATE INDEX IF NOT EXISTS idx_message_history_type ON message_history(type);
CREATE INDEX IF NOT EXISTS idx_message_history_status ON message_history(status);
CREATE INDEX IF NOT EXISTS idx_message_history_created_at ON message_history(created_at);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Insert default roles and permissions
INSERT INTO roles (name, description, is_system_role, permissions) VALUES 
('super_admin', 'Full system access', TRUE, ARRAY['*']),
('admin', 'Administrative access', TRUE, ARRAY['users:read', 'users:write', 'messages:read', 'messages:write', 'audit:read']),
('manager', 'Management access', TRUE, ARRAY['users:read', 'messages:read', 'messages:write']),
('user', 'Standard user access', TRUE, ARRAY['messages:read', 'messages:write', 'profile:read', 'profile:write']),
('readonly', 'Read-only access', TRUE, ARRAY['messages:read', 'profile:read'])
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, resource, action, description) VALUES 
('users:read', 'users', 'read', 'View user information'),
('users:write', 'users', 'write', 'Create and modify users'),
('users:delete', 'users', 'delete', 'Delete users'),
('messages:read', 'messages', 'read', 'View messages'),
('messages:write', 'messages', 'write', 'Send and edit messages'),
('messages:delete', 'messages', 'delete', 'Delete messages'),
('audit:read', 'audit', 'read', 'View audit logs'),
('admin:read', 'admin', 'read', 'View admin interfaces'),
('admin:write', 'admin', 'write', 'Modify system settings'),
('profile:read', 'profile', 'read', 'View own profile'),
('profile:write', 'profile', 'write', 'Edit own profile')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can view security events" ON public.security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
