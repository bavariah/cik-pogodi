-- Support the daily solve count, yesterday's winner, and per-user daily lock.
create index if not exists submissions_word_correct_played_at_idx
  on public.submissions (word, correct, played_at);

create index if not exists submissions_user_word_played_at_idx
  on public.submissions (user_id, word, played_at)
  where user_id is not null;
