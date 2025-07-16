-- Add get_current_user_role() helper function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
DECLARE
  result text;
BEGIN
  SELECT role INTO result FROM public.profiles WHERE id = auth.uid();
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins and super_admins to insert credentials for any user
CREATE POLICY "Admins can insert API credentials for any user"
ON public.api_credentials
FOR INSERT
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'super_admin')
  OR auth.uid() = user_id
);

-- Allow admins and super_admins to select any credentials
CREATE POLICY "Admins can select any API credentials"
ON public.api_credentials
FOR SELECT
USING (
  public.get_current_user_role() IN ('admin', 'super_admin')
  OR auth.uid() = user_id
);

-- Allow admins and super_admins to update any credentials
CREATE POLICY "Admins can update any API credentials"
ON public.api_credentials
FOR UPDATE
USING (
  public.get_current_user_role() IN ('admin', 'super_admin')
  OR auth.uid() = user_id
);

-- Allow admins and super_admins to delete any credentials
CREATE POLICY "Admins can delete any API credentials"
ON public.api_credentials
FOR DELETE
USING (
  public.get_current_user_role() IN ('admin', 'super_admin')
  OR auth.uid() = user_id
);
