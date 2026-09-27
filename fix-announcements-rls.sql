-- =====================================================================
-- FIX: Announcements RLS Permission Denied
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- Step 1: Drop ALL existing policies on announcements (clean slate)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'announcements'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON announcements', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Make sure RLS is enabled
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Step 3: Allow ALL authenticated users to READ announcements
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 4: Allow admin users to INSERT
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 5: Allow admin users to UPDATE
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 6: Allow admin users to DELETE
CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 7: Grant table-level permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON announcements TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
