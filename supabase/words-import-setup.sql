-- Run this in Supabase SQL Editor before importing the merged words CSV.
-- It adds deterministic daily ordering and protects against duplicate words/orders.

alter table public.words
  add column if not exists sort_order integer;

-- Keep one row per word. If this fails, the table already has duplicates that
-- need to be cleaned before import.
create unique index if not exists words_word_unique_idx
  on public.words (word);

-- Every active word should have one daily position after import.
create unique index if not exists words_sort_order_unique_idx
  on public.words (sort_order)
  where sort_order is not null;

-- Optional check after importing:
-- select count(*) as total_words from public.words;
-- select word, count(*) from public.words group by word having count(*) > 1;
-- select sort_order, count(*) from public.words group by sort_order having count(*) > 1;
-- select * from public.words where length(word) <> 6;
