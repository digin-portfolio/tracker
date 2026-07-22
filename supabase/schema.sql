-- Run this once in Supabase Dashboard → SQL Editor.
-- Each signed-in user can only read and update their own app data.

create table if not exists public.tracker_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tracker_data enable row level security;

create policy "Users can read their own tracker data"
  on public.tracker_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tracker data"
  on public.tracker_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tracker data"
  on public.tracker_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
