-- Run this once in Supabase SQL Editor before the July season reset.
-- It enforces one leaderboard row per logged-in player per season.

-- Check this first. If it returns rows, merge/delete duplicates before creating the index.
-- select user_id, season, count(*)
-- from public.scores
-- where user_id is not null
-- group by user_id, season
-- having count(*) > 1;

create unique index if not exists scores_user_season_unique_idx
  on public.scores (user_id, season)
  where user_id is not null;
--
-- select season, count(*) as players
-- from public.scores
-- where score > 0
-- group by season
-- order by season desc;
