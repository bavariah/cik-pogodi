-- Scores are seasonal: keep one leaderboard row per user in each season.
-- Remove either form of the legacy user-only uniqueness before adding it.
alter table public.scores
  drop constraint if exists scores_user_id_key;

drop index if exists public.scores_user_id_key;

create unique index if not exists scores_user_season_unique_idx
  on public.scores (user_id, season)
  where user_id is not null;
