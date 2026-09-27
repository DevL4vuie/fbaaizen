-- =====================================================================
-- Activity Logs: Track user logins, page views, and actions
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Create the activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,         -- 'login', 'page_view', 'niche_view', 'course_view', 'support_message', 'logout'
  metadata jsonb DEFAULT '{}',  -- extra info like { "niche_name": "afaf", "page": "/dashboard" }
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. Grants
GRANT ALL ON activity_logs TO authenticated;

-- 4. Policies
-- Admin can read all logs
CREATE POLICY "activity_logs_admin_select" ON activity_logs
  FOR SELECT USING (is_admin());

-- Any authenticated user can INSERT their own logs
CREATE POLICY "activity_logs_insert" ON activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can delete logs (cleanup)
CREATE POLICY "activity_logs_admin_delete" ON activity_logs
  FOR DELETE USING (is_admin());

-- 5. Index for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- 6. Verify
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename = 'activity_logs'
ORDER BY policyname;
