
-- Fix storage policies to require teacher role and ownership

-- Drop old permissive policies
DROP POLICY IF EXISTS "Teachers can delete own videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update own videos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone authenticated can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view videos" ON storage.objects;

-- Recreate with proper ownership checks
CREATE POLICY "Authenticated users can view videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');

CREATE POLICY "Teachers can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos'
    AND has_role(auth.uid(), 'teacher'::app_role)
  );

CREATE POLICY "Teachers can update own videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND has_role(auth.uid(), 'teacher'::app_role)
    AND owner_id::uuid = auth.uid()
  );

CREATE POLICY "Teachers can delete own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND has_role(auth.uid(), 'teacher'::app_role)
    AND owner_id::uuid = auth.uid()
  );

-- Also allow admins to delete any video in storage
CREATE POLICY "Admins can delete any video"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND has_role(auth.uid(), 'admin'::app_role)
  );
