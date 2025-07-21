-- Allow admins and super_admins to insert into user_service_subscriptions for any user
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_service_subscriptions;

CREATE POLICY "Admins and Super Admins can insert subscriptions for any user"
  ON public.user_service_subscriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
