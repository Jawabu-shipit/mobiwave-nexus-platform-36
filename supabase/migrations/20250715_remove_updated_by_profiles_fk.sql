-- Migration: Remove foreign key for updated_by to simplify embedding
ALTER TABLE api_credentials
  DROP CONSTRAINT IF EXISTS fk_api_credentials_updated_by_profiles;
-- Only created_by will reference profiles(id)
