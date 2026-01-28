-- Create evidence storage bucket for OCR-grade file storage
-- This bucket stores all evidence files (documents, screenshots, logs, etc.)
-- Note: Storage extension is managed by Supabase, we only create the bucket record

-- Create the evidence bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence',
  'evidence',
  false, -- Private bucket
  52428800, -- 50MB in bytes
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/csv',
    'application/json',
    'text/plain',
    'text/log'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own evidence" ON storage.objects;

-- Create storage policies for the evidence bucket
-- Users can only upload to their own folder
CREATE POLICY "Users can upload their own evidence"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own evidence
CREATE POLICY "Users can view their own evidence"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own evidence
CREATE POLICY "Users can update their own evidence"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own evidence
CREATE POLICY "Users can delete their own evidence"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Comments
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads. Evidence bucket stores OCR-grade compliance evidence.';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes (50MB = 52428800 bytes)';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Allowed MIME types for evidence files: PDF, DOC, DOCX, PNG, JPEG, CSV, JSON, TXT, LOG';
