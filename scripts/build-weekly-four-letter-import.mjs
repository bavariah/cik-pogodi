import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ACCEPTED_CSV = path.join(ROOT, "output", "words", "serbian-four-letter-candidates-review.csv");
const ANSWERS_CSV = path.join(ROOT, "output", "words", "serbian-four-letter-suggested-weekly-answers.csv");
const OUT_SQL = path.join(ROOT, "supabase", "migrations", "202607100001_weekly_four_letter_challenge.sql");

function readWords(file) {
  const rows = fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1);
  return [...new Set(rows
    .map(line => line.split(",")[0]?.trim().toLowerCase())
    .filter(word => /^[абвгдђежзијклљмнњопрстћуфхцчџш]{4}$/.test(word))
  )].sort((a, b) => a.localeCompare(b, "sr"));
}

function readAnswers(file) {
  const rows = fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1);
  return rows
    .map((line, index) => {
      const cols = line.split(",");
      return {
        word: cols[0]?.trim().toLowerCase(),
        sortOrder: Number(cols[cols.length - 1]) || index + 1
      };
    })
    .filter(row => /^[абвгдђежзијклљмнњопрстћуфхцчџш]{4}$/.test(row.word))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function valuesLines(rows, mapper) {
  return rows.map((row, index) => `  (${mapper(row)})${index === rows.length - 1 ? "" : ","}`).join("\n");
}

const acceptedWords = readWords(ACCEPTED_CSV);
const answerWords = readAnswers(ANSWERS_CSV);

const sql = `-- Weekly 4-letter Saturday challenge.
-- Correct weekly answers come from the reviewed 4-letter list.
-- Accepted guesses come from the full extracted 4-letter dictionary candidate list.

create table if not exists public.weekly_words (
  word text primary key,
  sort_order integer not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint weekly_words_normalized_check check (word = lower(btrim(word))),
  constraint weekly_words_four_letters_check check (char_length(word) = 4)
);

create table if not exists public.weekly_accepted_words (
  word text primary key,
  created_at timestamptz not null default now(),
  constraint weekly_accepted_words_normalized_check check (word = lower(btrim(word))),
  constraint weekly_accepted_words_four_letters_check check (char_length(word) = 4)
);

create table if not exists public.weekly_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  username text not null default 'anon',
  week_key text not null,
  word text not null references public.weekly_words(word),
  guess text not null,
  attempt integer not null check (attempt between 1 and 5),
  correct boolean not null default false,
  points integer not null default 0 check (points >= 0),
  played_at timestamptz not null default now(),
  constraint weekly_results_week_key_check check (week_key ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  constraint weekly_results_word_four_letters_check check (char_length(word) = 4),
  constraint weekly_results_guess_four_letters_check check (char_length(guess) = 4)
);

create unique index if not exists weekly_results_user_week_unique_idx
  on public.weekly_results (user_id, week_key)
  where user_id is not null;

create index if not exists weekly_results_week_correct_idx
  on public.weekly_results (week_key, correct, played_at);

alter table public.weekly_words enable row level security;
alter table public.weekly_accepted_words enable row level security;
alter table public.weekly_results enable row level security;

drop policy if exists "Weekly words are publicly readable" on public.weekly_words;
create policy "Weekly words are publicly readable"
  on public.weekly_words for select to anon, authenticated
  using (true);

drop policy if exists "Weekly accepted words are publicly readable" on public.weekly_accepted_words;
create policy "Weekly accepted words are publicly readable"
  on public.weekly_accepted_words for select to anon, authenticated
  using (true);

drop policy if exists "Weekly results are publicly readable" on public.weekly_results;
create policy "Weekly results are publicly readable"
  on public.weekly_results for select to anon, authenticated
  using (true);

drop policy if exists "Weekly results can be inserted by players" on public.weekly_results;
create policy "Weekly results can be inserted by players"
  on public.weekly_results for insert to anon, authenticated
  with check (user_id is null or (select auth.uid()) = user_id);

grant select on table public.weekly_words to anon, authenticated;
grant select on table public.weekly_accepted_words to anon, authenticated;
grant select, insert on table public.weekly_results to anon, authenticated;

insert into public.weekly_accepted_words (word) values
${valuesLines(acceptedWords, word => sqlString(word))}
on conflict (word) do nothing;

update public.weekly_words
  set sort_order = sort_order + 10000
  where word in (${answerWords.map(row => sqlString(row.word)).join(", ")});

insert into public.weekly_words (word, sort_order) values
${valuesLines(answerWords, row => `${sqlString(row.word)}, ${row.sortOrder}`)}
on conflict (word) do update
  set sort_order = excluded.sort_order,
      active = true;

insert into public.weekly_accepted_words (word)
select word from public.weekly_words
on conflict (word) do nothing;

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
  existing_points integer;
begin
  if p_week_key !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
     or p_attempt not between 1 and 5
     or char_length(normalized_word) <> 4
     or char_length(normalized_guess) <> 4 then
    raise exception 'Invalid weekly result payload';
  end if;

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

  if current_user_id is not null and coalesce(p_correct, false) and clean_points > 0 then
    update public.scores
      set score = coalesce(score, 0) + clean_points,
          username = left(clean_username, 40)
      where user_id = current_user_id and season = p_season;

    if not found then
      begin
        insert into public.scores (user_id, username, score, attempts, avg_score, season)
        values (current_user_id, left(clean_username, 40), clean_points, 0, 0, p_season);
      exception when unique_violation then
        update public.scores
          set score = coalesce(score, 0) + clean_points,
              username = left(clean_username, 40)
          where user_id = current_user_id and season = p_season;
      end;
    end if;
  end if;

  inserted := true;
  points_awarded := case when coalesce(p_correct, false) then clean_points else 0 end;
  return next;
end;
$$;

revoke all on function public.record_weekly_challenge_result(text, text, text, integer, boolean, integer, text, text) from public;
grant execute on function public.record_weekly_challenge_result(text, text, text, integer, boolean, integer, text, text) to anon, authenticated;
`;

fs.writeFileSync(OUT_SQL, sql, "utf8");
console.log(`Wrote ${OUT_SQL}`);
console.log(`Accepted weekly guesses: ${acceptedWords.length}`);
console.log(`Weekly answers: ${answerWords.length}`);
