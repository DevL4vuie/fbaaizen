-- =====================================================================
-- Storage Buckets & Policies for Media & Video Uploads
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Create 'media' and 'videos' storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit;

-- 2. Storage Policies for 'media' bucket
DROP POLICY IF EXISTS "Public media select" ON storage.objects;
CREATE POLICY "Public media select" ON storage.objects
  FOR SELECT USING (bucket_id IN ('media', 'videos'));

DROP POLICY IF EXISTS "Authenticated users upload media" ON storage.objects;
CREATE POLICY "Authenticated users upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('media', 'videos') 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users update media" ON storage.objects;
CREATE POLICY "Authenticated users update media" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('media', 'videos') 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users delete media" ON storage.objects;
CREATE POLICY "Authenticated users delete media" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('media', 'videos') 
    AND auth.role() = 'authenticated'
  );

-- 3. Add sample_image_url column to niches table if not exists
ALTER TABLE niches ADD COLUMN IF NOT EXISTS sample_image_url text DEFAULT '';

-- 4. Verify storage buckets
SELECT id, name, public FROM storage.buckets WHERE id IN ('media', 'videos');
