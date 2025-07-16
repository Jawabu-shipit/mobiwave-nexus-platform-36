-- Add columns to campaigns table for data model integration
ALTER TABLE "public"."campaigns" 
ADD COLUMN IF NOT EXISTS "data_model_id" UUID REFERENCES public.data_models(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "target_criteria" JSONB,
ADD COLUMN IF NOT EXISTS "content" TEXT,
ADD COLUMN IF NOT EXISTS "message" TEXT,
ADD COLUMN IF NOT EXISTS "subject" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Update existing campaigns to have the message field populated from message_content, if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='campaigns' AND column_name='message_content'
  ) THEN
    EXECUTE '
      UPDATE public.campaigns
      SET message = message_content, content = message_content
      WHERE message IS NULL AND message_content IS NOT NULL
    ';
  END IF;
END$$;

-- Create index for data_model_id
CREATE INDEX IF NOT EXISTS "campaigns_data_model_id_idx" ON "public"."campaigns"("data_model_id");

-- Create index for status
CREATE INDEX IF NOT EXISTS "campaigns_status_idx" ON "public"."campaigns"("status");