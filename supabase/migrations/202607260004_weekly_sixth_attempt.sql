-- Add a sixth attempt worth 2 points to the four-letter weekly challenge.
-- Daily five- and six-letter modes remain unchanged.

alter table public.weekly_results
  drop constraint if exists weekly_results_attempt_check;

alter table public.weekly_results
  add constraint weekly_results_attempt_check
  check (attempt between 1 and 6);

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
  clean_points integer;
  result_season text;
  existing_points integer;
begin
  if p_week_key !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
     or p_attempt not between 1 and 6
     or char_length(normalized_word) <> 4
     or char_length(normalized_guess) <> 4 then
    raise exception 'Invalid weekly result payload';
  end if;

  -- Award the fixed server-side score for the recorded attempt. Do not trust
  -- a client-provided points value.
  clean_points := case p_attempt
    when 1 then 20
    when 2 then 15
    when 3 then 12
    when 4 then 10
    when 5 then 4
    when 6 then 2
    else 0
  end;

  -- Derive the season from the challenge week instead of trusting the client.
  result_season := extract(year from p_week_key::date)::integer::text || '-' ||
    case when extract(month from p_week_key::date) <= 6 then 'S1' else 'S2' end;

  if not exists (
    select 1
    from public.weekly_words
    where word = normalized_word
      and active is true
  ) then
    raise exception 'Unknown weekly word';
  end if;

  if not exists (
    select 1
    from public.weekly_accepted_words
    where word = normalized_guess
  ) then
    raise exception 'Unknown weekly guess';
  end if;

  if current_user_id is not null then
    select points
    into existing_points
    from public.weekly_results
    where user_id = current_user_id
      and week_key = p_week_key
    limit 1;

    if found then
      inserted := false;
      points_awarded := coalesce(existing_points, 0);
      return next;
      return;
    end if;
  end if;

  insert into public.weekly_results (
    user_id,
    username,
    week_key,
    word,
    guess,
    attempt,
    correct,
    points
  )
  values (
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
      user_id,
      username,
      score,
      attempts,
      misses,
      avg_score,
      season
    )
    values (
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
  points_awarded := case
    when coalesce(p_correct, false) then clean_points
    else 0
  end;
  return next;
end;
$$;

revoke all on function public.record_weekly_challenge_result(
  text,
  text,
  text,
  integer,
  boolean,
  integer,
  text,
  text
) from public;

grant execute on function public.record_weekly_challenge_result(
  text,
  text,
  text,
  integer,
  boolean,
  integer,
  text,
  text
) to anon, authenticated;
