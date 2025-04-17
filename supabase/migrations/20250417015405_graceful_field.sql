/*
  # Storage Configuration for Profile Images

  1. Create Storage Bucket
    - Create a new bucket named 'profile' for storing profile images
  
  2. Security
    - Enable public access for the bucket
    - Add policies for authenticated users to:
      - Read profile images
      - Upload profile images
      - Delete profile images
*/

-- Create the profile bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile', 'profile', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for reading profile images
CREATE POLICY "Allow authenticated users to read profile images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile');

-- Policy for uploading profile images
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile');

-- Policy for deleting profile images
CREATE POLICY "Allow authenticated users to delete profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile');

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;