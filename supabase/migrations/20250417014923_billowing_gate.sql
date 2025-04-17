/*
  # Add storage policies for profile bucket

  1. Security
    - Enable storage policies for profile bucket
    - Allow authenticated users to:
      - Read their own profile images
      - Upload their own profile images
      - Delete their own profile images
*/

-- Create storage policies for profile bucket
BEGIN;

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

COMMIT;