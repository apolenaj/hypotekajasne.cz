-- Pre-Phase-6 micro patch — allow unpublished fixation on rate variants
-- Additive, non-destructive. DO NOT DROP TABLE / TRUNCATE.
--
-- Problem:
--   Some official lender product pages advertise a conditional "od" rate without
--   stating which fixation the headline applies to. Forcing a fixation invents
--   false precision; omitting the row hides a distinct official scenario.
--
-- Fix:
--   Allow fixation_months NULL (= fixation not published for this scenario).
--   NULL fixation must never be treated as matching a selected fixation filter.
--   Matrix / sazebník rows keep explicit positive fixation_months.
--
-- Apply in Supabase SQL Editor after review (do not auto-run from app):
--   notify pgrst, 'reload schema';

alter table public.mortgage_rate_variants
  alter column fixation_months drop not null;

alter table public.mortgage_rate_variants
  drop constraint if exists mortgage_rate_variants_fixation_positive;

alter table public.mortgage_rate_variants
  add constraint mortgage_rate_variants_fixation_positive check (
    fixation_months is null
    or fixation_months > 0
  );

comment on column public.mortgage_rate_variants.fixation_months is
  'Published fixation in months, or NULL when the source does not state fixation for this pricing scenario. NULL ≠ matches every fixation.';

-- Active unique index: coalesce NULL fixation to sentinel -1
drop index if exists public.mortgage_rate_variants_active_identity_uidx;

create unique index mortgage_rate_variants_active_identity_uidx
  on public.mortgage_rate_variants (
    product_id,
    coalesce(fixation_months, (-1)),
    coalesce(ltv_min, (-1)::numeric),
    coalesce(ltv_max, (-1)::numeric),
    ltv_min_exclusive,
    ltv_max_exclusive,
    pricing_scenario_key,
    rate_type,
    coalesce(financing_purpose, ''),
    coalesce(min_loan_amount, (-1)::numeric),
    coalesce(max_loan_amount, (-1)::numeric)
  )
  where is_active = true;

notify pgrst, 'reload schema';
