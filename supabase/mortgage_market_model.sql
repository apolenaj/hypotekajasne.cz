-- Phase 2 Step 1.3 — Normalized Czech mortgage market data model (launch gate)
-- Additive only. DO NOT DROP / TRUNCATE existing tables.
--
-- ARCHITECTURE — scrape pipeline vs curated catalog:
--
--   RAW / AUTOMATED INGESTION
--   public.mortgage_products          (legacy scrape pipeline — NOT SoT)
--           ↓
--   validation / normalization (app / review)
--           ↓
--   CURATED PRODUCT CATALOG (source of truth)
--   public.mortgage_catalog_products
--           ↓
--   mortgage_rate_variants (+ conditions, fees, RPSN examples, eligibility)
--
-- Catalog must NOT hard-depend on scrape rows. Optional pipeline_external_id
-- may store a soft reference for operators — never a required FK.
--
-- NAME COLLISION:
--   public.mortgage_products = scrape pipeline only.
--   public.mortgage_catalog_products = curated SoT.
--
-- Does NOT insert real bank rates or seed lenders.
-- Does NOT modify public.leads / scrape pipeline data / empty mortgage_rates.
-- RLS: enabled, no anon/authenticated policies → server service-role only.
--
-- Apply in Supabase SQL Editor after this launch gate:
--   notify pgrst, 'reload schema';

create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════
-- 1) lenders
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_lenders (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  country_code text not null default 'CZ',
  website_url text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortgage_lenders_slug_nonempty check (length(trim(slug)) > 0),
  constraint mortgage_lenders_name_nonempty check (length(trim(name)) > 0)
);

create unique index if not exists mortgage_lenders_slug_uidx
  on public.mortgage_lenders (slug);

create index if not exists mortgage_lenders_country_active_idx
  on public.mortgage_lenders (country_code, is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2) source evidence (created early so other tables can FK to it)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_source_evidence (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid null references public.mortgage_lenders (id),
  product_id uuid null, -- FK added after catalog products exist
  source_type text not null,
  source_name text not null,
  source_url text null,
  document_title text null,
  published_at timestamptz null,
  checked_at timestamptz not null,
  valid_from timestamptz null,
  archived_note text null,
  evidence_excerpt text null,
  reliability_tier text not null default 'secondary',
  created_at timestamptz not null default now(),
  constraint mortgage_source_evidence_type_known check (
    source_type in (
      'official_lender_web',
      'official_rate_page',
      'official_lender_pdf',
      'official_tariff',
      'official_terms',
      'CNB',
      'CBA',
      'market_index',
      'other'
    )
  ),
  constraint mortgage_source_evidence_reliability_known check (
    reliability_tier in ('primary', 'secondary', 'tertiary', 'unknown')
  )
);

create index if not exists mortgage_source_evidence_lender_idx
  on public.mortgage_source_evidence (lender_id);

create index if not exists mortgage_source_evidence_checked_idx
  on public.mortgage_source_evidence (checked_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3) mortgage_catalog_products (logical entity: mortgage product)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_catalog_products (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references public.mortgage_lenders (id),
  slug text not null,
  name text not null,
  product_type text not null,
  borrower_scope text not null default 'natural_person',
  currency text not null default 'CZK',
  min_amount numeric(14, 2) null,
  max_amount numeric(14, 2) null,
  max_ltv numeric(5, 2) null,
  min_term_years integer null,
  max_term_years integer null,
  -- Commercial product family (not the same as financing purpose on a rate).
  -- One product may price purchase + refinance + construction via variants.
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  source_evidence_id uuid null references public.mortgage_source_evidence (id),
  -- Soft optional link to scrape pipeline id — NOT a foreign key.
  pipeline_external_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortgage_catalog_products_type_known check (
    product_type in (
      'residential_purchase',
      'residential_refinance',
      'investment',
      'american',
      'business_secured',
      'other'
    )
  ),
  constraint mortgage_catalog_products_borrower_scope_known check (
    borrower_scope in (
      'natural_person',
      'entrepreneur',
      'legal_entity',
      'mixed',
      'other'
    )
  ),
  constraint mortgage_catalog_products_amount_range check (
    min_amount is null or max_amount is null or min_amount <= max_amount
  ),
  constraint mortgage_catalog_products_term_range check (
    min_term_years is null or max_term_years is null or min_term_years <= max_term_years
  ),
  constraint mortgage_catalog_products_max_ltv check (
    max_ltv is null or (max_ltv > 0 and max_ltv <= 100)
  ),
  constraint mortgage_catalog_products_valid_window check (
    valid_to is null or valid_to > valid_from
  )
);

create unique index if not exists mortgage_catalog_products_lender_slug_active_uidx
  on public.mortgage_catalog_products (lender_id, slug)
  where is_active = true;

create index if not exists mortgage_catalog_products_lender_type_idx
  on public.mortgage_catalog_products (lender_id, product_type, is_active);

-- Late FK: evidence.product_id → catalog products
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mortgage_source_evidence_product_fk'
  ) then
    alter table public.mortgage_source_evidence
      add constraint mortgage_source_evidence_product_fk
      foreign key (product_id) references public.mortgage_catalog_products (id);
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4) mortgage_rate_variants (published interest-rate variants)
--
-- Identity for simultaneous ACTIVE variants includes pricing_scenario_key
-- (and loan-amount bounds / financing_purpose when published separately).
-- Conditions explain WHY a scenario applies; they do NOT form uniqueness.
--
-- rate_type: advertised_from | standard | representative only for lender
-- product rates. market_reference belongs in mortgage_market_benchmarks.
-- Forbidden: guaranteed, approved, personalized_offer, offer, best.
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_rate_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.mortgage_catalog_products (id),
  -- Stable free-text scenario identity (NOT an enum). Examples conceptually:
  -- base, with_repayment_insurance, without_repayment_insurance, green, campaign_xyz
  pricing_scenario_key text not null default 'base',
  pricing_scenario_label text null,
  -- Financing purpose for this published price (extensible free text).
  -- Distinct from catalog product_type. NULL = purpose-agnostic published rate.
  -- Examples: purchase, construction, refinance, own_housing, investment,
  -- non_purpose, american, business
  financing_purpose text null,
  fixation_months integer not null,
  -- Both NULL = LTV pricing segment not evidenced by this source (NOT "all LTV").
  -- Both set = explicit published band. Never invent from product.max_ltv.
  ltv_min numeric(5, 2) null,
  ltv_max numeric(5, 2) null,
  ltv_min_exclusive boolean not null default false,
  ltv_max_exclusive boolean not null default false,
  nominal_interest_rate numeric(6, 3) not null,
  rate_type text not null,
  -- When a bank publishes different rates by loan amount, bounds are part of
  -- active identity. Both NULL = amount-agnostic published rate.
  min_loan_amount numeric(14, 2) null,
  max_loan_amount numeric(14, 2) null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  checked_at timestamptz not null,
  is_active boolean not null default true,
  -- Production insert workflow should require evidence; schema allows null for
  -- synthetic fixtures / drafts only.
  source_evidence_id uuid null references public.mortgage_source_evidence (id),
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortgage_rate_variants_scenario_key_nonempty check (
    length(trim(pricing_scenario_key)) > 0
  ),
  constraint mortgage_rate_variants_fixation_positive check (fixation_months > 0),
  constraint mortgage_rate_variants_rate_bounds check (
    nominal_interest_rate > 0 and nominal_interest_rate < 30
  ),
  constraint mortgage_rate_variants_ltv_range check (
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
  ),
  constraint mortgage_rate_variants_ltv_unspecified_flags check (
    ltv_min is not null
    or (
      ltv_min_exclusive = false
      and ltv_max_exclusive = false
    )
  ),
  constraint mortgage_rate_variants_loan_range check (
    min_loan_amount is null
    or max_loan_amount is null
    or min_loan_amount <= max_loan_amount
  ),
  constraint mortgage_rate_variants_rate_type_known check (
    rate_type in (
      'advertised_from',
      'standard',
      'representative'
    )
  ),
  constraint mortgage_rate_variants_rate_type_not_guaranteed check (
    rate_type not in (
      'guaranteed',
      'approved',
      'personalized_offer',
      'offer',
      'best',
      'market_reference'
    )
  ),
  constraint mortgage_rate_variants_valid_window check (
    valid_to is null or valid_to > valid_from
  )
);

-- Idempotent upgrades from Step 1.2 draft schema (if already applied).
alter table public.mortgage_rate_variants
  add column if not exists pricing_scenario_key text;
alter table public.mortgage_rate_variants
  add column if not exists pricing_scenario_label text;
alter table public.mortgage_rate_variants
  add column if not exists financing_purpose text;

update public.mortgage_rate_variants
set pricing_scenario_key = 'base'
where pricing_scenario_key is null or length(trim(pricing_scenario_key)) = 0;

alter table public.mortgage_rate_variants
  alter column pricing_scenario_key set default 'base';

do $$
begin
  alter table public.mortgage_rate_variants
    alter column pricing_scenario_key set not null;
exception
  when others then null;
end $$;

-- Replace active uniqueness: history OK; distinct scenarios OK; exact dupes blocked.
drop index if exists public.mortgage_rate_variants_active_identity_uidx;

-- Sentinel -1 is outside valid LTV 0–100 so unspecified ≠ NULL identity is unique.
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

create index if not exists mortgage_rate_variants_product_active_idx
  on public.mortgage_rate_variants (product_id, is_active, checked_at desc);

create index if not exists mortgage_rate_variants_scenario_idx
  on public.mortgage_rate_variants (product_id, pricing_scenario_key, is_active);

-- Ensure rate_type constraints match launch gate even if table pre-existed.
do $$
begin
  alter table public.mortgage_rate_variants
    drop constraint if exists mortgage_rate_variants_rate_type_known;
  alter table public.mortgage_rate_variants
    add constraint mortgage_rate_variants_rate_type_known check (
      rate_type in ('advertised_from', 'standard', 'representative')
    );
  alter table public.mortgage_rate_variants
    drop constraint if exists mortgage_rate_variants_rate_type_not_guaranteed;
  alter table public.mortgage_rate_variants
    add constraint mortgage_rate_variants_rate_type_not_guaranteed check (
      rate_type not in (
        'guaranteed',
        'approved',
        'personalized_offer',
        'offer',
        'best',
        'market_reference'
      )
    );
exception
  when others then null;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5) mortgage_rate_conditions (PRICE-adjacent published conditions only)
--
-- condition_role: required | optional | qualifying | published_discount |
--                  published_surcharge
-- rate_effect_bp is NULL unless the lender explicitly publishes the effect.
-- Never infer bp from "active account required" etc.
--
-- Insurance kinds (condition_type / insurance_kind) are distinct from nominal
-- rate. Exact insurance cost belongs in fees or representative examples.
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_rate_conditions (
  id uuid primary key default gen_random_uuid(),
  rate_variant_id uuid not null references public.mortgage_rate_variants (id),
  condition_type text not null,
  condition_role text not null default 'qualifying',
  -- For insurance-related rows: none | repayment | life | property
  insurance_kind text null,
  -- How insurance (or similar) binds: mandatory_for_product | mandatory_for_rate |
  -- optional | required_for_discount | not_applicable
  requirement_mode text null,
  operator text null,
  value_numeric numeric(14, 4) null,
  value_text text null,
  unit text null,
  -- Basis points only when lender explicitly publishes the effect. NEVER infer.
  rate_effect_bp numeric(8, 3) null,
  description text not null,
  is_required boolean not null default false,
  is_optional boolean not null default true,
  source_evidence_id uuid null references public.mortgage_source_evidence (id),
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortgage_rate_conditions_type_known check (
    condition_type in (
      'no_insurance',
      'repayment_insurance',
      'repayment_insurance_required',
      'repayment_insurance_discount',
      'life_insurance',
      'life_insurance_required',
      'property_insurance',
      'property_insurance_required',
      'active_account_required',
      'income_domiciliation_required',
      'salary_account_required',
      'green_property_required',
      'PENB_class_requirement',
      'minimum_loan_amount',
      'maximum_loan_amount',
      'campaign',
      'other'
    )
  ),
  constraint mortgage_rate_conditions_role_known check (
    condition_role in (
      'required',
      'optional',
      'qualifying',
      'published_discount',
      'published_surcharge'
    )
  ),
  constraint mortgage_rate_conditions_insurance_kind_known check (
    insurance_kind is null
    or insurance_kind in ('none', 'repayment', 'life', 'property')
  ),
  constraint mortgage_rate_conditions_requirement_mode_known check (
    requirement_mode is null
    or requirement_mode in (
      'mandatory_for_product',
      'mandatory_for_rate',
      'optional',
      'required_for_discount',
      'not_applicable'
    )
  ),
  constraint mortgage_rate_conditions_required_optional check (
    not (is_required = true and is_optional = true)
  ),
  -- Published discount/surcharge roles may carry bp; others usually leave null.
  -- Never force a non-null rate_effect_bp.
  constraint mortgage_rate_conditions_valid_window check (
    valid_to is null or valid_to > valid_from
  )
);

alter table public.mortgage_rate_conditions
  add column if not exists condition_role text;
alter table public.mortgage_rate_conditions
  add column if not exists insurance_kind text;
alter table public.mortgage_rate_conditions
  add column if not exists requirement_mode text;

update public.mortgage_rate_conditions
set condition_role = case
  when is_required then 'required'
  when is_optional then 'optional'
  else 'qualifying'
end
where condition_role is null;

do $$
begin
  alter table public.mortgage_rate_conditions
    alter column condition_role set default 'qualifying';
  alter table public.mortgage_rate_conditions
    alter column condition_role set not null;
exception
  when others then null;
end $$;

create index if not exists mortgage_rate_conditions_variant_idx
  on public.mortgage_rate_conditions (rate_variant_id, is_active);

do $$
begin
  alter table public.mortgage_rate_conditions
    drop constraint if exists mortgage_rate_conditions_role_known;
  alter table public.mortgage_rate_conditions
    add constraint mortgage_rate_conditions_role_known check (
      condition_role in (
        'required',
        'optional',
        'qualifying',
        'published_discount',
        'published_surcharge'
      )
    );
exception
  when others then null;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6) mortgage_product_fees (separate from nominal rate)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_product_fees (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.mortgage_catalog_products (id),
  rate_variant_id uuid null references public.mortgage_rate_variants (id),
  fee_type text not null,
  amount numeric(14, 2) null,
  currency text not null default 'CZK',
  frequency text not null default 'one_off',
  is_mandatory boolean not null default false,
  description text null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  checked_at timestamptz not null,
  source_evidence_id uuid null references public.mortgage_source_evidence (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortgage_product_fees_type_known check (
    fee_type in (
      'arrangement',
      'valuation',
      'account',
      'drawdown',
      'cadastral_registry',
      'insurance',
      'insurance_repayment',
      'insurance_life',
      'insurance_property',
      'other_mandatory',
      'other'
    )
  ),
  constraint mortgage_product_fees_frequency_known check (
    frequency in ('one_off', 'monthly', 'annual', 'per_drawdown', 'other')
  ),
  constraint mortgage_product_fees_valid_window check (
    valid_to is null or valid_to > valid_from
  )
);

create index if not exists mortgage_product_fees_product_idx
  on public.mortgage_product_fees (product_id, is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7) mortgage_representative_examples (lender-published RPSN examples ONLY)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_representative_examples (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.mortgage_catalog_products (id),
  rate_variant_id uuid null references public.mortgage_rate_variants (id),
  loan_amount numeric(14, 2) not null,
  term_years numeric(5, 2) not null,
  fixation_months integer null,
  nominal_rate numeric(6, 3) null,
  rpsn numeric(6, 3) null,
  monthly_payment numeric(14, 2) null,
  total_amount_payable numeric(14, 2) null,
  number_of_payments integer null,
  included_fees text null,
  insurance_included boolean null,
  insurance_cost numeric(14, 2) null,
  account_cost numeric(14, 2) null,
  representative_example_text text null,
  checked_at timestamptz not null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  source_evidence_id uuid null references public.mortgage_source_evidence (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortgage_rep_examples_loan_positive check (loan_amount > 0),
  constraint mortgage_rep_examples_term_positive check (term_years > 0),
  constraint mortgage_rep_examples_nominal_bounds check (
    nominal_rate is null or (nominal_rate > 0 and nominal_rate < 30)
  ),
  constraint mortgage_rep_examples_rpsn_bounds check (
    rpsn is null or (rpsn > 0 and rpsn < 40)
  ),
  constraint mortgage_rep_examples_valid_window check (
    valid_to is null or valid_to > valid_from
  )
);

create index if not exists mortgage_rep_examples_product_idx
  on public.mortgage_representative_examples (product_id, is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8) mortgage_eligibility_rules (SEPARATE from pricing)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.mortgage_catalog_products (id),
  rate_variant_id uuid null references public.mortgage_rate_variants (id),
  rule_category text not null,
  rule_code text not null,
  effect text not null,
  effect_value_numeric numeric(14, 4) null,
  effect_value_text text null,
  description text not null,
  -- Explicit pricing change ONLY when lender publishes it; never inferred.
  changes_pricing boolean not null default false,
  pricing_effect_bp numeric(8, 3) null,
  source_evidence_id uuid null references public.mortgage_source_evidence (id),
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- rule_code is free text for applicant/income/residence concepts, e.g.:
  -- employee, osvc, legal_entity, czech_citizen, eu_citizen, non_eu_citizen,
  -- czech_residence, foreign_residence, czech_income, foreign_income,
  -- foreign_income_currency, foreign_employer
  constraint mortgage_eligibility_category_known check (
    rule_category in (
      'applicant',
      'residence_nationality',
      'income',
      'purpose',
      'property',
      'regulatory',
      'other'
    )
  ),
  constraint mortgage_eligibility_effect_known check (
    effect in (
      'eligible',
      'not_eligible',
      'manual_assessment',
      'max_ltv',
      'max_amount',
      'required_documentation',
      -- legacy aliases kept for draft compatibility
      'block',
      'limit_ltv',
      'limit_amount',
      'allow',
      'require',
      'other'
    )
  ),
  constraint mortgage_eligibility_pricing_consistency check (
    (changes_pricing = false and pricing_effect_bp is null)
    or (changes_pricing = true and pricing_effect_bp is not null)
  ),
  constraint mortgage_eligibility_valid_window check (
    valid_to is null or valid_to > valid_from
  )
);

create index if not exists mortgage_eligibility_product_idx
  on public.mortgage_eligibility_rules (product_id, is_active, rule_category);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9) mortgage_market_benchmarks (NOT lender product rates)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.mortgage_market_benchmarks (
  id uuid primary key default gen_random_uuid(),
  benchmark_name text not null,
  provider text not null,
  country_code text not null default 'CZ',
  purpose_category text null,
  ltv_segment text null,
  fixation_months integer null,
  value numeric(8, 4) not null,
  metric_type text not null,
  period text null,
  published_at timestamptz null,
  checked_at timestamptz not null,
  source_url text null,
  source_evidence_id uuid null references public.mortgage_source_evidence (id),
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortgage_market_benchmarks_metric_known check (
    metric_type in (
      'average_rate',
      'median_rate',
      'index',
      'volume',
      'other'
    )
  ),
  constraint mortgage_market_benchmarks_valid_window check (
    valid_to is null or valid_to > valid_from
  )
);

create index if not exists mortgage_market_benchmarks_provider_idx
  on public.mortgage_market_benchmarks (provider, country_code, is_active);

-- Entity kind discriminator for app-layer safety (benchmark ≠ lender rate).
comment on table public.mortgage_market_benchmarks is
  'Market indexes / aggregates only. NEVER treat as a lender product interest rate. market_reference belongs here, not in mortgage_rate_variants.';

comment on table public.mortgage_rate_variants is
  'Lender-published product interest-rate variants. Active identity includes pricing_scenario_key (+ LTV/fixation/rate_type/purpose/amount bounds). History via is_active/valid_to.';

comment on table public.mortgage_eligibility_rules is
  'Eligibility only. Does not modify rate unless changes_pricing=true AND pricing_effect_bp explicitly published.';

comment on table public.mortgage_catalog_products is
  'Curated product catalog SoT. Independent of scrape pipeline public.mortgage_products. Optional pipeline_external_id is not a FK.';

comment on table public.mortgage_rate_conditions is
  'Published conditions for a rate variant. rate_effect_bp null unless lender publishes it. Insurance cost is not stored as nominal rate.';

comment on table public.mortgage_representative_examples is
  'Lender-published representative RPSN examples only. Store exact published figures; do not invent/calculate RPSN. Insurance/account costs stay here or in fees — never merged into nominal interest.';

-- Soft optional scrape crosswalk (idempotent if CREATE TABLE already had it).
alter table public.mortgage_catalog_products
  add column if not exists pipeline_external_id text;

-- ═══════════════════════════════════════════════════════════════════════════
-- updated_at triggers
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'mortgage_lenders',
    'mortgage_catalog_products',
    'mortgage_rate_variants',
    'mortgage_rate_conditions',
    'mortgage_product_fees',
    'mortgage_representative_examples',
    'mortgage_eligibility_rules',
    'mortgage_market_benchmarks'
  ]
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at_timestamp()',
      t, t
    );
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS — public data, privileged writes only (no anon policies)
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.mortgage_lenders enable row level security;
alter table public.mortgage_source_evidence enable row level security;
alter table public.mortgage_catalog_products enable row level security;
alter table public.mortgage_rate_variants enable row level security;
alter table public.mortgage_rate_conditions enable row level security;
alter table public.mortgage_product_fees enable row level security;
alter table public.mortgage_representative_examples enable row level security;
alter table public.mortgage_eligibility_rules enable row level security;
alter table public.mortgage_market_benchmarks enable row level security;

-- Intentionally NO policies for anon / authenticated on any of these tables.
-- Browser PostgREST cannot SELECT/INSERT/UPDATE/DELETE.
-- Server service-role bypasses RLS for controlled reads/writes.

notify pgrst, 'reload schema';

-- Existing public.mortgage_rates: KEEP. Empty today.
-- Recommended future role: optional compatibility / derived orientational layer
-- for simple homepage/calculator defaults — NOT the product catalog SoT.
