-- Count weekly challenges in seasonal games and average, while leaving the
-- daily row distribution unchanged.

create or replace function public.record_weekly_challenge_result(
  p_week_key text,
  p_word text,
  p_guess text,
  p_attempt integer,
  p_correct boolean,
  p_points integer,
  p_username text,
  p_season text
)
returns table(inserted boolean, points_awarded integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_word text := lower(btrim(p_word));
  normalized_guess text := lower(btrim(p_guess));
  clean_username text := coalesce(nullif(btrim(p_username), ''), 'anon');
  clean_points integer := greatest(coalesce(p_points, 0), 0);
  result_season text;
  existing_points integer;
begin
  if p_week_key !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
     or p_attempt not between 1 and 5
     or char_length(normalized_word) <> 4
     or char_length(normalized_guess) <> 4 then
    raise exception 'Invalid weekly result payload';
  end if;

  -- Derive the season from the challenge week instead of trusting the client.
  result_season := extract(year from p_week_key::date)::integer::text || '-' ||
    case when extract(month from p_week_key::date) <= 6 then 'S1' else 'S2' end;

  if not exists (select 1 from public.weekly_words where word = normalized_word and active is true) then
    raise exception 'Unknown weekly word';
  end if;

  if not exists (select 1 from public.weekly_accepted_words where word = normalized_guess) then
    raise exception 'Unknown weekly guess';
  end if;

  if current_user_id is not null then
    select points into existing_points
    from public.weekly_results
    where user_id = current_user_id and week_key = p_week_key
    limit 1;

    if found then
      inserted := false;
      points_awarded := coalesce(existing_points, 0);
      return next;
      return;
    end if;
  end if;

  insert into public.weekly_results (
    user_id, username, week_key, word, guess, attempt, correct, points
  ) values (
    current_user_id,
    left(clean_username, 40),
    p_week_key,
    normalized_word,
    normalized_guess,
    p_attempt,
    coalesce(p_correct, false),
    case when coalesce(p_correct, false) then clean_points else 0 end
  );

  if current_user_id is not null then
    insert into public.scores (
      user_id, username, score, attempts, misses, avg_score, season
    ) values (
      current_user_id,
      left(clean_username, 40),
      case when coalesce(p_correct, false) then clean_points else 0 end,
      case when coalesce(p_correct, false) then 1 else 0 end,
      case when coalesce(p_correct, false) then 0 else 1 end,
      case when coalesce(p_correct, false) then clean_points else 0 end,
      result_season
    )
    on conflict (user_id, season) where user_id is not null
    do update set
      username = excluded.username,
      score = coalesce(public.scores.score, 0) + excluded.score,
      attempts = coalesce(public.scores.attempts, 0) + excluded.attempts,
      misses = coalesce(public.scores.misses, 0) + excluded.misses,
      avg_score = round(
        (coalesce(public.scores.score, 0) + excluded.score)::numeric /
        nullif(
          coalesce(public.scores.attempts, 0) + excluded.attempts +
          coalesce(public.scores.misses, 0) + excluded.misses,
          0
        ),
        2
      );
  end if;

  inserted := true;
  points_awarded := case when coalesce(p_correct, false) then clean_points else 0 end;
  return next;
end;
$$;

revoke all on function public.record_weekly_challenge_result(text, text, text, integer, boolean, integer, text, text) from public;
grant execute on function public.record_weekly_challenge_result(text, text, text, integer, boolean, integer, text, text) to anon, authenticated;

-- Existing weekly wins already contributed their points through the previous
-- function. Create only genuinely missing score rows, then add game counts once.
with weekly_aggregate as (
  select
    user_id,
    extract(year from week_key::date)::integer::text || '-' ||
      case when extract(month from week_key::date) <= 6 then 'S1' else 'S2' end as season,
    (array_agg(username order by played_at desc))[1] as username,
    count(*) filter (where correct)::integer as weekly_wins,
    count(*) filter (where not correct)::integer as weekly_losses,
    coalesce(sum(points), 0)::integer as weekly_points
  from public.weekly_results
  where user_id is not null
  group by user_id, 2
)
insert into public.scores (user_id, username, score, attempts, misses, avg_score, season)
select
  weekly.user_id,
  left(coalesce(nullif(btrim(weekly.username), ''), 'anon'), 40),
  weekly.weekly_points,
  0,
  0,
  0,
  weekly.season
from weekly_aggregate weekly
where not exists (
  select 1
  from public.scores score_row
  where score_row.user_id = weekly.user_id
    and score_row.season = weekly.season
);

with weekly_aggregate as (
  select
    user_id,
    extract(year from week_key::date)::integer::text || '-' ||
      case when extract(month from week_key::date) <= 6 then 'S1' else 'S2' end as season,
    count(*) filter (where correct)::integer as weekly_wins,
    count(*) filter (where not correct)::integer as weekly_losses
  from public.weekly_results
  where user_id is not null
  group by user_id, 2
)
update public.scores score_row
set
  attempts = coalesce(score_row.attempts, 0) + weekly.weekly_wins,
  misses = coalesce(score_row.misses, 0) + weekly.weekly_losses
from weekly_aggregate weekly
where score_row.user_id = weekly.user_id
  and score_row.season = weekly.season;

-- Average is points per game across daily and weekly games.
update public.scores
set avg_score = case
  when coalesce(attempts, 0) + coalesce(misses, 0) > 0 then
    round(coalesce(score, 0)::numeric / (coalesce(attempts, 0) + coalesce(misses, 0)), 2)
  else 0
end;
