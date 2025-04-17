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
DO $$
BEGIN
  -- Create policy to allow authenticated users to read their own profile images
  INSERT INTO storage.policies (name, bucket_id, definition)
  SELECT 
    'Allow authenticated users to read profile images',
    id,
    '(role() = ''authenticated'')'
  FROM storage.buckets
  WHERE name = 'profile'
  ON CONFLICT DO NOTHING;

  -- Create policy to allow authenticated users to upload their own profile images
  INSERT INTO storage.policies (name, bucket_id, definition)
  SELECT 
    'Allow authenticated users to upload profile images',
    id,
    '(role() = ''authenticated'')'
  FROM storage.buckets
  WHERE name = 'profile'
  ON CONFLICT DO NOTHING;

  -- Create policy to allow authenticated users to delete their own profile images
  INSERT INTO storage.policies (name, bucket_id, definition)
  SELECT 
    'Allow authenticated users to delete profile images',
    id,
    '(role() = ''authenticated'')'
  FROM storage.buckets
  WHERE name = 'profile'
  ON CONFLICT DO NOTHING;
END $$;