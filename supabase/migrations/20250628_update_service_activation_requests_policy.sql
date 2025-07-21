-- Allow both admin and super_admin to view all service requests
DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_activation_requests;

CREATE POLICY "Admins and Super Admins can view all service requests"
  ON public.service_activation_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
