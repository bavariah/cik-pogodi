-- Store only aggregate rejected guesses so missing dictionary words can be reviewed.
-- No username, user id, IP address, or individual event history is retained.
create table if not exists public.rejected_guesses (
  guess text primary key,
  attempt_count bigint not null default 1 check (attempt_count > 0),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  constraint rejected_guesses_normalized_check check (guess = lower(btrim(guess))),
  constraint rejected_guesses_six_letters_check check (char_length(guess) = 6)
);

alter table public.rejected_guesses enable row level security;
revoke all on table public.rejected_guesses from anon, authenticated;

-- Seed the review queue from historical submissions that are absent from the
-- current accepted dictionary. This keeps only aggregate word-level data.
insert into public.rejected_guesses (guess, attempt_count, first_seen, last_seen)
select
  lower(btrim(submissions.guess)) as guess,
  count(*) as attempt_count,
  coalesce(min(submissions.played_at), now()) as first_seen,
  coalesce(max(submissions.played_at), now()) as last_seen
from public.submissions
where char_length(lower(btrim(submissions.guess))) = 6
  and lower(btrim(submissions.guess)) ~ '^[абвгдђежзијклљмнњопрстћуфхцчџш]+$'
  and not exists (
    select 1
    from public.accepted_words
    where accepted_words.word = lower(btrim(submissions.guess))
  )
group by lower(btrim(submissions.guess))
on conflict (guess) do nothing;

create or replace function public.record_rejected_guess(p_guess text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_guess text := lower(btrim(p_guess));
begin
  if char_length(normalized_guess) <> 6
     or normalized_guess !~ '^[абвгдђежзијклљмнњопрстћуфхцчџш]+$' then
    return;
  end if;

  if exists (
    select 1 from public.accepted_words where word = normalized_guess
  ) then
    return;
  end if;

  insert into public.rejected_guesses (guess)
  values (normalized_guess)
  on conflict (guess) do update
    set attempt_count = public.rejected_guesses.attempt_count + 1,
        last_seen = now();
end;
$$;

revoke all on function public.record_rejected_guess(text) from public;
grant execute on function public.record_rejected_guess(text) to anon, authenticated;
