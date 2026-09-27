-- =====================================================================
-- COMPLETE MIGRATION: PDF/DOCX Attachments for:
--  1) Niches  (lock, price, file attachment)
--  2) Courses (price, file attachment)
--  3) Guidelines (title, file attachment)
--  4) Tips (file attachment)
--  5) Announcements (Public Posting with RLS)
--  6) Storage bucket setup for documents
--
-- SAFE TO RE-RUN — uses IF NOT EXISTS / IF EXISTS everywhere.
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Niches: Add locked, price, and file attachment columns
ALTER TABLE niches ADD COLUMN IF NOT EXISTS sample_image_url text DEFAULT '';
ALTER TABLE niches ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false;
ALTER TABLE niches ADD COLUMN IF NOT EXISTS price text DEFAULT '';
ALTER TABLE niches ADD COLUMN IF NOT EXISTS file_url text DEFAULT '';
ALTER TABLE niches ADD COLUMN IF NOT EXISTS file_name text DEFAULT '';

-- 2. Courses: Add price and file attachment columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price text DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS file_url text DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS file_name text DEFAULT '';

-- 3. Guidelines: Add title and file attachment columns
ALTER TABLE guidelines ADD COLUMN IF NOT EXISTS title text DEFAULT '';
ALTER TABLE guidelines ADD COLUMN IF NOT EXISTS file_url text DEFAULT '';
ALTER TABLE guidelines ADD COLUMN IF NOT EXISTS file_name text DEFAULT '';

-- 4. Tips: Add file attachment columns
ALTER TABLE tips ADD COLUMN IF NOT EXISTS file_url text DEFAULT '';
ALTER TABLE tips ADD COLUMN IF NOT EXISTS file_name text DEFAULT '';

-- =====================================================================
-- 5. Announcements Table for public posts
-- =====================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  file_url text DEFAULT '',
  file_name text DEFAULT '',
  file_type text DEFAULT '',
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Announcements RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to READ announcements
DROP POLICY IF EXISTS "announcements_read_all" ON announcements;
CREATE POLICY "announcements_read_all" ON announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow admin users to INSERT announcements
DROP POLICY IF EXISTS "announcements_admin_insert" ON announcements;
CREATE POLICY "announcements_admin_insert" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to UPDATE announcements
DROP POLICY IF EXISTS "announcements_admin_update" ON announcements;
CREATE POLICY "announcements_admin_update" ON announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to DELETE announcements
DROP POLICY IF EXISTS "announcements_admin_delete" ON announcements;
CREATE POLICY "announcements_admin_delete" ON announcements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop the old combined policy if it exists (replaced by separate policies)
DROP POLICY IF EXISTS "announcements_admin_all" ON announcements;

-- =====================================================================
-- 6. Niches select policy so all users see niches (with lock overlay when locked)
-- =====================================================================
DROP POLICY IF EXISTS "niches_user_read" ON niches;
CREATE POLICY "niches_user_read" ON niches
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================================
-- 7. Storage bucket 'documents' for PDF/DOCX uploads
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', true, 52428800, ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for documents bucket
DROP POLICY IF EXISTS "Public documents select" ON storage.objects;
CREATE POLICY "Public documents select" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users upload documents" ON storage.objects;
CREATE POLICY "Authenticated users upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users update documents" ON storage.objects;
CREATE POLICY "Authenticated users update documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users delete documents" ON storage.objects;
CREATE POLICY "Authenticated users delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
  );
