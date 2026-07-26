-- Remove the same known phantom losses from durable career snapshots without
-- ever reducing career misses below the corrected sum of seasonal score rows.
with repair (user_id, max_phantom_misses) as (
  values
    ('4b7b25b5-0d87-4044-8a34-d1febd70ac9b'::uuid, 16),
    ('fa641fab-49d5-437c-ad91-47a919701ce5'::uuid, 5),
    ('e33c7b81-3f29-45dc-aeaf-569b6e51462e'::uuid, 6)
),
score_totals as (
  select
    scores.user_id,
    coalesce(sum(scores.misses), 0)::integer as misses
  from public.scores
  join repair on repair.user_id = scores.user_id
  group by scores.user_id
),
correction as (
  select
    career.user_id,
    least(
      repair.max_phantom_misses,
      greatest(0, career.misses - score_totals.misses)
    )::integer as removed_misses
  from public.career_stats career
  join repair on repair.user_id = career.user_id
  join score_totals on score_totals.user_id = career.user_id
)
update public.career_stats career
set
  misses = career.misses - correction.removed_misses,
  total = greatest(
    career.wins + career.misses - correction.removed_misses,
    career.total - correction.removed_misses
  ),
  updated_at = now()
from correction
where career.user_id = correction.user_id
  and correction.removed_misses > 0;
