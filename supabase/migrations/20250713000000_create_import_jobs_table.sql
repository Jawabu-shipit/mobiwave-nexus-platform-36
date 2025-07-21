-- Create the import_jobs table for tracking file import operations
CREATE TABLE "public"."import_jobs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "model_id" UUID REFERENCES public.data_models(id) ON DELETE CASCADE NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    "total_records" INTEGER,
    "processed_records" INTEGER DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX "import_jobs_user_id_idx" ON "public"."import_jobs"("user_id");
CREATE INDEX "import_jobs_model_id_idx" ON "public"."import_jobs"("model_id");
CREATE INDEX "import_jobs_status_idx" ON "public"."import_jobs"("status");

-- Add row-level security
ALTER TABLE "public"."import_jobs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to own import jobs" ON "public"."import_jobs" FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update the updated_at timestamp
CREATE TRIGGER "handle_import_jobs_updated_at"
BEFORE UPDATE ON "public"."import_jobs"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_current_timestamp_updated_at"();