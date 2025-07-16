
-- Phase 1: Critical RLS Policy Implementation

-- Enable RLS on all tables that don't have it
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_types ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Campaigns policies - users can only access their own campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns FOR DELETE 
USING (auth.uid() = user_id);

-- Contacts policies - users can only access their own contacts
CREATE POLICY "Users can view their own contacts" 
ON public.contacts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
ON public.contacts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
ON public.contacts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.contacts FOR DELETE 
USING (auth.uid() = user_id);

-- Credit transactions policies - users can only view their own transactions
CREATE POLICY "Users can view their own credit transactions" 
ON public.credit_transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create credit transactions" 
ON public.credit_transactions FOR INSERT 
WITH CHECK (true); -- System operations need to create these

-- User credits policies - strengthen existing ones
DROP POLICY IF EXISTS "Enable read access for users to own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Enable insert for system during user creation" ON public.user_credits;
DROP POLICY IF EXISTS "Enable update for users to own credits" ON public.user_credits;

CREATE POLICY "Users can view their own credits" 
ON public.user_credits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create user credits" 
ON public.user_credits FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update user credits" 
ON public.user_credits FOR UPDATE 
USING (true);

-- Audit logs policies - admins can view all, users can view their own
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);

-- Roles policies - restrict to admin access only
CREATE POLICY "Admins can manage roles" 
ON public.roles FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Users can read roles" 
ON public.roles FOR SELECT 
USING (true);

-- Services policies - public read, admin write
CREATE POLICY "Everyone can view services" 
ON public.services FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage services" 
ON public.services FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

-- User services policies - users can only access their own services
CREATE POLICY "Users can view their own services" 
ON public.user_services FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own services" 
ON public.user_services FOR ALL 
USING (auth.uid() = user_id);

-- API credentials policies - users can only access their own credentials
CREATE POLICY "Users can view their own api credentials" 
ON public.api_credentials FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own api credentials" 
ON public.api_credentials FOR ALL 
USING (auth.uid() = user_id);

-- User roles policies - restrict access
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- User types policies
CREATE POLICY "Users can view their own user types" 
ON public.user_types FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage user types" 
ON public.user_types FOR ALL 
USING (true);

-- Mspace users policies - admin only for security
CREATE POLICY "Admins can manage mspace users" 
ON public.mspace_users FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

-- Fix profiles RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "System can create profiles during signup" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));
