# Serbian 6-Letter Words Import

## Recommended Import

Use:

`output/words/serbian-six-letter-words-import-merged-with-existing.csv`

This file contains existing Supabase words plus the approved new words, deduped, with continuous `sort_order`.

Current generated state:

- Existing live words checked: 366
- Approved extracted words: 2463
- Existing duplicates found: 59
- Merged total: 2770

## Supabase Prep

Run `supabase/words-import-setup.sql` in Supabase SQL Editor.

It adds:

- `sort_order integer`
- unique index on `word`
- unique index on non-null `sort_order`

## Import Safest Path

1. Export/backup the current `words` table from Supabase.
2. Run the SQL setup.
3. In Supabase Table Editor, clear/truncate `public.words`.
4. Import `serbian-six-letter-words-import-merged-with-existing.csv`.
5. Confirm row count is 2770.
6. Run duplicate checks from the comments in `supabase/words-import-setup.sql`.

## Hints

Before final import, fill blanks in:

`output/words/serbian-six-letter-words-import-merged-needs-hints.csv`

Then rebuild or copy the filled hints into:

`output/words/serbian-six-letter-words-import-merged-with-existing.csv`

## Code Behavior

- Daily target is selected by `sort_order`, not random at runtime.
- `sort_order` is shuffled once in the CSV so the sequence is stable but not alphabetical.
- Submitted guesses are accepted only if the guessed word exists in `public.words.word`.
- Only the daily target word counts as correct.
