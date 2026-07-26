-- Correct two S2 legacy-loss baselines that exceed the number of daily game
-- windows available before daily_results became authoritative on 2026-07-12.
--
-- DraganaM and Goca T. each have 10 verified pre-log daily wins. Only eleven
-- daily windows existed from July 1 through July 11, so at most one additional
-- pre-log loss is possible for either player. Points and solved-row
-- distribution remain unchanged.
update public.season_loss_baselines
set legacy_daily_misses = 1
where season = '2026-S2'
  and user_id in (
    '4b7b25b5-0d87-4044-8a34-d1febd70ac9b'::uuid,
    'fa641fab-49d5-437c-ad91-47a919701ce5'::uuid
  );

-- The existing score trigger rebuilds misses from the corrected baseline plus
-- logged daily and weekly losses, then recalculates the average. Score,
-- attempts, and daily distribution are deliberately untouched.
update public.scores
set misses = misses
where season = '2026-S2'
  and user_id in (
    '4b7b25b5-0d87-4044-8a34-d1febd70ac9b'::uuid,
    'fa641fab-49d5-437c-ad91-47a919701ce5'::uuid
  );

-- Remove the same unsupported losses from durable career totals. The existing
-- career trigger caps misses at the corrected sum of seasonal score rows.
update public.career_stats
set misses = misses
where user_id in (
  '4b7b25b5-0d87-4044-8a34-d1febd70ac9b'::uuid,
  'fa641fab-49d5-437c-ad91-47a919701ce5'::uuid
);
