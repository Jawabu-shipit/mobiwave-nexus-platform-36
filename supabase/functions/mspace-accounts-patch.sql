-- This is a quick patch to add system-wide credentials support
-- We'll need to update the mspace-accounts function to handle useSystemCredentials parameter

-- First, let's add a system credentials entry capability
-- This can be done through the admin panel by creating an api_credentials record with:
-- service_name: 'mspace_system'
-- user_id: null (for system-wide)
-- username: your mspace username
-- api_key_encrypted: your encrypted mspace api key
-- is_active: true
