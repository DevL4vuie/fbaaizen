-- =====================================================================
-- FIX: Niche visibility - RLS recursion problem
--
-- WHY OTHER USERS STILL SEE THE ASSIGNED NICHE:
-- When a user queries niches, Postgres checks if restrictions exist on niche_access.
-- But niche_access has RLS that only lets users see their OWN rows.
-- So a non-assigned user sees 0 rows in niche_access -> NOT EXISTS returns TRUE
-- -> the niche is incorrectly shown to them!
--
-- SOLUTION:
-- Use SECURITY DEFINER helper functions to check niche_access without RLS restriction.
--
-- RUN THIS IN: Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Helper: does this niche have ANY access restrictions assigned?
CREATE OR REPLACE FUNCTION niche_has_restrictions(niche_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.niche_access WHERE niche_id = niche_uuid
  );
$$;

-- 2. Helper: does this specific user have access to this niche?
CREATE OR REPLACE FUNCTION user_has_niche_access(niche_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.niche_access WHERE niche_id = niche_uuid AND user_id = user_uuid
  );
$$;

-- 3. Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION niche_has_restrictions(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_has_niche_access(uuid, uuid) TO authenticated, anon;

-- 4. Clean up ALL old policies on niches, tips, and guidelines
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'niches'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON niches', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'tips'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON tips', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'guidelines'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON guidelines', pol.policyname);
  END LOOP;
END $$;

-- 5. Recreate niches policies
-- Admins can do everything
CREATE POLICY "niches_admin_all" ON niches
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Users can only read niches that are:
-- (a) Unrestricted (no rows in niche_access for this niche)
-- OR (b) Specifically assigned to this user
CREATE POLICY "niches_user_read" ON niches
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      NOT niche_has_restrictions(niches.id)
      OR user_has_niche_access(niches.id, auth.uid())
    )
  );

-- 6. Recreate tips policies
CREATE POLICY "tips_admin_all" ON tips
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "tips_user_read" ON tips
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin()
      OR niche_id IS NULL
      OR NOT niche_has_restrictions(niche_id)
      OR user_has_niche_access(niche_id, auth.uid())
    )
  );

-- 7. Recreate guidelines policies
CREATE POLICY "guidelines_admin_all" ON guidelines
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "guidelines_user_read" ON guidelines
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin()
      OR niche_id IS NULL
      OR NOT niche_has_restrictions(niche_id)
      OR user_has_niche_access(niche_id, auth.uid())
    )
  );

-- 8. Verify active policies
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('niches', 'tips', 'guidelines', 'niche_access')
ORDER BY tablename, policyname;
