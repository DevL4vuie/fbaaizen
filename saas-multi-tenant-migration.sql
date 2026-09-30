-- =====================================================================
-- SAAS MULTI-TENANT ARCHITECTURE MIGRATION
-- Run this in: Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Update profiles table:
--   - Allow 'superadmin' role in addition to 'admin' and 'user'
--   - Add created_by_admin_id to associate every student user with their Creator Admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('superadmin', 'admin', 'user'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_by_admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS studio_name text DEFAULT '';

-- 2. Add creator_id (owner) to all tenant resource tables
ALTER TABLE niches ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE guidelines ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Set the superadmin user!
-- User: superadmin@gmail.com (UID: 7d4786fd-f127-4eb6-a430-3b8caaf30436)
INSERT INTO profiles (id, name, email, role, created_by_admin)
VALUES (
  '7d4786fd-f127-4eb6-a430-3b8caaf30436',
  'Super Admin',
  'superadmin@gmail.com',
  'superadmin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'superadmin',
  name = 'Super Admin';

-- Also backfill any existing resources to the superadmin so current data remains intact
UPDATE niches SET creator_id = '7d4786fd-f127-4eb6-a430-3b8caaf30436' WHERE creator_id IS NULL;
UPDATE courses SET creator_id = '7d4786fd-f127-4eb6-a430-3b8caaf30436' WHERE creator_id IS NULL;
UPDATE tips SET creator_id = '7d4786fd-f127-4eb6-a430-3b8caaf30436' WHERE creator_id IS NULL;
UPDATE guidelines SET creator_id = '7d4786fd-f127-4eb6-a430-3b8caaf30436' WHERE creator_id IS NULL;
UPDATE announcements SET creator_id = '7d4786fd-f127-4eb6-a430-3b8caaf30436' WHERE creator_id IS NULL;

-- 4. Helper security functions
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$;

-- Helper to get the creator_id for the current user
-- If the current user is an admin or superadmin, their creator_id is themselves.
-- If the current user is a regular user, their creator_id is their created_by_admin_id.
CREATE OR REPLACE FUNCTION get_current_tenant_creator_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN role IN ('admin', 'superadmin') THEN id
    ELSE created_by_admin_id
  END
  FROM profiles
  WHERE id = auth.uid();
$$;

-- 5. Multi-Tenant Row Level Security (RLS) Policies

-- Niches: Superadmin sees all; Creator admin sees only their niches; User sees only their creator's niches
DROP POLICY IF EXISTS "niches_multi_tenant_select" ON niches;
CREATE POLICY "niches_multi_tenant_select" ON niches
  FOR SELECT USING (
    is_superadmin()
    OR creator_id = get_current_tenant_creator_id()
    OR creator_id = auth.uid()
  );

DROP POLICY IF EXISTS "niches_multi_tenant_write" ON niches;
CREATE POLICY "niches_multi_tenant_write" ON niches
  FOR ALL USING (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  )
  WITH CHECK (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  );

-- Courses RLS
DROP POLICY IF EXISTS "courses_multi_tenant_select" ON courses;
CREATE POLICY "courses_multi_tenant_select" ON courses
  FOR SELECT USING (
    is_superadmin()
    OR creator_id = get_current_tenant_creator_id()
    OR creator_id = auth.uid()
  );

DROP POLICY IF EXISTS "courses_multi_tenant_write" ON courses;
CREATE POLICY "courses_multi_tenant_write" ON courses
  FOR ALL USING (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  )
  WITH CHECK (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  );

-- Tips RLS
DROP POLICY IF EXISTS "tips_multi_tenant_select" ON tips;
CREATE POLICY "tips_multi_tenant_select" ON tips
  FOR SELECT USING (
    is_superadmin()
    OR creator_id = get_current_tenant_creator_id()
    OR creator_id = auth.uid()
  );

DROP POLICY IF EXISTS "tips_multi_tenant_write" ON tips;
CREATE POLICY "tips_multi_tenant_write" ON tips
  FOR ALL USING (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  )
  WITH CHECK (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  );

-- Guidelines RLS
DROP POLICY IF EXISTS "guidelines_multi_tenant_select" ON guidelines;
CREATE POLICY "guidelines_multi_tenant_select" ON guidelines
  FOR SELECT USING (
    is_superadmin()
    OR creator_id = get_current_tenant_creator_id()
    OR creator_id = auth.uid()
  );

DROP POLICY IF EXISTS "guidelines_multi_tenant_write" ON guidelines;
CREATE POLICY "guidelines_multi_tenant_write" ON guidelines
  FOR ALL USING (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  )
  WITH CHECK (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  );

-- Announcements RLS
DROP POLICY IF EXISTS "announcements_multi_tenant_select" ON announcements;
CREATE POLICY "announcements_multi_tenant_select" ON announcements
  FOR SELECT USING (
    is_superadmin()
    OR creator_id = get_current_tenant_creator_id()
    OR creator_id = auth.uid()
  );

DROP POLICY IF EXISTS "announcements_multi_tenant_write" ON announcements;
CREATE POLICY "announcements_multi_tenant_write" ON announcements
  FOR ALL USING (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  )
  WITH CHECK (
    is_superadmin()
    OR (is_admin() AND (creator_id = auth.uid() OR creator_id IS NULL))
  );

-- Profiles RLS: 
-- Superadmin sees all; Creator admin sees only users they created + themselves; User sees only their own profile
DROP POLICY IF EXISTS "profiles_multi_tenant_select" ON profiles;
CREATE POLICY "profiles_multi_tenant_select" ON profiles
  FOR SELECT USING (
    is_superadmin()
    OR id = auth.uid()
    OR created_by_admin_id = auth.uid()
  );

DROP POLICY IF EXISTS "profiles_multi_tenant_update" ON profiles;
CREATE POLICY "profiles_multi_tenant_update" ON profiles
  FOR UPDATE USING (
    is_superadmin()
    OR id = auth.uid()
    OR created_by_admin_id = auth.uid()
  );

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_niches_creator_id ON niches(creator_id);
CREATE INDEX IF NOT EXISTS idx_courses_creator_id ON courses(creator_id);
CREATE INDEX IF NOT EXISTS idx_tips_creator_id ON tips(creator_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_creator_id ON guidelines(creator_id);
CREATE INDEX IF NOT EXISTS idx_announcements_creator_id ON announcements(creator_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_by_admin ON profiles(created_by_admin_id);
