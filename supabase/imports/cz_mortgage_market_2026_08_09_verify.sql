-- Phase 2 Step 2.3 — READ-ONLY verification for cz_mortgage_market_2026_08_09
-- Do NOT modify data. Safe to run after import.

-- Core counts
select 'lenders' as entity, count(*)::int as n from public.mortgage_lenders
union all select 'products', count(*)::int from public.mortgage_catalog_products
union all select 'source_evidence', count(*)::int from public.mortgage_source_evidence
union all select 'rate_variants', count(*)::int from public.mortgage_rate_variants where is_active
union all select 'rate_conditions', count(*)::int from public.mortgage_rate_conditions where is_active
union all select 'fees', count(*)::int from public.mortgage_product_fees where is_active
union all select 'representative_examples', count(*)::int from public.mortgage_representative_examples where is_active
union all select 'eligibility_rules', count(*)::int from public.mortgage_eligibility_rules where is_active
union all select 'market_benchmarks', count(*)::int from public.mortgage_market_benchmarks where is_active;

-- A) rate variants by lender
select l.slug as lender, count(*)::int as rate_variants
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
group by l.slug
order by l.slug;

-- B) rate variants by rate_type
select rate_type, count(*)::int as n
from public.mortgage_rate_variants
where is_active
group by rate_type
order by rate_type;

-- C) NULL LTV
select count(*)::int as null_ltv_rates
from public.mortgage_rate_variants
where is_active and ltv_min is null and ltv_max is null;

-- D) explicit LTV
select count(*)::int as explicit_ltv_rates
from public.mortgage_rate_variants
where is_active and ltv_min is not null and ltv_max is not null;

-- E) active duplicate identity check (expect 0)
select count(*)::int as duplicate_active_identities
from (
  select 1
  from public.mortgage_rate_variants
  where is_active
  group by
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
  having count(*) > 1
) d;

-- F) rate variants missing evidence (expect 0)
select count(*)::int as rates_missing_evidence
from public.mortgage_rate_variants
where is_active and source_evidence_id is null;

-- G) invalid one-sided LTV (expect 0)
select count(*)::int as one_sided_ltv
from public.mortgage_rate_variants
where is_active
  and ((ltv_min is null) <> (ltv_max is null));

-- H) Česká spořitelna — confirm 4.94 absent
select count(*)::int as cs_494_count
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
  and l.slug = 'ceska-sporitelna'
  and v.nominal_interest_rate = 4.94;

select v.fixation_months, v.nominal_interest_rate, v.pricing_scenario_key
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active and l.slug = 'ceska-sporitelna'
order by v.fixation_months;

-- I) KB — confirm stale 5.14 absent
select count(*)::int as kb_514_count
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
  and l.slug = 'komercni-banka'
  and v.nominal_interest_rate = 5.14;

-- J) CSOB active retail rate variants (expect 0)
select count(*)::int as csob_active_rates
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active and l.slug = 'csob';

-- K) RB Klasik retail rate variants (expect 0)
select count(*)::int as rb_klasik_active_rates
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
  and l.slug = 'raiffeisenbank'
  and p.slug = 'retail-klasik';

-- Expected import snapshot (generator reconciliation)
-- lenders=7
-- products=16
-- evidence=9
-- rate_variants=65
-- conditions=74
-- fees=2
-- examples=2
-- eligibility=12
-- benchmarks=0
