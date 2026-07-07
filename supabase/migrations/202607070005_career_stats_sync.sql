-- A user-owned career snapshot makes statistics consistent across browsers.
-- The most complete trusted browser can seed this once, then every device uses it.
create table if not exists public.career_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total integer not null default 0 check (total >= 0),
  wins integer not null default 0 check (wins >= 0),
  distribution jsonb not null default '[0,0,0,0,0,0,0]'::jsonb,
  misses integer not null default 0 check (misses >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  max_streak integer not null default 0 check (max_streak >= 0),
  updated_at timestamptz not null default now(),
  constraint career_stats_totals_check check (wins <= total),
  constraint career_stats_distribution_check check (
    jsonb_typeof(distribution) = 'array' and jsonb_array_length(distribution) = 7
  )
);

alter table public.career_stats enable row level security;

drop policy if exists "Users can read their career stats" on public.career_stats;
create policy "Users can read their career stats"
  on public.career_stats for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their career stats" on public.career_stats;
create policy "Users can insert their career stats"
  on public.career_stats for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their career stats" on public.career_stats;
create policy "Users can update their career stats"
  on public.career_stats for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.career_stats to authenticated;
