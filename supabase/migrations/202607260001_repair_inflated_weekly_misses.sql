-- Repair S2 losses inflated when total server misses were hydrated into the
-- browser as daily-only misses and weekly losses were added again on sync.
--
-- The baseline below is the verified live snapshot from 2026-07-24. New daily
-- and weekly losses after that snapshot are counted from their result logs so
-- the repair remains correct if another result arrives before deployment.
with verified_baseline (user_id, baseline_misses) as (
  values
    ('6062b593-4726-4ce0-9a4e-dab13e2d0db8'::uuid, 1),
    ('4b7b25b5-0d87-4044-8a34-d1febd70ac9b'::uuid, 10),
    ('e579a092-ae2b-4893-a298-707aa5e4c7d0'::uuid, 1),
    ('fa641fab-49d5-437c-ad91-47a919701ce5'::uuid, 5),
    ('101c7687-bb72-40b7-b507-f6834edb2d7c'::uuid, 2),
    ('e33c7b81-3f29-45dc-aeaf-569b6e51462e'::uuid, 3),
    ('3d247ef0-450e-4017-80d1-4590c92a0df0'::uuid, 4),
    ('db0c0fe1-0625-4cd4-b260-37f7f02d2486'::uuid, 0),
    ('a3d3169d-194d-4ef8-9b48-119dbc9c571e'::uuid, 0),
    ('f71d7d25-77e8-443e-b746-a81dfdc1375d'::uuid, 0)
),
new_daily_losses as (
  select user_id, count(*)::integer as losses
  from public.daily_results
  where user_id is not null
    and day_key >= '2026-07-24'
    and correct is false
  group by user_id
),
new_weekly_losses as (
  select user_id, count(*)::integer as losses
  from public.weekly_results
  where user_id is not null
    and week_key >= '2026-07-25'
    and correct is false
  group by user_id
),
corrected as (
  select
    baseline.user_id,
    baseline.baseline_misses
      + coalesce(daily.losses, 0)
      + coalesce(weekly.losses, 0) as misses
  from verified_baseline baseline
  left join new_daily_losses daily on daily.user_id = baseline.user_id
  left join new_weekly_losses weekly on weekly.user_id = baseline.user_id
)
update public.scores score_row
set
  misses = corrected.misses,
  avg_score = case
    when coalesce(score_row.attempts, 0) + corrected.misses > 0 then
      round(
        coalesce(score_row.score, 0)::numeric /
        (coalesce(score_row.attempts, 0) + corrected.misses),
        2
      )
    else 0
  end
from corrected
where score_row.user_id = corrected.user_id
  and score_row.season = '2026-S2';
