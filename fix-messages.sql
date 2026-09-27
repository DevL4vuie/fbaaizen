-- =====================================================================
-- FIX: Messages permissions & policies (Allows Admin & Users to Delete)
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Ensure authenticated users have table access
GRANT ALL ON messages TO authenticated;

-- 2. Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing policies on messages
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON messages', pol.policyname);
  END LOOP;
END $$;

-- 4. Recreate policies:

-- Users can read their own messages; Admins can read all messages
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- Users can insert messages for themselves
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can update messages (to add replies)
CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- BOTH Admins and the Message Owner (User) can DELETE messages
CREATE POLICY "messages_delete" ON messages
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Verify
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;
