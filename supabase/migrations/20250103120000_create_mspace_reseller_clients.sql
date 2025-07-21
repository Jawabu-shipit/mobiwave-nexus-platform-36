-- Create MSpace Reseller Clients table for persistent storage and sync management
CREATE TABLE IF NOT EXISTS mspace_reseller_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mspace_client_id VARCHAR NOT NULL UNIQUE,
    client_name VARCHAR NOT NULL,
    username VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    balance DECIMAL(10,2) DEFAULT 0,
    previous_balance DECIMAL(10,2) DEFAULT 0,
    status VARCHAR DEFAULT 'active',
    user_type VARCHAR DEFAULT 'reseller_client' CHECK (user_type IN ('reseller_client', 'sub_account')),
    
    -- MSpace original data
    created_date TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Sync tracking
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sync_status VARCHAR DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error', 'conflict')),
    sync_error_message TEXT,
    sync_attempts INTEGER DEFAULT 0,
    
    -- Profile creation tracking
    profile_created BOOLEAN DEFAULT false,
    profile_user_id UUID REFERENCES auth.users(id),
    api_credentials_assigned BOOLEAN DEFAULT false,
    assigned_api_credential_id UUID REFERENCES api_credentials(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mspace_reseller_clients_mspace_id ON mspace_reseller_clients(mspace_client_id);
CREATE INDEX IF NOT EXISTS idx_mspace_reseller_clients_status ON mspace_reseller_clients(status);
CREATE INDEX IF NOT EXISTS idx_mspace_reseller_clients_sync_status ON mspace_reseller_clients(sync_status);
CREATE INDEX IF NOT EXISTS idx_mspace_reseller_clients_user_type ON mspace_reseller_clients(user_type);
CREATE INDEX IF NOT EXISTS idx_mspace_reseller_clients_profile_user ON mspace_reseller_clients(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_mspace_reseller_clients_last_synced ON mspace_reseller_clients(last_synced_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mspace_reseller_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mspace_reseller_clients_updated_at
    BEFORE UPDATE ON mspace_reseller_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_mspace_reseller_clients_updated_at();

-- Create balance change tracking function
CREATE OR REPLACE FUNCTION track_balance_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Store previous balance when balance changes
    IF OLD.balance IS DISTINCT FROM NEW.balance THEN
        NEW.previous_balance = OLD.balance;
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_balance_changes
    BEFORE UPDATE ON mspace_reseller_clients
    FOR EACH ROW
    EXECUTE FUNCTION track_balance_changes();

-- Row Level Security
ALTER TABLE mspace_reseller_clients ENABLE ROW LEVEL SECURITY;

-- Admin can access all records
CREATE POLICY "Admins can access all mspace reseller clients" ON mspace_reseller_clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
        )
    );

-- Users can only access their own assigned record
CREATE POLICY "Users can access their assigned mspace client" ON mspace_reseller_clients
    FOR SELECT USING (profile_user_id = auth.uid());

-- Comment on table
COMMENT ON TABLE mspace_reseller_clients IS 'Stores synced MSpace reseller clients and sub-accounts with sync tracking and profile management';
COMMENT ON COLUMN mspace_reseller_clients.mspace_client_id IS 'Unique identifier from MSpace API (clientUserName or subAccUser)';
COMMENT ON COLUMN mspace_reseller_clients.sync_status IS 'Current synchronization status with MSpace';
COMMENT ON COLUMN mspace_reseller_clients.profile_created IS 'Whether a user profile has been created for this client';
COMMENT ON COLUMN mspace_reseller_clients.api_credentials_assigned IS 'Whether API credentials have been manually assigned';
COMMENT ON COLUMN mspace_reseller_clients.metadata IS 'Additional data from MSpace API responses';
