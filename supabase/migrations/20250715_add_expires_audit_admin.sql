-- Migration: Add expires_at, created_by, updated_by to api_credentials
ALTER TABLE api_credentials
  ADD COLUMN expires_at DATE,
  ADD COLUMN updated_by UUID;

-- Audit table for credential changes
CREATE TABLE IF NOT EXISTS api_credentials_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES api_credentials(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- add, edit, delete
  actor_id UUID,
  actor_email TEXT,
  timestamp TIMESTAMP DEFAULT now(),
  details JSONB
);

-- Index for faster audit queries
CREATE INDEX IF NOT EXISTS idx_api_credentials_audit_credential_id ON api_credentials_audit(credential_id);
