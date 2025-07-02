
-- 1. Create a user_roles table to allow many-to-many assignment of roles to users.
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id)
);

-- 2. Create a permissions table (if not already present, see your schema)
-- Skipped, as you already have a permissions table.

-- 3. Create a role_permissions junction table (already present, see schema)
-- No action needed. role_permissions table already exists.

-- 4. Add, if missing, missing columns for enhanced auditing
-- Already present in your audit_logs and system_audit_logs.

-- 5. Enable Row Level Security (RLS) on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. RLS policy: Only admins can MANAGE (select/insert/update/delete) user_roles
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM profiles AS p
      WHERE p.id = auth.uid() 
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles AS p
      WHERE p.id = auth.uid() 
        AND p.role = 'admin'
    )
  );

-- 7. Add index for performance on user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- 8. Create audit log trigger for admin impersonation (log when admin logs in as another user)
CREATE OR REPLACE FUNCTION public.log_admin_impersonation_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata, severity, status, created_at)
  VALUES (
      auth.uid(),
      'impersonate_user',
      'user',
      NEW.id,
      jsonb_build_object('impersonator_id', auth.uid(), 'target_user_id', NEW.id),
      'high',
      'success',
      now()
  );
  RETURN NEW;
END;
$$;

-- 9. All done -- Next: Client and Admin Dashboards should now implement UI to allow:
--    - Admins to view, assign, and revoke roles per user
--    - Full audit logging of admin impersonation

