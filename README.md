# Kryll

A minimalist gym tracking PWA. React + Vite + Tailwind, with Supabase for auth and storage. Deployed to GitHub Pages.

## How the pieces fit

- **GitHub Pages** serves the static app (HTML/CSS/JS bundle).
- **Supabase** stores users and their workout/session data. Row-Level Security (RLS) makes sure each user can only read and write their own rows.
- The browser holds nothing sensitive — even if someone steals the bundled `VITE_SUPABASE_KEY`, RLS prevents access to other users' data.

## One-time setup

### 1. Supabase

1. Open your project at [supabase.com](https://supabase.com) → SQL Editor → New query.
2. Paste the contents of [`supabase-schema.sql`](supabase-schema.sql) and run it.
3. (Optional, recommended for personal/dev use) Authentication → Providers → Email → toggle off "Confirm email" so signups don't require clicking a confirmation link.

### 2. Local `.env`

Copy `.env.example` to `.env` and fill in your project URL + publishable/anon key (Supabase → Project Settings → API).

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_KEY=<your-publishable-or-anon-key>
```

### 3. GitHub repo secrets (for deploy)

In the repo on GitHub: Settings → Secrets and variables → Actions → New repository secret. Add the same two names:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`

The GitHub Actions workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) reads these at build time.

### 4. Enable GitHub Pages

Repo → Settings → Pages → "Build and deployment" → Source: **GitHub Actions**.

After the next push to `main`, the workflow will build and publish. Your site will be at:

```
https://risstobias.github.io/Kryll---The-only-thing-you-need-at-the-gym/
```

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project layout

- [src/supabase.js](src/supabase.js) — Supabase client.
- [src/auth.jsx](src/auth.jsx) — `AuthProvider` + `useAuth` hook.
- [src/data.js](src/data.js) — All cloud reads/writes for workouts, sessions, settings.
- [src/components/AuthScreen.jsx](src/components/AuthScreen.jsx) — Sign-in / sign-up / password reset UI.
- [src/components/WorkoutView.jsx](src/components/WorkoutView.jsx) — Active-workout screen.
- [src/components/Settings.jsx](src/components/Settings.jsx) — Workout editor + sign-out.
- [src/components/ProgressView.jsx](src/components/ProgressView.jsx) — Progress charts + XML export.
