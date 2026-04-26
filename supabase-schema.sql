-- Kryll database schema.
-- Paste this into the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Safe to re-run: every step is idempotent.

-- Tables ──────────────────────────────────────────────────────────────────────

create table if not exists public.workouts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled',
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts(user_id);

create table if not exists public.sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid,
  workout_name text,
  date date not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_user_date_idx on public.sessions(user_id, date);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_workout_id uuid,
  theme text not null default 'dark',
  updated_at timestamptz not null default now()
);

-- Row-level security ──────────────────────────────────────────────────────────
-- RLS is what makes this secure: with the publishable key, the only way a row
-- can be read or written is if its user_id matches the logged-in user.

alter table public.workouts      enable row level security;
alter table public.sessions      enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "users_own_workouts"      on public.workouts;
drop policy if exists "users_own_sessions"      on public.sessions;
drop policy if exists "users_own_user_settings" on public.user_settings;

create policy "users_own_workouts"
  on public.workouts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_own_sessions"
  on public.sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_own_user_settings"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
