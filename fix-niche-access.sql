-- =====================================================================
-- FIX: niche_access permissions (run this in Supabase SQL Editor)
-- =====================================================================

-- Step 1: Drop ALL existing policies on niche_access
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'niche_access'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON niche_access', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Make sure RLS is enabled
ALTER TABLE niche_access ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, clear policies
-- Admin can SELECT all rows
CREATE POLICY "niche_access_admin_select" ON niche_access
  FOR SELECT USING (is_admin());

-- Regular user can SELECT only their own rows
CREATE POLICY "niche_access_user_select" ON niche_access
  FOR SELECT USING (user_id = auth.uid());

-- Admin can INSERT
CREATE POLICY "niche_access_admin_insert" ON niche_access
  FOR INSERT WITH CHECK (is_admin());

-- Admin can DELETE
CREATE POLICY "niche_access_admin_delete" ON niche_access
  FOR DELETE USING (is_admin());

-- Admin can UPDATE
CREATE POLICY "niche_access_admin_update" ON niche_access
  FOR UPDATE USING (is_admin());

-- Step 4: Also fix niches table policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'niches'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON niches', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "niches_admin_all" ON niches
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "niches_user_read" ON niches
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      NOT EXISTS (SELECT 1 FROM niche_access WHERE niche_access.niche_id = niches.id)
      OR EXISTS (SELECT 1 FROM niche_access WHERE niche_access.niche_id = niches.id AND niche_access.user_id = auth.uid())
    )
  );

-- Step 5: Verify policies were created
SELECT tablename, policyname, cmd, qual FROM pg_policies 
WHERE tablename IN ('niche_access', 'niches')
ORDER BY tablename, policyname;
