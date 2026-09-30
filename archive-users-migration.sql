-- =====================================================================
-- Migration: Add Archived Status for Users
-- Run this in: Supabase Dashboard -> SQL Editor -> Run
-- =====================================================================

-- 1. Add is_archived and archived_at columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT null;

-- 2. Optional: Index on is_archived and banned for high performance filtering
CREATE INDEX IF NOT EXISTS idx_profiles_archived ON profiles(is_archived);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(banned);
