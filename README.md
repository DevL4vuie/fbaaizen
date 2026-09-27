# Niche Studio

A creator-training platform: admins manage niches, prompts, tips, guidelines,
and courses; users log in to watch content and track course progress.

Built with **React + Vite + Tailwind v4 + Framer Motion + Supabase**, styled
in a black-and-orange "editing studio" theme with a video-timeline motif
throughout (progress bars look like scrubbers, cards have an animated flame
border on hover). Every screen is its own route/page — nothing is a single
giant page — so any one piece can be fixed without touching the rest.

Everything below is written for someone who has **not** used Supabase or
GitHub Pages before. Follow it top to bottom.

---

## 1. What you need to do (the only two things)

1. **Create the database** (Supabase — free) and paste two keys into a file.
2. **Adjust the UI** if you want — every color lives in one file
   (`src/index.css`), so re-theming is a find-and-replace, not a rebuild.

Everything else (pages, auth, admin tools, progress tracking) is already built.

---

## 2. Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New project**.
2. Wait ~2 minutes for it to provision.
3. Open **SQL Editor** (left sidebar) → **New query** → paste the entire
   contents of `supabase-schema.sql` (in this folder) → **Run**.
   This creates all your tables (`profiles`, `niches`, `tips`, `guidelines`,
   `courses`, `progress`) and locks them down with row-level security so
   users can only see what they're supposed to.
4. Go to **Settings → API**. Copy:
   - **Project URL**
   - **anon public** key
5. In this project folder, copy `.env.example` to a new file named `.env`
   and paste those two values in:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. **Turn on email/password auth** (it's on by default): Settings →
   Authentication → Providers → make sure **Email** is enabled.
7. **Turn off public sign-up**, since only admins create accounts:
   Authentication → Settings → toggle **"Allow new users to sign up"** OFF.

### Create your first admin account

Since there's no public sign-up, you make the very first account by hand:

1. Go to **Authentication → Users → Add user** → enter your email/password
   → check "Auto Confirm User".
2. Go to **Table Editor → profiles → Insert row** and add a row with:
   - `id`: the UUID of the user you just created (copy it from the Users page)
   - `name`: your name
   - `email`: same email
   - `role`: `admin`
3. Log into the site with that email/password — you'll land in the admin
   console. From here on, use the **Manage Users** page to create everyone
   else (see the Edge Function step below — required for that page to work).

### Enable admin-created user accounts (one-time setup)

The "Manage Users" page creates real login accounts for new users. Creating
accounts requires a secret key that must never sit in the browser, so it
runs through a small serverless function instead:

1. Install the Supabase CLI: `npm install -g supabase`
2. `supabase login`
3. `supabase link --project-ref YOUR-PROJECT-REF` (run from this folder)
4. `supabase functions deploy admin-create-user`

That's it — the "Create account" button on the Users page will now work.

---

## 3. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL, log in with your admin account.

---

## 4. Deploy for free (GitHub Pages)

1. Create a **public** GitHub repo and push this project to it.
2. In `vite.config.js`, change:
   ```js
   base: '/REPLACE_WITH_YOUR_REPO_NAME/',
   ```
   to your actual repo name, e.g. `base: '/niche-studio/'`.
3. In your GitHub repo: **Settings → Pages → Source → GitHub Actions**.
4. In your GitHub repo: **Settings → Secrets and variables → Actions →
   New repository secret** — add both:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Push to the `main` branch. The included workflow
   (`.github/workflows/deploy.yml`) builds and publishes automatically.
   Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

A second workflow (`.github/workflows/keep-alive.yml`) pings your Supabase
project every few days so the free tier doesn't auto-pause from inactivity.

---

## 5. Adjusting the UI

Everything themeable lives at the top of `src/index.css` in one `@theme`
block — colors, fonts. Change a hex value there and it updates everywhere
(buttons, cards, progress bars, sidebar). No need to hunt through components.

Structure, if you want to edit specific screens:

```
src/pages/Login.jsx                      Login screen
src/pages/Dashboard.jsx                  User "Watch" home
src/pages/NicheDetail.jsx                One niche's prompt/tips/video
src/pages/CourseViewer.jsx               Course lessons + progress
src/pages/admin/AdminDashboard.jsx       Admin overview
src/pages/admin/ManageNiches.jsx         Admin: niches CRUD
src/pages/admin/ManageTipsGuidelines.jsx Admin: tips/guidelines CRUD
src/pages/admin/ManageCourses.jsx        Admin: courses CRUD
src/pages/admin/ManageUsers.jsx          Admin: create/view users
```

Shared building blocks (buttons, cards, modals, the sidebar) are in
`src/components/` — edit one and every page using it updates.

---

## 6. Notes on how a few things work

- **Links in tips/guidelines/prompts are always plain text**, never
  clickable, by design (see `src/components/LinkSafeText.jsx`) — so users
  can't tap out to an external source from inside content.
- **Progress** is tracked per user per course in the `progress` table and
  drives the timeline-style progress bar on both the dashboard and the
  course viewer.
- **Video storage**: store your sample/lesson videos anywhere that gives you
  a direct URL (Cloudflare R2 is free and works well — see the original
  plan doc). Paste that URL into the niche/course forms in the admin console.
- There is no view-count/goal metric anywhere in this build — course
  progress is the only tracked metric.
