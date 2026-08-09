-- Phase 2 Step 2.0 — Import readiness / unknown-LTV correction
-- Additive, non-destructive. DO NOT DROP TABLE / TRUNCATE.
--
-- Problem:
--   Some official Czech lender sources publish fixation rates without an
--   explicit LTV pricing segment. The launch schema required ltv_min/ltv_max
--   NOT NULL, which forced false precision (invented 0–80 / 0–90 bands).
--
-- Fix:
--   Allow BOTH ltv_min and ltv_max to be NULL (= LTV pricing scope not
--   evidenced by this rate source). This is NOT "applies to all LTV".
--   Product max_ltv remains a separate eligibility fact and MUST NOT be
--   copied onto rate LTV bounds unless the rate source states that range.
--
-- Apply in Supabase SQL Editor after review (do not auto-run from app):
--   notify pgrst, 'reload schema';

-- 1) Allow unknown LTV bounds
alter table public.mortgage_rate_variants
  alter column ltv_min drop not null;

alter table public.mortgage_rate_variants
  alter column ltv_max drop not null;

-- 2) Replace LTV range check: both NULL XOR both set; no one-sided bounds
alter table public.mortgage_rate_variants
  drop constraint if exists mortgage_rate_variants_ltv_range;

alter table public.mortgage_rate_variants
  add constraint mortgage_rate_variants_ltv_range check (
    (
      ltv_min is null
      and ltv_max is null
    )
    or (
      ltv_min is not null
      and ltv_max is not null
      and ltv_min >= 0
      and ltv_max <= 100
      and ltv_min < ltv_max
    )
  );

-- When LTV is unspecified, exclusivity flags must be deterministic (false/false).
alter table public.mortgage_rate_variants
  drop constraint if exists mortgage_rate_variants_ltv_unspecified_flags;

alter table public.mortgage_rate_variants
  add constraint mortgage_rate_variants_ltv_unspecified_flags check (
    ltv_min is not null
    or (
      ltv_min_exclusive = false
      and ltv_max_exclusive = false
    )
  );

comment on column public.mortgage_rate_variants.ltv_min is
  'Explicit LTV band lower bound, or NULL with ltv_max NULL when the source does not publish an LTV pricing segment. NULL ≠ applies to all LTV.';

comment on column public.mortgage_rate_variants.ltv_max is
  'Explicit LTV band upper bound, or NULL with ltv_min NULL when the source does not publish an LTV pricing segment. NULL ≠ applies to all LTV.';

-- 3) Active unique index: PostgreSQL NULL ≠ NULL would allow duplicate
--    unspecified-LTV actives. Use sentinel -1 (outside valid 0–100 LTV).
drop index if exists public.mortgage_rate_variants_active_identity_uidx;

create unique index mortgage_rate_variants_active_identity_uidx
  on public.mortgage_rate_variants (
    product_id,
    fixation_months,
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

-- RLS unchanged — remain enabled, no anon write policies.
-- Existing empty rows preserved (none expected at apply time).

notify pgrst, 'reload schema';
