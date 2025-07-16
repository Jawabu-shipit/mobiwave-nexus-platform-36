-- Create the table to store user-defined data model schemas
CREATE TABLE "public"."data_models" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a unique constraint on user_id and model name
ALTER TABLE "public"."data_models" ADD CONSTRAINT "data_models_user_id_name_key" UNIQUE ("user_id", "name");

-- Add row-level security for the data_models table
ALTER TABLE "public"."data_models" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to own data models" ON "public"."data_models" FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create the table to store the actual records for each data model
CREATE TABLE "public"."records" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "model_id" UUID REFERENCES public.data_models(id) ON DELETE CASCADE NOT NULL,
    "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create an index on the model_id for faster lookups
CREATE INDEX "records_model_id_idx" ON "public"."records"("model_id");

-- Create an index on the user_id for faster lookups
CREATE INDEX "records_user_id_idx" ON "public"."records"("user_id");

-- Add row-level security for the records table
ALTER TABLE "public"."records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to own records" ON "public"."records" FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp on data_models table
CREATE TRIGGER "handle_updated_at"
BEFORE UPDATE ON "public"."data_models"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_current_timestamp_updated_at"();

-- Trigger to update the updated_at timestamp on records table
CREATE TRIGGER "handle_records_updated_at"
BEFORE UPDATE ON "public"."records"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_current_timestamp_updated_at"();