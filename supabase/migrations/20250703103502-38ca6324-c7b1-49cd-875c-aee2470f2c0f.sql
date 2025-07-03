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

-- Enable RLS only if not already enabled
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for SMS templates (drop existing first)
DROP POLICY IF EXISTS "Users can view their own SMS templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can create their own SMS templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can update their own SMS templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can delete their own SMS templates" ON public.sms_templates;

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
DROP TRIGGER IF EXISTS update_sms_templates_updated_at ON public.sms_templates;
CREATE TRIGGER update_sms_templates_updated_at
BEFORE UPDATE ON public.sms_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
DROP INDEX IF EXISTS idx_sms_templates_user_id;
DROP INDEX IF EXISTS idx_sms_templates_category;
CREATE INDEX idx_sms_templates_user_id ON public.sms_templates(user_id);
CREATE INDEX idx_sms_templates_category ON public.sms_templates(category);

-- Add phone validation constraint for contacts (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contacts_phone_format_check' 
        AND table_name = 'contacts'
    ) THEN
        ALTER TABLE public.contacts 
        ADD CONSTRAINT contacts_phone_format_check 
        CHECK (public.validate_kenyan_phone(phone) IS NOT NULL);
    END IF;
END $$;