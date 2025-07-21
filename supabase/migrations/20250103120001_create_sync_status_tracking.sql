-- Create sync operations tracking table
CREATE TABLE IF NOT EXISTS mspace_sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR NOT NULL CHECK (operation_type IN ('manual_sync', 'scheduled_sync', 'balance_sync', 'full_sync')),
    operation_status VARCHAR NOT NULL DEFAULT 'running' CHECK (operation_status IN ('running', 'completed', 'failed', 'partial')),
    
    -- Operation details
    initiated_by UUID REFERENCES auth.users(id),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Results tracking
    total_clients_processed INTEGER DEFAULT 0,
    successful_syncs INTEGER DEFAULT 0,
    failed_syncs INTEGER DEFAULT 0,
    new_clients_added INTEGER DEFAULT 0,
    clients_updated INTEGER DEFAULT 0,
    
    -- Error tracking
    error_message TEXT,
    error_details JSONB,
    
    -- Metadata
    operation_metadata JSONB DEFAULT '{}',
    sync_source VARCHAR DEFAULT 'api' CHECK (sync_source IN ('api', 'webhook', 'scheduled')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sync operation logs for detailed tracking
CREATE TABLE IF NOT EXISTS mspace_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES mspace_sync_operations(id) ON DELETE CASCADE,
    client_id VARCHAR NOT NULL,
    log_level VARCHAR NOT NULL CHECK (log_level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    details JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sync configuration table
CREATE TABLE IF NOT EXISTS mspace_sync_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default sync configuration
INSERT INTO mspace_sync_config (config_key, config_value, description) VALUES 
('sync_interval_minutes', '30', 'How often to run automatic sync (in minutes)'),
('max_sync_attempts', '3', 'Maximum number of retry attempts for failed syncs'),
('batch_size', '50', 'Number of clients to process in each batch'),
('enable_auto_sync', 'true', 'Whether automatic background sync is enabled'),
('sync_balance_threshold', '0.1', 'Minimum balance change to trigger sync'),
('auto_create_profiles', 'false', 'Whether to automatically create user profiles for new clients'),
('notification_on_sync_failure', 'true', 'Whether to send notifications when sync fails')
ON CONFLICT (config_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mspace_sync_operations_status ON mspace_sync_operations(operation_status);
CREATE INDEX IF NOT EXISTS idx_mspace_sync_operations_type ON mspace_sync_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_mspace_sync_operations_initiated_at ON mspace_sync_operations(initiated_at);
CREATE INDEX IF NOT EXISTS idx_mspace_sync_operations_initiated_by ON mspace_sync_operations(initiated_by);

CREATE INDEX IF NOT EXISTS idx_mspace_sync_logs_operation_id ON mspace_sync_logs(operation_id);
CREATE INDEX IF NOT EXISTS idx_mspace_sync_logs_client_id ON mspace_sync_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_mspace_sync_logs_level ON mspace_sync_logs(log_level);

CREATE INDEX IF NOT EXISTS idx_mspace_sync_config_key ON mspace_sync_config(config_key);
CREATE INDEX IF NOT EXISTS idx_mspace_sync_config_active ON mspace_sync_config(is_active);

-- Create updated_at trigger for sync config
CREATE OR REPLACE FUNCTION update_mspace_sync_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mspace_sync_config_updated_at
    BEFORE UPDATE ON mspace_sync_config
    FOR EACH ROW
    EXECUTE FUNCTION update_mspace_sync_config_updated_at();

-- Row Level Security
ALTER TABLE mspace_sync_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mspace_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mspace_sync_config ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can access all sync operations" ON mspace_sync_operations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all sync logs" ON mspace_sync_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access sync config" ON mspace_sync_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
        )
    );

-- Create helper functions
CREATE OR REPLACE FUNCTION start_sync_operation(
    p_operation_type VARCHAR,
    p_initiated_by UUID DEFAULT auth.uid(),
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    operation_id UUID;
BEGIN
    INSERT INTO mspace_sync_operations (
        operation_type,
        initiated_by,
        operation_metadata
    ) VALUES (
        p_operation_type,
        p_initiated_by,
        p_metadata
    ) RETURNING id INTO operation_id;
    
    RETURN operation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION complete_sync_operation(
    p_operation_id UUID,
    p_status VARCHAR,
    p_total_processed INTEGER DEFAULT 0,
    p_successful INTEGER DEFAULT 0,
    p_failed INTEGER DEFAULT 0,
    p_new_added INTEGER DEFAULT 0,
    p_updated INTEGER DEFAULT 0,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE mspace_sync_operations SET
        operation_status = p_status,
        completed_at = now(),
        duration_ms = EXTRACT(EPOCH FROM (now() - initiated_at)) * 1000,
        total_clients_processed = p_total_processed,
        successful_syncs = p_successful,
        failed_syncs = p_failed,
        new_clients_added = p_new_added,
        clients_updated = p_updated,
        error_message = p_error_message
    WHERE id = p_operation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_sync_message(
    p_operation_id UUID,
    p_client_id VARCHAR,
    p_level VARCHAR,
    p_message TEXT,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO mspace_sync_logs (
        operation_id,
        client_id,
        log_level,
        message,
        details
    ) VALUES (
        p_operation_id,
        p_client_id,
        p_level,
        p_message,
        p_details
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE mspace_sync_operations IS 'Tracks MSpace synchronization operations and their results';
COMMENT ON TABLE mspace_sync_logs IS 'Detailed logs for each client during sync operations';
COMMENT ON TABLE mspace_sync_config IS 'Configuration settings for MSpace synchronization';
