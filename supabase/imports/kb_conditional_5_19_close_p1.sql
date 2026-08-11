-- ============================================================
-- PRE-PHASE-6 — close KB conditional 5.19 P1
-- Josef: paste ENTIRE file into Supabase SQL Editor → Run
-- Idempotent. Does NOT touch other lenders.
-- ============================================================

begin;

-- 1) Schema: allow unpublished fixation (NULL ≠ matches every fixation)
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

-- 2) Evidence for KB product page
insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  '874616e6-064e-5e6c-a8ef-6b47d67fd041',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'official_lender_web',
  'Komerční banka — Hypotéka product page (conditional advertised-from 5,19 % p.a.)',
  'https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka',
  'KB Hypotéka — produktová stránka',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  product_id = excluded.product_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

-- 3) KB conditional advertised-from 5.19 (fixation + LTV unspecified)
insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'product_page_advertised_from_conditional',
  'Zvýhodněná sazba od',
  'purchase',
  null,
  null,
  null,
  false,
  false,
  5.19,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  'Product-page conditional od 5,19%. Fixation and LTV not stated on page — must not personalized-match LTV or replace Oznámení matrix. [manifest:kb-product-page-advertised-from-5-19]'
)
on conflict (id) do update set
  pricing_scenario_key = excluded.pricing_scenario_key,
  pricing_scenario_label = excluded.pricing_scenario_label,
  financing_purpose = excluded.financing_purpose,
  fixation_months = excluded.fixation_months,
  ltv_min = excluded.ltv_min,
  ltv_max = excluded.ltv_max,
  ltv_min_exclusive = excluded.ltv_min_exclusive,
  ltv_max_exclusive = excluded.ltv_max_exclusive,
  nominal_interest_rate = excluded.nominal_interest_rate,
  rate_type = excluded.rate_type,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

-- 4) Conditions (no numeric bp — source does not publish bp effects)
insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values
(
  'fbf7b176-3aa9-5716-8bac-cfe72ccaf67a',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'income_domiciliation_required', 'qualifying', null, null, null, null, null, null,
  null, 'Směřování příjmů na účet vedený u KB', true, false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad', true, '2026-08-09T00:00:00.000Z'
),
(
  'dce95499-da20-5ae1-ac18-4da20dca0125',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'life_insurance_required', 'qualifying', 'life', 'mandatory_for_rate', null, null, null, null,
  null, 'Rizikové životní pojištění u Komerční pojišťovny, a. s.', true, false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad', true, '2026-08-09T00:00:00.000Z'
),
(
  'aaf99ca9-99ec-5fdd-909b-e4e560305c7b',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'property_insurance_required', 'qualifying', 'property', 'mandatory_for_rate', null, null, null, null,
  null, 'Pojištění zastavené nemovitosti u Komerční pojišťovny, a. s.', true, false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad', true, '2026-08-09T00:00:00.000Z'
),
(
  '49206581-517a-5751-ae91-f295d5bd3b52',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'PENB_class_requirement', 'qualifying', null, null, null, null, 'A|B', null,
  null, 'PENB energetická třída A nebo B k zastavené nemovitosti', true, false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad', true, '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  value_text = excluded.value_text,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id;

-- 5) Link representative example if present
update public.mortgage_representative_examples
set rate_variant_id = '9b762b00-7f77-53e2-b5c9-14a6b113853c',
    updated_at = now()
where id = '0ee2ceb5-8d3a-5a12-ae05-df1ae492e424';

-- 6) In-tx assertions
do $$
declare
  nullable_ok boolean;
  cond_n int;
  matrix_524 int;
  matrix_564 int;
  stale_539 int;
begin
  select (is_nullable = 'YES') into nullable_ok
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'mortgage_rate_variants'
    and column_name = 'fixation_months';
  if not coalesce(nullable_ok, false) then
    raise exception 'ASSERT: fixation_months still NOT NULL';
  end if;

  select count(*) into cond_n
  from public.mortgage_rate_variants
  where id = '9b762b00-7f77-53e2-b5c9-14a6b113853c'
    and is_active
    and nominal_interest_rate = 5.19
    and fixation_months is null
    and ltv_min is null
    and ltv_max is null
    and pricing_scenario_key = 'product_page_advertised_from_conditional'
    and rate_type = 'advertised_from';
  if cond_n <> 1 then
    raise exception 'ASSERT: KB conditional 5.19 missing or malformed';
  end if;

  select count(*) into matrix_524
  from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'komercni-banka'
    and v.fixation_months = 36
    and v.nominal_interest_rate = 5.24
    and v.pricing_scenario_key = 'minimum_rate_by_fixation_ltv_le_80';
  if matrix_524 <> 1 then
    raise exception 'ASSERT: KB 3y <=80 5.24 missing';
  end if;

  select count(*) into matrix_564
  from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'komercni-banka'
    and v.fixation_months = 36
    and v.nominal_interest_rate = 5.64
    and v.pricing_scenario_key = 'minimum_rate_by_fixation_ltv_gt80_90';
  if matrix_564 <> 1 then
    raise exception 'ASSERT: KB 3y >80-90 5.64 missing';
  end if;

  select count(*) into stale_539
  from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'komercni-banka'
    and v.fixation_months = 36
    and v.nominal_interest_rate = 5.39;
  if stale_539 <> 0 then
    raise exception 'ASSERT: stale KB 3y 5.39 still active';
  end if;
end $$;

commit;

notify pgrst, 'reload schema';

-- Read-only verify (run after commit succeeds)
select
  column_name,
  is_nullable,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'mortgage_rate_variants'
  and column_name = 'fixation_months';

select
  v.nominal_interest_rate,
  v.fixation_months,
  v.ltv_min,
  v.ltv_max,
  v.rate_type,
  v.pricing_scenario_key,
  v.is_active
from public.mortgage_rate_variants v
where v.id = '9b762b00-7f77-53e2-b5c9-14a6b113853c';

select count(*)::int as kb_conditional_conditions
from public.mortgage_rate_conditions
where rate_variant_id = '9b762b00-7f77-53e2-b5c9-14a6b113853c'
  and is_active
  and rate_effect_bp is null;
