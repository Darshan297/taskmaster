/*
  # Storage Policies for Profile Images

  1. Create Storage Bucket
    - Create a new bucket named 'profile' for storing profile images
    - Make the bucket public
  
  2. Security
    - Add policies for authenticated users to:
      - Read profile images
      - Upload profile images
      - Delete profile images
*/

-- Create the profile bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile', 'profile', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to read profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to delete profile images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create new policies
CREATE POLICY "Allow authenticated users to read profile images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile');

CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile');

CREATE POLICY "Allow authenticated users to delete profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile');