-- =====================================================================
-- Niche Studio — Supabase schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

-- Make sure the UUID generator is available
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- profiles: one row per auth user, holds role + display info
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_by_admin boolean not null default true,
  last_active timestamptz default now(),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- niches (allowed_user_ids: null or empty means visible to ALL users;
-- array of user uuids means visible ONLY to those users)
-- ---------------------------------------------------------------------
create table if not exists niches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  has_image boolean not null default false,
  has_video boolean not null default false,
  prompt_text text default '',
  sample_video_url text default '',
  allowed_user_ids text[] default null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- tips (niche_id null = general tip shown everywhere)
-- ---------------------------------------------------------------------
create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid references niches(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- guidelines
-- ---------------------------------------------------------------------
create table if not exists guidelines (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid references niches(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  video_urls text[] default '{}',
  niche_id uuid references niches(id) on delete set null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- progress (composite key: one row per user per course)
-- ---------------------------------------------------------------------
create table if not exists progress (
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  percent_complete int not null default 0 check (percent_complete between 0 and 100),
  last_updated timestamptz default now(),
  primary key (user_id, course_id)
);

-- ---------------------------------------------------------------------
-- niche_access: controls which users can see which niches
-- (if a niche has no rows in niche_access, it is open to all users)
-- ---------------------------------------------------------------------
create table if not exists niche_access (
  niche_id uuid references niches(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (niche_id, user_id)
);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table profiles enable row level security;
alter table niches enable row level security;
alter table tips enable row level security;
alter table guidelines enable row level security;
alter table courses enable row level security;
alter table progress enable row level security;
alter table niche_access enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: owner can read their own row; admin can read/write all
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own_or_admin" on profiles
  for update using (id = auth.uid() or is_admin());
create policy "profiles_admin_insert" on profiles
  for insert with check (is_admin() or auth.uid() = id);
create policy "profiles_admin_delete" on profiles
  for delete using (is_admin());

-- niche_access: admin full control, users can check their own assigned rows
create policy "niche_access_read" on niche_access
  for select using (user_id = auth.uid() or is_admin());
create policy "niche_access_write" on niche_access
  for all using (is_admin()) with check (is_admin());

-- niches: admin can read all; users can read if niche has no restrictions OR user is assigned
create policy "niches_read" on niches for select using (
  auth.uid() is not null and (
    is_admin() or
    not exists (select 1 from niche_access where niche_id = niches.id) or
    exists (select 1 from niche_access where niche_id = niches.id and user_id = auth.uid())
  )
);
create policy "niches_write" on niches for all using (is_admin()) with check (is_admin());

create policy "tips_read" on tips for select using (
  auth.uid() is not null and (
    is_admin() or
    niche_id is null or
    not exists (select 1 from niche_access where niche_id = tips.niche_id) or
    exists (select 1 from niche_access where niche_id = tips.niche_id and user_id = auth.uid())
  )
);
create policy "tips_write" on tips for all using (is_admin()) with check (is_admin());

create policy "guidelines_read" on guidelines for select using (
  auth.uid() is not null and (
    is_admin() or
    niche_id is null or
    not exists (select 1 from niche_access where niche_id = guidelines.niche_id) or
    exists (select 1 from niche_access where niche_id = guidelines.niche_id and user_id = auth.uid())
  )
);
create policy "guidelines_write" on guidelines for all using (is_admin()) with check (is_admin());

create policy "courses_read" on courses for select using (auth.uid() is not null);
create policy "courses_write" on courses for all using (is_admin()) with check (is_admin());

-- progress: a user can read/write only their own rows; admin can read all
create policy "progress_owner_rw" on progress
  for all using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- =====================================================================
-- Notes
-- =====================================================================
-- 1. There is no public sign-up. Admin accounts create users via the
--    "admin-create-user" Edge Function (see /supabase/functions), which
--    uses the service_role key server-side (never exposed to the browser).
-- 2. To make your first admin: create a user normally (via the Edge
--    Function or Supabase Dashboard -> Authentication -> Add user), then
--    run:
--      update profiles set role = 'admin' where email = 'you@example.com';
