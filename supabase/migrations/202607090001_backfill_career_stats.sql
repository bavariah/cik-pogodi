-- Rebuild durable career stats from the historical data we still have.
-- This is intentionally conservative: never shrink existing career_stats,
-- and use submissions as a fallback source for solved-row distribution.
with score_aggregate as (
  select
    user_id,
    coalesce(sum(attempts), 0)::int as wins,
    coalesce(sum(misses), 0)::int as misses,
    coalesce(sum(coalesce((distribution->>0)::int, 0)), 0)::int as d1,
    coalesce(sum(coalesce((distribution->>1)::int, 0)), 0)::int as d2,
    coalesce(sum(coalesce((distribution->>2)::int, 0)), 0)::int as d3,
    coalesce(sum(coalesce((distribution->>3)::int, 0)), 0)::int as d4,
    coalesce(sum(coalesce((distribution->>4)::int, 0)), 0)::int as d5,
    coalesce(sum(coalesce((distribution->>5)::int, 0)), 0)::int as d6,
    coalesce(sum(coalesce((distribution->>6)::int, 0)), 0)::int as d7,
    coalesce(max(max_streak), 0)::int as max_streak
  from public.scores
  where user_id is not null
  group by user_id
),
latest_score as (
  select distinct on (user_id)
    user_id,
    coalesce(current_streak, 0)::int as current_streak
  from public.scores
  where user_id is not null
  order by user_id, season desc nulls last, created_at desc nulls last
),
submission_games as (
  select
    user_id,
    word,
    min(attempt)::int as attempt
  from public.submissions
  where user_id is not null
    and correct is true
    and attempt between 1 and 7
  group by user_id, word
),
submission_aggregate as (
  select
    user_id,
    count(*)::int as wins,
    count(*) filter (where attempt = 1)::int as d1,
    count(*) filter (where attempt = 2)::int as d2,
    count(*) filter (where attempt = 3)::int as d3,
    count(*) filter (where attempt = 4)::int as d4,
    count(*) filter (where attempt = 5)::int as d5,
    count(*) filter (where attempt = 6)::int as d6,
    count(*) filter (where attempt = 7)::int as d7
  from submission_games
  group by user_id
),
existing_career as (
  select
    user_id,
    total,
    wins,
    misses,
    coalesce((distribution->>0)::int, 0) as d1,
    coalesce((distribution->>1)::int, 0) as d2,
    coalesce((distribution->>2)::int, 0) as d3,
    coalesce((distribution->>3)::int, 0) as d4,
    coalesce((distribution->>4)::int, 0) as d5,
    coalesce((distribution->>5)::int, 0) as d6,
    coalesce((distribution->>6)::int, 0) as d7,
    current_streak,
    max_streak
  from public.career_stats
),
all_users as (
  select user_id from score_aggregate
  union
  select user_id from submission_aggregate
  union
  select user_id from existing_career
),
merged_base as (
  select
    u.user_id,
    greatest(coalesce(sc.d1, 0), coalesce(sa.d1, 0), coalesce(ec.d1, 0)) as d1,
    greatest(coalesce(sc.d2, 0), coalesce(sa.d2, 0), coalesce(ec.d2, 0)) as d2,
    greatest(coalesce(sc.d3, 0), coalesce(sa.d3, 0), coalesce(ec.d3, 0)) as d3,
    greatest(coalesce(sc.d4, 0), coalesce(sa.d4, 0), coalesce(ec.d4, 0)) as d4,
    greatest(coalesce(sc.d5, 0), coalesce(sa.d5, 0), coalesce(ec.d5, 0)) as d5,
    greatest(coalesce(sc.d6, 0), coalesce(sa.d6, 0), coalesce(ec.d6, 0)) as d6,
    greatest(coalesce(sc.d7, 0), coalesce(sa.d7, 0), coalesce(ec.d7, 0)) as d7,
    greatest(coalesce(sc.wins, 0), coalesce(sa.wins, 0), coalesce(ec.wins, 0)) as known_wins,
    greatest(coalesce(sc.misses, 0), coalesce(ec.misses, 0)) as misses,
    greatest(coalesce(ls.current_streak, 0), coalesce(ec.current_streak, 0)) as current_streak,
    greatest(coalesce(sc.max_streak, 0), coalesce(ec.max_streak, 0)) as max_streak,
    greatest(coalesce(sc.wins, 0) + coalesce(sc.misses, 0), coalesce(ec.total, 0)) as known_total
  from all_users u
  left join score_aggregate sc on sc.user_id = u.user_id
  left join latest_score ls on ls.user_id = u.user_id
  left join submission_aggregate sa on sa.user_id = u.user_id
  left join existing_career ec on ec.user_id = u.user_id
),
final_rows as (
  select
    user_id,
    greatest(known_wins, d1 + d2 + d3 + d4 + d5 + d6 + d7) as wins,
    jsonb_build_array(d1, d2, d3, d4, d5, d6, d7) as distribution,
    misses,
    current_streak,
    max_streak,
    known_total
  from merged_base
)
insert into public.career_stats (
  user_id,
  total,
  wins,
  distribution,
  misses,
  current_streak,
  max_streak,
  updated_at
)
select
  user_id,
  greatest(known_total, wins + misses) as total,
  wins,
  distribution,
  misses,
  current_streak,
  max_streak,
  now()
from final_rows
where user_id is not null
on conflict (user_id) do update set
  total = greatest(
    public.career_stats.total,
    excluded.total,
    greatest(
      public.career_stats.wins,
      excluded.wins,
      greatest(coalesce((public.career_stats.distribution->>0)::int, 0), coalesce((excluded.distribution->>0)::int, 0)) +
      greatest(coalesce((public.career_stats.distribution->>1)::int, 0), coalesce((excluded.distribution->>1)::int, 0)) +
      greatest(coalesce((public.career_stats.distribution->>2)::int, 0), coalesce((excluded.distribution->>2)::int, 0)) +
      greatest(coalesce((public.career_stats.distribution->>3)::int, 0), coalesce((excluded.distribution->>3)::int, 0)) +
      greatest(coalesce((public.career_stats.distribution->>4)::int, 0), coalesce((excluded.distribution->>4)::int, 0)) +
      greatest(coalesce((public.career_stats.distribution->>5)::int, 0), coalesce((excluded.distribution->>5)::int, 0)) +
      greatest(coalesce((public.career_stats.distribution->>6)::int, 0), coalesce((excluded.distribution->>6)::int, 0))
    ) + greatest(public.career_stats.misses, excluded.misses)
  ),
  wins = greatest(
    public.career_stats.wins,
    excluded.wins,
    greatest(coalesce((public.career_stats.distribution->>0)::int, 0), coalesce((excluded.distribution->>0)::int, 0)) +
    greatest(coalesce((public.career_stats.distribution->>1)::int, 0), coalesce((excluded.distribution->>1)::int, 0)) +
    greatest(coalesce((public.career_stats.distribution->>2)::int, 0), coalesce((excluded.distribution->>2)::int, 0)) +
    greatest(coalesce((public.career_stats.distribution->>3)::int, 0), coalesce((excluded.distribution->>3)::int, 0)) +
    greatest(coalesce((public.career_stats.distribution->>4)::int, 0), coalesce((excluded.distribution->>4)::int, 0)) +
    greatest(coalesce((public.career_stats.distribution->>5)::int, 0), coalesce((excluded.distribution->>5)::int, 0)) +
    greatest(coalesce((public.career_stats.distribution->>6)::int, 0), coalesce((excluded.distribution->>6)::int, 0))
  ),
  distribution = jsonb_build_array(
    greatest(coalesce((public.career_stats.distribution->>0)::int, 0), coalesce((excluded.distribution->>0)::int, 0)),
    greatest(coalesce((public.career_stats.distribution->>1)::int, 0), coalesce((excluded.distribution->>1)::int, 0)),
    greatest(coalesce((public.career_stats.distribution->>2)::int, 0), coalesce((excluded.distribution->>2)::int, 0)),
    greatest(coalesce((public.career_stats.distribution->>3)::int, 0), coalesce((excluded.distribution->>3)::int, 0)),
    greatest(coalesce((public.career_stats.distribution->>4)::int, 0), coalesce((excluded.distribution->>4)::int, 0)),
    greatest(coalesce((public.career_stats.distribution->>5)::int, 0), coalesce((excluded.distribution->>5)::int, 0)),
    greatest(coalesce((public.career_stats.distribution->>6)::int, 0), coalesce((excluded.distribution->>6)::int, 0))
  ),
  misses = greatest(public.career_stats.misses, excluded.misses),
  current_streak = greatest(public.career_stats.current_streak, excluded.current_streak),
  max_streak = greatest(public.career_stats.max_streak, excluded.max_streak),
  updated_at = now();
