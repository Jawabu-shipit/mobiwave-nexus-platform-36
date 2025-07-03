-- Create SMS Templates table
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for SMS templates
CREATE POLICY "Users can view their own SMS templates" 
ON public.sms_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SMS templates" 
ON public.sms_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS templates" 
ON public.sms_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMS templates" 
ON public.sms_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_sms_templates_updated_at
BEFORE UPDATE ON public.sms_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_sms_templates_user_id ON public.sms_templates(user_id);
CREATE INDEX idx_sms_templates_category ON public.sms_templates(category);

-- Insert some default templates
INSERT INTO public.sms_templates (user_id, name, content, category, variables) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Welcome Message',
    'Welcome {{name}}! Thank you for joining {{company}}. Your account is now active.',
    'welcome',
    ARRAY['name', 'company']
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Payment Reminder',
    'Hi {{name}}, your payment of {{amount}} is due on {{date}}. Please pay to avoid late fees.',
    'billing',
    ARRAY['name', 'amount', 'date']
  );

-- Add phone validation constraint for contacts
ALTER TABLE public.contacts 
ADD CONSTRAINT contacts_phone_format_check 
CHECK (public.validate_kenyan_phone(phone) IS NOT NULL);

-- Create contact group members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contact_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.contact_groups(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, contact_id)
);

-- Enable RLS on contact_group_members
ALTER TABLE public.contact_group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for contact group members
CREATE POLICY "Users can manage their group members" 
ON public.contact_group_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.contact_groups 
    WHERE contact_groups.id = contact_group_members.group_id 
    AND contact_groups.user_id = auth.uid()
  )
);

-- Add trigger to update contact group count
CREATE OR REPLACE FUNCTION public.update_contact_group_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE contact_groups 
        SET contact_count = contact_count + 1,
            updated_at = NOW()
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE contact_groups 
        SET contact_count = contact_count - 1,
            updated_at = NOW()
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for contact group count
DROP TRIGGER IF EXISTS trigger_update_contact_group_count_insert ON public.contact_group_members;
DROP TRIGGER IF EXISTS trigger_update_contact_group_count_delete ON public.contact_group_members;

CREATE TRIGGER trigger_update_contact_group_count_insert
    AFTER INSERT ON public.contact_group_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_group_count();

CREATE TRIGGER trigger_update_contact_group_count_delete
    AFTER DELETE ON public.contact_group_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_group_count();