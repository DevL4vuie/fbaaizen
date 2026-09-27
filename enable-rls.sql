-- =====================================================================
-- CRITICAL STEP: Turn ON Row Level Security on the tables
-- 
-- The policies were created, but Row Level Security was NOT switched on!
-- Without ENABLE ROW LEVEL SECURITY, Postgres ignores all policies
-- and allows everyone (including Visci) to see everything!
--
-- RUN THIS IN: Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Turn ON Row Level Security on all tables
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE niche_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is now ENABLED (rowsecurity must say TRUE)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('niches', 'tips', 'guidelines', 'niche_access', 'profiles', 'courses', 'progress');
