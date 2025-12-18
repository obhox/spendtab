-- Supabase Storage setup for invoice logos
-- Run this in your Supabase SQL Editor

-- Create the invoice-logos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-logos',
  'invoice-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the invoice-logos bucket

-- Policy to allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own logo" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoice-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow public access to view logos (needed for invoice recipients)
CREATE POLICY "Anyone can view invoice logos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoice-logos'
);

-- Policy to allow authenticated users to update their own logo
CREATE POLICY "Users can update their own logo" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'invoice-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to delete their own logo
CREATE POLICY "Users can delete their own logo" ON storage.objects
FOR DELETE USING (
  bucket_id = 'invoice-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable RLS on storage.objects if not already enabled
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
