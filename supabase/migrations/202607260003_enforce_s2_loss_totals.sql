-- Keep the repaired S2 loss totals authoritative even when a player still has
-- an older browser tab open. Those clients can otherwise write weekly losses
-- back into scores as if they were additional daily losses.
--
-- daily_results was introduced after S2 began, so each existing player needs
-- a one-time baseline for daily losses that predate that log. From that point
-- forward, the result tables are the source of truth.
create table if not exists public.season_loss_baselines (
  user_id uuid not null references auth.users(id) on delete cascade,
  season text not null,
  legacy_daily_misses integer not null default 0 check (legacy_daily_misses >= 0),
  day_key_from text not null,
  day_key_to text not null,
  primary key (user_id, season)
);

alter table public.season_loss_baselines enable row level security;
revoke all on table public.season_loss_baselines from public, anon, authenticated;

insert into public.season_loss_baselines (
  user_id,
  season,
  legacy_daily_misses,
  day_key_from,
  day_key_to
)
values
  ('6062b593-4726-4ce0-9a4e-dab13e2d0db8'::uuid, '2026-S2', 0, '2026-07-01', '2027-01-01'),
  ('4b7b25b5-0d87-4044-8a34-d1febd70ac9b'::uuid, '2026-S2', 7, '2026-07-01', '2027-01-01'),
  ('e579a092-ae2b-4893-a298-707aa5e4c7d0'::uuid, '2026-S2', 1, '2026-07-01', '2027-01-01'),
  ('fa641fab-49d5-437c-ad91-47a919701ce5'::uuid, '2026-S2', 3, '2026-07-01', '2027-01-01'),
  ('101c7687-bb72-40b7-b507-f6834edb2d7c'::uuid, '2026-S2', 2, '2026-07-01', '2027-01-01'),
  ('e33c7b81-3f29-45dc-aeaf-569b6e51462e'::uuid, '2026-S2', 3, '2026-07-01', '2027-01-01'),
  ('3d247ef0-450e-4017-80d1-4590c92a0df0'::uuid, '2026-S2', 3, '2026-07-01', '2027-01-01'),
  ('db0c0fe1-0625-4cd4-b260-37f7f02d2486'::uuid, '2026-S2', 0, '2026-07-01', '2027-01-01'),
  ('a3d3169d-194d-4ef8-9b48-119dbc9c571e'::uuid, '2026-S2', 0, '2026-07-01', '2027-01-01'),
  ('f71d7d25-77e8-443e-b746-a81dfdc1375d'::uuid, '2026-S2', 0, '2026-07-01', '2027-01-01')
on conflict (user_id, season) do update set
  legacy_daily_misses = excluded.legacy_daily_misses,
  day_key_from = excluded.day_key_from,
  day_key_to = excluded.day_key_to;

create or replace function public.enforce_logged_score_misses()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  baseline public.season_loss_baselines%rowtype;
  daily_misses integer;
  weekly_misses integer;
begin
  select *
  into baseline
  from public.season_loss_baselines
  where user_id = new.user_id
    and season = new.season;

  if not found then
    return new;
  end if;

  select count(*)::integer
  into daily_misses
  from public.daily_results
  where user_id = new.user_id
    and day_key >= baseline.day_key_from
    and day_key < baseline.day_key_to
    and correct is false;

  select count(*)::integer
  into weekly_misses
  from public.weekly_results
  where user_id = new.user_id
    and week_key >= baseline.day_key_from
    and week_key < baseline.day_key_to
    and correct is false;

  new.misses := baseline.legacy_daily_misses
    + coalesce(daily_misses, 0)
    + coalesce(weekly_misses, 0);
  new.avg_score := case
    when coalesce(new.attempts, 0) + new.misses > 0 then
      round(
        coalesce(new.score, 0)::numeric /
        (coalesce(new.attempts, 0) + new.misses),
        2
      )
    else 0
  end;

  return new;
end;
$$;

drop trigger if exists enforce_logged_score_misses_trigger on public.scores;
create trigger enforce_logged_score_misses_trigger
before insert or update on public.scores
for each row execute function public.enforce_logged_score_misses();

create or replace function public.cap_logged_career_misses()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_misses integer := coalesce(new.misses, 0);
  score_misses integer;
begin
  if not exists (
    select 1
    from public.season_loss_baselines
    where user_id = new.user_id
  ) then
    return new;
  end if;

  select coalesce(sum(misses), 0)::integer
  into score_misses
  from public.scores
  where user_id = new.user_id;

  new.misses := least(claimed_misses, score_misses);
  new.total := greatest(
    coalesce(new.wins, 0) + new.misses,
    coalesce(new.total, 0) - greatest(claimed_misses - new.misses, 0)
  );

  return new;
end;
$$;

drop trigger if exists cap_logged_career_misses_trigger on public.career_stats;
create trigger cap_logged_career_misses_trigger
before insert or update on public.career_stats
for each row execute function public.cap_logged_career_misses();

-- Apply the canonical calculation immediately, including any stale write that
-- arrived after the one-time repair migrations ran.
update public.scores
set misses = misses
where season = '2026-S2'
  and exists (
    select 1
    from public.season_loss_baselines baseline
    where baseline.user_id = scores.user_id
      and baseline.season = scores.season
  );

update public.career_stats
set misses = misses
where exists (
  select 1
  from public.season_loss_baselines baseline
  where baseline.user_id = career_stats.user_id
);

revoke all on function public.enforce_logged_score_misses() from public, anon, authenticated;
revoke all on function public.cap_logged_career_misses() from public, anon, authenticated;
