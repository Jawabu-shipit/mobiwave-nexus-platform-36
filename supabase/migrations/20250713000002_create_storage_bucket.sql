-- Create storage bucket for file imports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('imports', 'imports', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload import files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'imports' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to read their own files
CREATE POLICY "Allow users to read their own import files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'imports' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own import files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'imports' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);