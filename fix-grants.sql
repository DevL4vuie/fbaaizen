-- =====================================================================
-- FIX: Grant table permissions to authenticated role
-- Run this in Supabase SQL Editor
-- =====================================================================

-- Grant full access on niche_access to authenticated users (RLS still controls row-level)
GRANT ALL ON niche_access TO authenticated;
GRANT ALL ON niche_access TO anon;

-- Also ensure other tables have grants (in case they're missing too)
GRANT ALL ON niches TO authenticated;
GRANT ALL ON tips TO authenticated;
GRANT ALL ON guidelines TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON courses TO authenticated;
GRANT ALL ON progress TO authenticated;

-- Verify grants
SELECT grantee, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'niche_access' AND grantee IN ('authenticated', 'anon');
