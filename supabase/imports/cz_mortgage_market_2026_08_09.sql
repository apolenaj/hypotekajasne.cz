-- Phase 2 Step 2.3 — Production import from verified manifest
-- Source: src/lib/mortgage-market/import/data/cz-2026-08-09.ts
-- checked_at: 2026-08-09
-- IMPORT_READY rate variants only: 66
-- HOLD rate variants excluded: 7
-- DO NOT execute blindly — owner review required.
-- Idempotent via stable UUIDs + ON CONFLICT (id) DO UPDATE.
-- No DELETE ALL / TRUNCATE.
-- Excludes HOLD campaign / stale / CSOB retail / RB Klasik rates.

begin;

-- Allow unpublished fixation for conditional advertised-from scenarios
alter table public.mortgage_rate_variants
  alter column fixation_months drop not null;
alter table public.mortgage_rate_variants
  drop constraint if exists mortgage_rate_variants_fixation_positive;
alter table public.mortgage_rate_variants
  add constraint mortgage_rate_variants_fixation_positive check (
    fixation_months is null or fixation_months > 0
  );
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

-- Pre-import assertions (fail transaction if catalog already has conflicting active identities
-- for this import batch keys). Empty production catalog is expected on first apply.
do $$
begin
  if exists (
    select 1 from public.mortgage_rate_variants
    where is_active
      and notes like '%[manifest:%'
      and notes not like '%[manifest:air-%'
      and notes not like '%[manifest:moneta-%'
      and notes not like '%[manifest:uc-%'
      and notes not like '%[manifest:cs-oznameni-%'
      and notes not like '%[manifest:kb-%'
  ) then
    -- Allow re-import of this batch; do not block.
    null;
  end if;
end $$;


-- 1) lenders

insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  '8aafc397-2e4c-5add-b104-4765d12723c4',
  'air-bank',
  'Air Bank',
  'CZ',
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();

insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  'cdfc2fd6-ea53-5eae-9481-db4bc6cb2e3b',
  'moneta',
  'MONETA Money Bank',
  'CZ',
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();

insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  '350794e2-06d5-59bc-bffa-37e1f60b338c',
  'unicredit',
  'UniCredit Bank',
  'CZ',
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();

insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  '15ee8ba6-5803-59fd-a9c8-f3a0ef976a19',
  'ceska-sporitelna',
  'Česká spořitelna',
  'CZ',
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();

insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  '874616e6-064e-5e6c-a8ef-6b47d67fd041',
  'komercni-banka',
  'Komerční banka',
  'CZ',
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();

insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  '054eae58-a072-5f43-a557-d500a0ae48af',
  'csob',
  'ČSOB',
  'CZ',
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();

insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  'raiffeisenbank',
  'Raiffeisenbank',
  'CZ',
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();


-- 2) source evidence (lender FK; product_id filled after products)

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '8aafc397-2e4c-5add-b104-4765d12723c4',
  null,
  'official_lender_web',
  'Air Bank official mortgage rate publication (valid from 2026-03-27)',
  'https://www.airbank.cz/co-vas-nejvic-zajima/urokove-sazby-u-hypoteky/',
  'Air Bank hypotéka — sazby',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  'cdfc2fd6-ea53-5eae-9481-db4bc6cb2e3b',
  null,
  'official_lender_web',
  'MONETA Money Bank official rate sheet (valid from 2026-07-23)',
  'https://www.moneta.cz/dokumenty-ke-stazeni/sazebniky',
  'MONETA sazebník hypoték',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '4642db37-5575-5296-a827-889cce9805e6',
  '350794e2-06d5-59bc-bffa-37e1f60b338c',
  null,
  'official_lender_web',
  'UniCredit Bank official purpose-mortgage advertised rates (primary audit)',
  'https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html',
  'UniCredit účelová hypotéka — sazby',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  '15ee8ba6-5803-59fd-a9c8-f3a0ef976a19',
  null,
  'official_lender_pdf',
  'Česká spořitelna — Oznámení o úrokových sazbách (účinnost od 29. 5. 2026)',
  'https://www.csas.cz/banka/content/inet/internet/cs/RR_SK.ANN..xml,pdf_IE',
  'ČS Oznámení o úrokových sazbách',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  '874616e6-064e-5e6c-a8ef-6b47d67fd041',
  null,
  'official_lender_pdf',
  'Komerční banka — Oznámení o úrokových sazbách (účinnost od 24. 7. 2026)',
  'https://www.kb.cz/getmedia/72c05c27-6ecd-4383-8c02-63d679fa4d00/oznameni-o-urokovych-sazbach.pdf',
  'KB minimální výše úrokové sazby podle doby fixace',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '5c3caad6-f0d7-5204-8990-e35594e9a6b4',
  '054eae58-a072-5f43-a557-d500a0ae48af',
  null,
  'official_rate_page',
  'ČSOB official rate page displays LTV-point rates — HOLD until fixation/rate_type/conditions fully evidenced',
  null,
  'ČSOB Hypotéka — sazby (HOLD)',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '4c39a68d-cecf-52a2-9678-084f2d94aac4',
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  null,
  'official_lender_web',
  'Raiffeisenbank official product / eligibility pages (primary audit)',
  'https://www.rb.cz/osobni/hypoteky',
  'Raiffeisenbank hypotéky — produkty',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '4538e3aa-c077-58aa-9f30-a9cd2f058e10',
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  null,
  'official_lender_web',
  'Raiffeisenbank — Hypotéka s nižší splátkou official representative example',
  'https://www.rb.cz/osobni/hypoteky/nabidka-hypotek/hypoteka-s-nizsi-splatkou',
  'RB Hypotéka s nižší splátkou — reprezentativní příklad',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  '874616e6-064e-5e6c-a8ef-6b47d67fd041',
  null,
  'official_lender_web',
  'Komerční banka — Hypotéka product page (conditional advertised-from 5,19 % p.a.)',
  'https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka',
  'KB Hypotéka — produktová stránka',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;

insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  '7ba4ea56-eb7a-5c7a-be47-564c78de33a6',
  'cdfc2fd6-ea53-5eae-9481-db4bc6cb2e3b',
  null,
  'official_lender_web',
  'MONETA Money Bank official representative RPSN example (primary audit)',
  'https://www.moneta.cz/hypoteky/hypoteka',
  'MONETA reprezentativní příklad',
  '2026-08-09T00:00:00.000Z',
  'primary'
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;


-- 3) catalog products (incl. CSOB/RB catalog even without retail rates)

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '21348311-a3f4-5e86-877d-732aba85bac8',
  '8aafc397-2e4c-5add-b104-4765d12723c4',
  'residential-mortgage',
  'Air Bank — new residential mortgage',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  90,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '2f7deb25-4be2-5763-854e-826c4bbda866'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  'cdfc2fd6-ea53-5eae-9481-db4bc6cb2e3b',
  'mortgage-housing',
  'MONETA — mortgage for housing',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '6186cf87-157c-5912-85ea-9de81f9aaa3d'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  'f32422c8-86ca-5717-af63-6efa55761c63',
  'cdfc2fd6-ea53-5eae-9481-db4bc6cb2e3b',
  'mortgage-trade-entrepreneur',
  'MONETA — trade/entrepreneur mortgage',
  'business_secured',
  'entrepreneur',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '6186cf87-157c-5912-85ea-9de81f9aaa3d'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '25864e97-a23c-5318-9c5d-a8c06912ea5f',
  'cdfc2fd6-ea53-5eae-9481-db4bc6cb2e3b',
  'american-mortgage',
  'MONETA — American mortgage',
  'american',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '6186cf87-157c-5912-85ea-9de81f9aaa3d'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  '350794e2-06d5-59bc-bffa-37e1f60b338c',
  'purpose-mortgage',
  'UniCredit — purpose mortgage',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  90,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '4642db37-5575-5296-a827-889cce9805e6'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  '15ee8ba6-5803-59fd-a9c8-f3a0ef976a19',
  'hypoteka-oznameni-fixed',
  'Česká spořitelna — Oznámení o úrokových sazbách (fixed)',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '467c05fd-0729-57a1-b4f0-060eee6fa49e'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '0e96e186-19ae-5e6d-a2c7-cb48a98e9c30',
  '15ee8ba6-5803-59fd-a9c8-f3a0ef976a19',
  'american-mortgage',
  'Česká spořitelna — American mortgage',
  'american',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '467c05fd-0729-57a1-b4f0-060eee6fa49e'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  '874616e6-064e-5e6c-a8ef-6b47d67fd041',
  'standard-mortgage',
  'Komerční banka — standard mortgage',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '55ae593d-1eee-585f-b03c-ea6e7f91c72e',
  '874616e6-064e-5e6c-a8ef-6b47d67fd041',
  'american-mortgage',
  'Komerční banka — American mortgage',
  'american',
  'natural_person',
  'CZK',
  null,
  null,
  70,
  null,
  20,
  true,
  '2026-08-09T00:00:00.000Z',
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '6f26e924-2c97-5b6d-9fdd-6bbef58879bd',
  '054eae58-a072-5f43-a557-d500a0ae48af',
  'retail-mortgage',
  'ČSOB — retail mortgage',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '5c3caad6-f0d7-5204-8990-e35594e9a6b4'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '66524394-b4bf-5b7e-8f4b-656a849ec137',
  '054eae58-a072-5f43-a557-d500a0ae48af',
  'american-mortgage',
  'ČSOB — American mortgage',
  'american',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '5c3caad6-f0d7-5204-8990-e35594e9a6b4'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  'c256f92b-1363-5269-ad3f-c92f6f685dfe',
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  'retail-klasik',
  'Raiffeisenbank — retail Klasik',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  20000000,
  90,
  5,
  30,
  true,
  '2026-08-09T00:00:00.000Z',
  '4c39a68d-cecf-52a2-9678-084f2d94aac4'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  'db517ea7-09db-5d47-9a6a-82f57edad765',
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  'responsible-green-mortgage',
  'Raiffeisenbank — responsible/green mortgage',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '4c39a68d-cecf-52a2-9678-084f2d94aac4'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  'f564aaac-5892-5c77-b1e7-854e0b420cbe',
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  'american-mortgage',
  'Raiffeisenbank — American mortgage',
  'american',
  'natural_person',
  'CZK',
  null,
  12000000,
  70,
  5,
  20,
  true,
  '2026-08-09T00:00:00.000Z',
  '4c39a68d-cecf-52a2-9678-084f2d94aac4'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '27191d0b-5002-53d0-8b1b-f1fb7817fb0e',
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  'business-american-mortgage',
  'Raiffeisenbank — business American mortgage',
  'business_secured',
  'entrepreneur',
  'CZK',
  null,
  null,
  null,
  null,
  25,
  true,
  '2026-08-09T00:00:00.000Z',
  '4c39a68d-cecf-52a2-9678-084f2d94aac4'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();

insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  '4c2a7c5f-9f3e-5b29-b247-5328aa1b479d',
  '6125abfa-20cb-520f-b5af-1041774f3fed',
  'hypoteka-s-nizsi-splatkou',
  'Raiffeisenbank — Hypotéka s nižší splátkou',
  'residential_purchase',
  'natural_person',
  'CZK',
  null,
  null,
  null,
  null,
  null,
  true,
  '2026-08-09T00:00:00.000Z',
  '4538e3aa-c077-58aa-9f30-a9cd2f058e10'
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();


-- 3b) attach evidence.product_id where a single product owns the evidence

update public.mortgage_source_evidence
set product_id = '21348311-a3f4-5e86-877d-732aba85bac8'
where id = '2f7deb25-4be2-5763-854e-826c4bbda866'
  and (product_id is null or product_id = '21348311-a3f4-5e86-877d-732aba85bac8');

update public.mortgage_source_evidence
set product_id = '6b2c007b-f774-5dde-aaa0-94cadcb9dc97'
where id = '6186cf87-157c-5912-85ea-9de81f9aaa3d'
  and (product_id is null or product_id = '6b2c007b-f774-5dde-aaa0-94cadcb9dc97');

update public.mortgage_source_evidence
set product_id = 'f32422c8-86ca-5717-af63-6efa55761c63'
where id = '6186cf87-157c-5912-85ea-9de81f9aaa3d'
  and (product_id is null or product_id = 'f32422c8-86ca-5717-af63-6efa55761c63');

update public.mortgage_source_evidence
set product_id = '25864e97-a23c-5318-9c5d-a8c06912ea5f'
where id = '6186cf87-157c-5912-85ea-9de81f9aaa3d'
  and (product_id is null or product_id = '25864e97-a23c-5318-9c5d-a8c06912ea5f');

update public.mortgage_source_evidence
set product_id = '298b6e63-e369-5885-9717-5a3b0c8f2975'
where id = '4642db37-5575-5296-a827-889cce9805e6'
  and (product_id is null or product_id = '298b6e63-e369-5885-9717-5a3b0c8f2975');

update public.mortgage_source_evidence
set product_id = 'd821ac9c-2173-5bba-a8b8-2ab5a71f5584'
where id = '467c05fd-0729-57a1-b4f0-060eee6fa49e'
  and (product_id is null or product_id = 'd821ac9c-2173-5bba-a8b8-2ab5a71f5584');

update public.mortgage_source_evidence
set product_id = '0e96e186-19ae-5e6d-a2c7-cb48a98e9c30'
where id = '467c05fd-0729-57a1-b4f0-060eee6fa49e'
  and (product_id is null or product_id = '0e96e186-19ae-5e6d-a2c7-cb48a98e9c30');

update public.mortgage_source_evidence
set product_id = '53f176ac-6488-507e-b02a-82eeb07477a6'
where id = 'dc8f3ec4-9079-5494-b1e4-98e209cf339f'
  and (product_id is null or product_id = '53f176ac-6488-507e-b02a-82eeb07477a6');

update public.mortgage_source_evidence
set product_id = '55ae593d-1eee-585f-b03c-ea6e7f91c72e'
where id = 'dc8f3ec4-9079-5494-b1e4-98e209cf339f'
  and (product_id is null or product_id = '55ae593d-1eee-585f-b03c-ea6e7f91c72e');

update public.mortgage_source_evidence
set product_id = '6f26e924-2c97-5b6d-9fdd-6bbef58879bd'
where id = '5c3caad6-f0d7-5204-8990-e35594e9a6b4'
  and (product_id is null or product_id = '6f26e924-2c97-5b6d-9fdd-6bbef58879bd');

update public.mortgage_source_evidence
set product_id = '66524394-b4bf-5b7e-8f4b-656a849ec137'
where id = '5c3caad6-f0d7-5204-8990-e35594e9a6b4'
  and (product_id is null or product_id = '66524394-b4bf-5b7e-8f4b-656a849ec137');

update public.mortgage_source_evidence
set product_id = 'c256f92b-1363-5269-ad3f-c92f6f685dfe'
where id = '4c39a68d-cecf-52a2-9678-084f2d94aac4'
  and (product_id is null or product_id = 'c256f92b-1363-5269-ad3f-c92f6f685dfe');

update public.mortgage_source_evidence
set product_id = 'db517ea7-09db-5d47-9a6a-82f57edad765'
where id = '4c39a68d-cecf-52a2-9678-084f2d94aac4'
  and (product_id is null or product_id = 'db517ea7-09db-5d47-9a6a-82f57edad765');

update public.mortgage_source_evidence
set product_id = 'f564aaac-5892-5c77-b1e7-854e0b420cbe'
where id = '4c39a68d-cecf-52a2-9678-084f2d94aac4'
  and (product_id is null or product_id = 'f564aaac-5892-5c77-b1e7-854e0b420cbe');

update public.mortgage_source_evidence
set product_id = '27191d0b-5002-53d0-8b1b-f1fb7817fb0e'
where id = '4c39a68d-cecf-52a2-9678-084f2d94aac4'
  and (product_id is null or product_id = '27191d0b-5002-53d0-8b1b-f1fb7817fb0e');

update public.mortgage_source_evidence
set product_id = '4c2a7c5f-9f3e-5b29-b247-5328aa1b479d'
where id = '4538e3aa-c077-58aa-9f30-a9cd2f058e10'
  and (product_id is null or product_id = '4c2a7c5f-9f3e-5b29-b247-5328aa1b479d');


-- 4) rate variants (IMPORT_READY only)

-- EXPECTED_COUNT=66

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'af639c30-f14f-5550-b270-829c3140c543',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'purchase',
  24,
  0,
  90,
  false,
  false,
  4.79,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-2y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e845018e-d667-57fb-ba98-0350b617ed8f',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'purchase',
  24,
  0,
  90,
  false,
  false,
  4.89,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-2y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '7503755a-dc14-55f4-9bfe-718e960fa613',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'purchase',
  36,
  0,
  90,
  false,
  false,
  4.79,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-3y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '85b58106-9e05-5eed-ae17-b94fb42ee2a7',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'purchase',
  36,
  0,
  90,
  false,
  false,
  4.89,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-3y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'c114b6cf-2db1-5de5-aa7d-8c86a85750ba',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'purchase',
  60,
  0,
  90,
  false,
  false,
  4.89,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-5y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e2d46c51-7f99-52dd-b2f8-0d728f375b83',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'purchase',
  60,
  0,
  90,
  false,
  false,
  4.99,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-5y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '1c71398b-a1e6-5805-b870-b17e7fd7c81c',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'purchase',
  84,
  0,
  90,
  false,
  false,
  5.09,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-7y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '9ae2f476-2f99-5bd6-8351-a6f79faa8107',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'purchase',
  84,
  0,
  90,
  false,
  false,
  5.19,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-7y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '62c11932-7a8c-5681-bd4d-f9411534c01e',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'purchase',
  120,
  0,
  90,
  false,
  false,
  5.29,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-10y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '77781a6b-fc54-5e21-9924-48adc3c8154f',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'purchase',
  120,
  0,
  90,
  false,
  false,
  5.39,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-purchase-10y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '4a4f65f3-e668-54c3-9a3d-99c011c54758',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'refinance',
  24,
  0,
  90,
  false,
  false,
  4.69,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-2y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'beb04d3a-5201-57e8-b68e-6e84f95d07d6',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'refinance',
  24,
  0,
  90,
  false,
  false,
  4.79,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-2y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '0fcd54ad-f1ea-5649-928d-03c77186c0f3',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'refinance',
  36,
  0,
  90,
  false,
  false,
  4.69,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-3y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'fa36b9bd-1ebe-552a-ac77-57fbbbebfa5b',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'refinance',
  36,
  0,
  90,
  false,
  false,
  4.79,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-3y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '4591a38d-2603-5c27-af53-ab276d8255b4',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'refinance',
  60,
  0,
  90,
  false,
  false,
  4.79,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-5y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '7b5013a4-4c59-507b-a39f-5417b3358287',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'refinance',
  60,
  0,
  90,
  false,
  false,
  4.89,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-5y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e8da2ebc-ea84-5bfd-82e3-1f7955e63ca4',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'refinance',
  84,
  0,
  90,
  false,
  false,
  4.99,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-7y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '1dab61d2-6ef3-55cf-909f-870c4d6b7839',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'refinance',
  84,
  0,
  90,
  false,
  false,
  5.09,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-7y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '42a3d860-ee74-558b-9148-3c7a1e9a030e',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'with_repayment_insurance',
  'With repayment insurance (PPI)',
  'refinance',
  120,
  0,
  90,
  false,
  false,
  5.19,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-10y-with-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '40917997-79a9-527e-a680-d0246580916c',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  'without_repayment_insurance',
  'Without repayment insurance (PPI)',
  'refinance',
  120,
  0,
  90,
  false,
  false,
  5.29,
  'standard',
  null,
  null,
  '2026-03-27T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  '[manifest:air-refinance-10y-without-ppi]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '3d1142db-cd37-55cf-ba76-45396d7c982a',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  'housing_published_with_account_and_optional_ppi',
  null,
  'purchase',
  12,
  null,
  null,
  false,
  false,
  4.79,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-housing-1y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'cda6d59c-4458-520a-9e41-fa32e39d403d',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  'housing_published_with_account_and_optional_ppi',
  null,
  'purchase',
  36,
  null,
  null,
  false,
  false,
  4.99,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-housing-3y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '8dc1232d-846c-5c85-900d-d01d79748124',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  'housing_published_with_account_and_optional_ppi',
  null,
  'purchase',
  60,
  null,
  null,
  false,
  false,
  5.09,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-housing-5y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'bd50523e-f58f-564d-96b2-5744ecda3d25',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  'housing_published_with_account_and_optional_ppi',
  null,
  'purchase',
  84,
  null,
  null,
  false,
  false,
  5.39,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-housing-7y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '6b8d96c4-cf32-5c57-8244-2274a24a6acf',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  'housing_published_with_account_and_optional_ppi',
  null,
  'purchase',
  120,
  null,
  null,
  false,
  false,
  5.59,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-housing-10y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '3e9dc5b1-b784-5b33-a59e-5eed97493d6b',
  'f32422c8-86ca-5717-af63-6efa55761c63',
  'trade_published_base',
  null,
  'purchase',
  12,
  null,
  null,
  false,
  false,
  5.39,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-trade-1y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'd1cd4282-a472-5a49-8424-beeeaf4a0b2e',
  'f32422c8-86ca-5717-af63-6efa55761c63',
  'trade_published_base',
  null,
  'purchase',
  36,
  null,
  null,
  false,
  false,
  5.59,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-trade-3y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '1b2c5555-6696-5f38-a63a-168b5f7fbcb4',
  'f32422c8-86ca-5717-af63-6efa55761c63',
  'trade_published_base',
  null,
  'purchase',
  60,
  null,
  null,
  false,
  false,
  5.69,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-trade-5y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '1b08db70-9200-5e71-baf1-b427364bc659',
  'f32422c8-86ca-5717-af63-6efa55761c63',
  'trade_published_base',
  null,
  'purchase',
  84,
  null,
  null,
  false,
  false,
  5.99,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-trade-7y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e96557fa-7ec7-56b3-bf45-c49beaafde79',
  'f32422c8-86ca-5717-af63-6efa55761c63',
  'trade_published_base',
  null,
  'purchase',
  120,
  null,
  null,
  false,
  false,
  6.19,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-trade-10y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'bf977e76-f11b-517d-ae53-cf6f2dd8c4b2',
  '25864e97-a23c-5318-9c5d-a8c06912ea5f',
  'trade_published_base',
  null,
  'non_purpose',
  12,
  null,
  null,
  false,
  false,
  5.19,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-american-1y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '0eb16466-e525-56cf-9bc1-f611c7fda17f',
  '25864e97-a23c-5318-9c5d-a8c06912ea5f',
  'trade_published_base',
  null,
  'non_purpose',
  36,
  null,
  null,
  false,
  false,
  5.39,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-american-3y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '37b72d88-00a9-52d8-958b-78b31cd0be72',
  '25864e97-a23c-5318-9c5d-a8c06912ea5f',
  'trade_published_base',
  null,
  'non_purpose',
  60,
  null,
  null,
  false,
  false,
  5.49,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-american-5y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'ab8f9639-e56f-5268-8fb9-70cc9a084878',
  '25864e97-a23c-5318-9c5d-a8c06912ea5f',
  'trade_published_base',
  null,
  'non_purpose',
  84,
  null,
  null,
  false,
  false,
  5.79,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-american-7y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '21a15f35-4326-5fd1-830e-cf4c327cf9a3',
  '25864e97-a23c-5318-9c5d-a8c06912ea5f',
  'trade_published_base',
  null,
  'non_purpose',
  120,
  null,
  null,
  false,
  false,
  5.99,
  'standard',
  null,
  null,
  '2026-07-23T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  '[manifest:moneta-american-10y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '7aeda71c-3d01-5aa9-8b76-02c649002c31',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'advertised_with_ppi_and_active_account_ltv_le_80',
  'Advertised-from (ltv_le_80) with repayment insurance + active repayment account',
  'purchase',
  24,
  0,
  80,
  false,
  false,
  5.09,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '4642db37-5575-5296-a827-889cce9805e6',
  '[manifest:uc-purpose-2y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '35d765b8-c850-517d-b86a-a35c6cc79c5c',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'advertised_with_ppi_and_active_account_ltv_gt80_90',
  'Advertised-from (ltv_gt80_90) with repayment insurance + active repayment account',
  'purchase',
  24,
  80,
  90,
  true,
  false,
  5.59,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '4642db37-5575-5296-a827-889cce9805e6',
  '[manifest:uc-purpose-2y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'b677567b-7f46-5e03-b61e-0ad7c1c884b8',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'advertised_with_ppi_and_active_account_ltv_le_80',
  'Advertised-from (ltv_le_80) with repayment insurance + active repayment account',
  'purchase',
  36,
  0,
  80,
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
  '4642db37-5575-5296-a827-889cce9805e6',
  '[manifest:uc-purpose-3y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '25b51acc-905f-5695-a866-8b8fc9dddeb5',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'advertised_with_ppi_and_active_account_ltv_gt80_90',
  'Advertised-from (ltv_gt80_90) with repayment insurance + active repayment account',
  'purchase',
  36,
  80,
  90,
  true,
  false,
  5.69,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '4642db37-5575-5296-a827-889cce9805e6',
  '[manifest:uc-purpose-3y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'ba82cf3a-dad0-5f6b-ad20-088d082208df',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'advertised_with_ppi_and_active_account_ltv_le_80',
  'Advertised-from (ltv_le_80) with repayment insurance + active repayment account',
  'purchase',
  60,
  0,
  80,
  false,
  false,
  5.59,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '4642db37-5575-5296-a827-889cce9805e6',
  '[manifest:uc-purpose-5y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '6d0f2036-1cb1-568f-bfc0-031bc5c515b0',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'advertised_with_ppi_and_active_account_ltv_gt80_90',
  'Advertised-from (ltv_gt80_90) with repayment insurance + active repayment account',
  'purchase',
  60,
  80,
  90,
  true,
  false,
  6.09,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '4642db37-5575-5296-a827-889cce9805e6',
  '[manifest:uc-purpose-5y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '458ebec8-9812-561e-9fcc-a22220fa2af3',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  12,
  null,
  null,
  false,
  false,
  5.14,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-1y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'a3fa982d-8018-5085-b4eb-e43064b14135',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  24,
  null,
  null,
  false,
  false,
  4.94,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-2y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e059011f-c62f-5062-9285-178869acfa9c',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  36,
  null,
  null,
  false,
  false,
  4.94,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-3y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '85d9846b-3c18-5219-9598-75b245ba6f95',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  48,
  null,
  null,
  false,
  false,
  5.04,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-4y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'c1803d60-36a5-55a9-a16b-5108be45ad9b',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  60,
  null,
  null,
  false,
  false,
  5.14,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-5y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e699579f-f3d7-54d8-a54e-c17c70a2fc7c',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  96,
  null,
  null,
  false,
  false,
  5.34,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-8y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'd9791f6b-9576-5b9c-a943-57c797b9668b',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  120,
  null,
  null,
  false,
  false,
  5.54,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-10y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'fb6cb740-8b21-52fa-a7fe-ed04a6a5d132',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  180,
  null,
  null,
  false,
  false,
  5.74,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-15y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e6b372f5-5b7a-53b9-8374-c3e7fc7dea42',
  'd821ac9c-2173-5bba-a8b8-2ab5a71f5584',
  'oznameni_account_ppi_budoucnost',
  'Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)',
  'purchase',
  240,
  null,
  null,
  false,
  false,
  5.94,
  'standard',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  'Do not mix with product-page headline od 5,09% (see HOLD collision). [manifest:cs-oznameni-20y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '3728c2da-b73e-5571-b700-46ac8ebd4541',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_le_80',
  'Minimální sazba dle sazebníku',
  'purchase',
  12,
  0,
  80,
  false,
  false,
  5.14,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-1y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'ec1eb016-3055-5c77-8335-fe7f04dedfe6',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_gt80_90',
  'Minimální sazba dle sazebníku',
  'purchase',
  12,
  80,
  90,
  true,
  false,
  5.54,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-1y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '64893db7-d065-5a0f-972b-98c23c5cb74e',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_le_80',
  'Minimální sazba dle sazebníku',
  'purchase',
  24,
  0,
  80,
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
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-2y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'a7667380-8169-5f27-86f3-6e9f241615c4',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_gt80_90',
  'Minimální sazba dle sazebníku',
  'purchase',
  24,
  80,
  90,
  true,
  false,
  5.59,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-2y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '1f7dcbe8-02ac-55b8-bc6b-3f881c42beae',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_le_80',
  'Minimální sazba dle sazebníku',
  'purchase',
  36,
  0,
  80,
  false,
  false,
  5.24,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-3y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'b483887c-a925-5841-9656-200ba9f4c99c',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_gt80_90',
  'Minimální sazba dle sazebníku',
  'purchase',
  36,
  80,
  90,
  true,
  false,
  5.64,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-3y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'dacdf90d-c4c8-5337-be34-d72b998d583b',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_le_80',
  'Minimální sazba dle sazebníku',
  'purchase',
  48,
  0,
  80,
  false,
  false,
  5.54,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-4y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '8fbcc5c7-6b8c-5735-836f-a6bcda61a3a1',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_gt80_90',
  'Minimální sazba dle sazebníku',
  'purchase',
  48,
  80,
  90,
  true,
  false,
  5.94,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-4y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e25a061d-b4cd-5729-8fa2-ccfb70e0d3a0',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_le_80',
  'Minimální sazba dle sazebníku',
  'purchase',
  60,
  0,
  80,
  false,
  false,
  5.74,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-5y-le80]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '48fa2ffa-5088-5a1a-a5cb-a1e823914b10',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  'minimum_rate_by_fixation_ltv_gt80_90',
  'Minimální sazba dle sazebníku',
  'purchase',
  60,
  80,
  90,
  true,
  false,
  6.14,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-mortgage-5y-gt80-90]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '660c77e9-eea3-51af-8448-0440aeed9cb3',
  '55ae593d-1eee-585f-b03c-ea6e7f91c72e',
  'minimum_rate_by_fixation_ltv_unspecified',
  'Minimální sazba dle sazebníku',
  'non_purpose',
  12,
  null,
  null,
  false,
  false,
  5.54,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-american-1y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '13089fca-e6cf-5b76-9545-beb1707fe714',
  '55ae593d-1eee-585f-b03c-ea6e7f91c72e',
  'minimum_rate_by_fixation_ltv_unspecified',
  'Minimální sazba dle sazebníku',
  'non_purpose',
  24,
  null,
  null,
  false,
  false,
  5.59,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-american-2y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'e746d67f-0048-504c-a6d4-8d385582c4fc',
  '55ae593d-1eee-585f-b03c-ea6e7f91c72e',
  'minimum_rate_by_fixation_ltv_unspecified',
  'Minimální sazba dle sazebníku',
  'non_purpose',
  36,
  null,
  null,
  false,
  false,
  5.64,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-american-3y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  'a4b3ea53-1153-575e-b4a9-dfd14f49b193',
  '55ae593d-1eee-585f-b03c-ea6e7f91c72e',
  'minimum_rate_by_fixation_ltv_unspecified',
  'Minimální sazba dle sazebníku',
  'non_purpose',
  48,
  null,
  null,
  false,
  false,
  5.94,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-american-4y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  '8df3b13f-a397-50d6-9cf1-0e14592c1a24',
  '55ae593d-1eee-585f-b03c-ea6e7f91c72e',
  'minimum_rate_by_fixation_ltv_unspecified',
  'Minimální sazba dle sazebníku',
  'non_purpose',
  60,
  null,
  null,
  false,
  false,
  6.14,
  'advertised_from',
  null,
  null,
  '2026-08-09T00:00:00.000Z',
  null,
  '2026-08-09T00:00:00.000Z',
  true,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  'From KB Oznámení matrix. Distinct from product-page conditional od 5,19%. [manifest:kb-american-5y]'
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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();

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
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();


-- 5) rate conditions (from IMPORT_READY rates only)

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'e3dd464f-4b67-51cd-b5e1-d3c7d5269a4c',
  'af639c30-f14f-5550-b270-829c3140c543',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '29dd6d42-ad30-518d-887a-ad44de5dcd31',
  'e845018e-d667-57fb-ba98-0350b617ed8f',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'ac12257e-839d-5c06-8d51-72577c733c63',
  '7503755a-dc14-55f4-9bfe-718e960fa613',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '571266d3-97e9-52c1-966e-744abb8b86fa',
  '85b58106-9e05-5eed-ae17-b94fb42ee2a7',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '1f43e747-ef6f-51e8-951e-29999e1c1ba8',
  'c114b6cf-2db1-5de5-aa7d-8c86a85750ba',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '3b9b75d6-e327-5a7d-ae6c-3e6e088ad409',
  'e2d46c51-7f99-52dd-b2f8-0d728f375b83',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '1bbc311e-966d-5388-b3b7-5043f7377f7e',
  '1c71398b-a1e6-5805-b870-b17e7fd7c81c',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '0ffe6afd-b836-5d30-b00c-c9b7880eb69e',
  '9ae2f476-2f99-5bd6-8351-a6f79faa8107',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '960776ed-b1b6-5bc1-b7d1-03939206b00e',
  '62c11932-7a8c-5681-bd4d-f9411534c01e',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'c5242d65-5667-5deb-9255-3d97f2bce2d6',
  '77781a6b-fc54-5e21-9924-48adc3c8154f',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '0e29d945-a195-5a0b-94a5-15da61b51cc4',
  '4a4f65f3-e668-54c3-9a3d-99c011c54758',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '7ce5b015-d616-51cf-9a2a-537a1411277c',
  'beb04d3a-5201-57e8-b68e-6e84f95d07d6',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '809647ba-97b9-5fcd-9d7f-f3e0b6ee8eba',
  '0fcd54ad-f1ea-5649-928d-03c77186c0f3',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'fdc6972a-cda0-5fbb-86e9-7f12a0370561',
  'fa36b9bd-1ebe-552a-ac77-57fbbbebfa5b',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'dcfbf413-a0fa-5a32-9236-a532d54670a2',
  '4591a38d-2603-5c27-af53-ab276d8255b4',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '5cabaf00-31e4-5c0b-8e07-9805a059344f',
  '7b5013a4-4c59-507b-a39f-5417b3358287',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '6f37ea8d-4de5-5c52-bb6e-c9ab5292f401',
  'e8da2ebc-ea84-5bfd-82e3-1f7955e63ca4',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'b39601e8-c6f2-519e-b010-3eaf1c45a0a9',
  '1dab61d2-6ef3-55cf-909f-870c4d6b7839',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'fb68af82-f1c4-5d95-b3fa-8c53500f5395',
  '42a3d860-ee74-558b-9148-3c7a1e9a030e',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'required_for_discount',
  null,
  null,
  null,
  null,
  -10,
  'PPI / repayment insurance — published effect −10 bp.',
  true,
  false,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '1764a69d-39c6-53c3-9d4c-13f491c9c000',
  '40917997-79a9-527e-a680-d0246580916c',
  'no_insurance',
  'qualifying',
  'none',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'Published rate without repayment insurance (PPI).',
  false,
  true,
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '2f2955a2-7897-5ff0-932d-ed5fd2f46c1e',
  '3d1142db-cd37-55cf-ba76-45396d7c982a',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  -50,
  'Active account — published effect −50 bp (included in housing published rates).',
  true,
  false,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '9e3978d5-4ade-527b-9da2-132a5f8371a3',
  '3d1142db-cd37-55cf-ba76-45396d7c982a',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'optional',
  null,
  null,
  null,
  null,
  -20,
  'Optional repayment insurance — published effect −20 bp (housing).',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '336f80d8-b630-5748-aabb-de0bea911833',
  'cda6d59c-4458-520a-9e41-fa32e39d403d',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  -50,
  'Active account — published effect −50 bp (included in housing published rates).',
  true,
  false,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '624fb459-838d-5aba-8fe2-576ac6aa6986',
  'cda6d59c-4458-520a-9e41-fa32e39d403d',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'optional',
  null,
  null,
  null,
  null,
  -20,
  'Optional repayment insurance — published effect −20 bp (housing).',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '8139d9fa-18c1-5998-b83d-64306eb5121d',
  '8dc1232d-846c-5c85-900d-d01d79748124',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  -50,
  'Active account — published effect −50 bp (included in housing published rates).',
  true,
  false,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '45b3071e-1ba1-54f2-9458-3d1ed071cf43',
  '8dc1232d-846c-5c85-900d-d01d79748124',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'optional',
  null,
  null,
  null,
  null,
  -20,
  'Optional repayment insurance — published effect −20 bp (housing).',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '216ca10f-e7df-586e-a46e-7252d5f58b0d',
  'bd50523e-f58f-564d-96b2-5744ecda3d25',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  -50,
  'Active account — published effect −50 bp (included in housing published rates).',
  true,
  false,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '25e74c03-b6cf-59f0-b990-ada5946f52be',
  'bd50523e-f58f-564d-96b2-5744ecda3d25',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'optional',
  null,
  null,
  null,
  null,
  -20,
  'Optional repayment insurance — published effect −20 bp (housing).',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '431cfe2e-ae54-5e81-8de2-92a33ef876ae',
  '6b8d96c4-cf32-5c57-8244-2274a24a6acf',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  -50,
  'Active account — published effect −50 bp (included in housing published rates).',
  true,
  false,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'b9c57103-a790-5267-a358-0144f4dcf72c',
  '6b8d96c4-cf32-5c57-8244-2274a24a6acf',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'optional',
  null,
  null,
  null,
  null,
  -20,
  'Optional repayment insurance — published effect −20 bp (housing).',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '04ca2754-07d8-53b1-acbc-2e001464ca87',
  '3e9dc5b1-b784-5b33-a59e-5eed97493d6b',
  'repayment_insurance',
  'qualifying',
  'repayment',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'PPI discount does NOT apply to published Trade/entrepreneur mortgage rates.',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'f89a9732-d82d-521d-98c7-e1e38a0bcba2',
  'd1cd4282-a472-5a49-8424-beeeaf4a0b2e',
  'repayment_insurance',
  'qualifying',
  'repayment',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'PPI discount does NOT apply to published Trade/entrepreneur mortgage rates.',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '7e0964f8-ed3a-5be2-8b32-a106e737a51a',
  '1b2c5555-6696-5f38-a63a-168b5f7fbcb4',
  'repayment_insurance',
  'qualifying',
  'repayment',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'PPI discount does NOT apply to published Trade/entrepreneur mortgage rates.',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '598ca616-4ef3-5341-b5c6-c9c161d1fa6b',
  '1b08db70-9200-5e71-baf1-b427364bc659',
  'repayment_insurance',
  'qualifying',
  'repayment',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'PPI discount does NOT apply to published Trade/entrepreneur mortgage rates.',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'a877ffe5-7718-5f22-ab43-b05ae0741803',
  'e96557fa-7ec7-56b3-bf45-c49beaafde79',
  'repayment_insurance',
  'qualifying',
  'repayment',
  'not_applicable',
  null,
  null,
  null,
  null,
  null,
  'PPI discount does NOT apply to published Trade/entrepreneur mortgage rates.',
  false,
  true,
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '3cc2b78a-b28d-59c7-a723-ce98d455d0b4',
  '7aeda71c-3d01-5aa9-8b76-02c649002c31',
  'repayment_insurance',
  'required',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Repayment insurance required for these published advertised rates. No explicit numeric PPI rate_effect_bp in evidence.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '6b9457ea-7224-54e8-b92b-8652d961ab94',
  '7aeda71c-3d01-5aa9-8b76-02c649002c31',
  'active_account_required',
  'required',
  null,
  null,
  null,
  null,
  'monthly_inflow>=1.5x_annuity AND card_payments_per_month>=3',
  null,
  null,
  'Active repayment account required. Monthly inflow >= 1.5× annuity payment AND >= 3 card payments/month.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'c8f9161b-8069-5033-a481-1b2996077e7f',
  '35d765b8-c850-517d-b86a-a35c6cc79c5c',
  'repayment_insurance',
  'required',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Repayment insurance required for these published advertised rates. No explicit numeric PPI rate_effect_bp in evidence.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '0a142f7f-dbcf-56f0-a65c-7e6f8bd88df1',
  '35d765b8-c850-517d-b86a-a35c6cc79c5c',
  'active_account_required',
  'required',
  null,
  null,
  null,
  null,
  'monthly_inflow>=1.5x_annuity AND card_payments_per_month>=3',
  null,
  null,
  'Active repayment account required. Monthly inflow >= 1.5× annuity payment AND >= 3 card payments/month.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'dc7b79b3-8214-57d3-a11d-08a1caa14dd1',
  'b677567b-7f46-5e03-b61e-0ad7c1c884b8',
  'repayment_insurance',
  'required',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Repayment insurance required for these published advertised rates. No explicit numeric PPI rate_effect_bp in evidence.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'a94bfa1e-92f1-5e7f-93cf-0bcb035bd3a1',
  'b677567b-7f46-5e03-b61e-0ad7c1c884b8',
  'active_account_required',
  'required',
  null,
  null,
  null,
  null,
  'monthly_inflow>=1.5x_annuity AND card_payments_per_month>=3',
  null,
  null,
  'Active repayment account required. Monthly inflow >= 1.5× annuity payment AND >= 3 card payments/month.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'd8048e96-0117-5905-8a37-0db332adb1a7',
  '25b51acc-905f-5695-a866-8b8fc9dddeb5',
  'repayment_insurance',
  'required',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Repayment insurance required for these published advertised rates. No explicit numeric PPI rate_effect_bp in evidence.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'c3cc0291-bf09-501b-8ce3-fca7e1c151f1',
  '25b51acc-905f-5695-a866-8b8fc9dddeb5',
  'active_account_required',
  'required',
  null,
  null,
  null,
  null,
  'monthly_inflow>=1.5x_annuity AND card_payments_per_month>=3',
  null,
  null,
  'Active repayment account required. Monthly inflow >= 1.5× annuity payment AND >= 3 card payments/month.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'c4f2cf6b-ad24-5617-88a2-ce124e510f73',
  'ba82cf3a-dad0-5f6b-ad20-088d082208df',
  'repayment_insurance',
  'required',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Repayment insurance required for these published advertised rates. No explicit numeric PPI rate_effect_bp in evidence.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '9c20d8ba-6772-57f2-86e1-ec835d964c2c',
  'ba82cf3a-dad0-5f6b-ad20-088d082208df',
  'active_account_required',
  'required',
  null,
  null,
  null,
  null,
  'monthly_inflow>=1.5x_annuity AND card_payments_per_month>=3',
  null,
  null,
  'Active repayment account required. Monthly inflow >= 1.5× annuity payment AND >= 3 card payments/month.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '6377fd76-aa9a-52bd-84f1-5acedb7ce2ab',
  '6d0f2036-1cb1-568f-bfc0-031bc5c515b0',
  'repayment_insurance',
  'required',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Repayment insurance required for these published advertised rates. No explicit numeric PPI rate_effect_bp in evidence.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'd1ba5d9b-d952-5870-a5be-bdf772515c1b',
  '6d0f2036-1cb1-568f-bfc0-031bc5c515b0',
  'active_account_required',
  'required',
  null,
  null,
  null,
  null,
  'monthly_inflow>=1.5x_annuity AND card_payments_per_month>=3',
  null,
  null,
  'Active repayment account required. Monthly inflow >= 1.5× annuity payment AND >= 3 card payments/month.',
  true,
  false,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'c22b2309-c8c0-5a99-a92f-af5676e1a724',
  '458ebec8-9812-561e-9fcc-a22220fa2af3',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '9fc24658-fc69-58c8-9eae-b3172346cc2f',
  '458ebec8-9812-561e-9fcc-a22220fa2af3',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '411d695b-f6ea-51aa-ad10-751ec31a1ffc',
  '458ebec8-9812-561e-9fcc-a22220fa2af3',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '040329ac-abde-59a1-8604-b5e330b15662',
  'a3fa982d-8018-5085-b4eb-e43064b14135',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '812484e1-83cf-5a24-87cc-7e47364bbd54',
  'a3fa982d-8018-5085-b4eb-e43064b14135',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '77a3d6fe-a7ad-5969-84d7-4cd035aa4f74',
  'a3fa982d-8018-5085-b4eb-e43064b14135',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'b445ee55-cd6c-59ff-9dd1-c98ea2cab147',
  'e059011f-c62f-5062-9285-178869acfa9c',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'caf71e45-6e67-5d5d-819e-caf51d8af943',
  'e059011f-c62f-5062-9285-178869acfa9c',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'e71afd95-e872-5a22-bb37-0948e364467b',
  'e059011f-c62f-5062-9285-178869acfa9c',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '6b122c6a-ae57-5c32-a4d2-1b66bdc011f0',
  '85d9846b-3c18-5219-9598-75b245ba6f95',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '5db38f76-fca1-5f15-8917-912f413ca1bc',
  '85d9846b-3c18-5219-9598-75b245ba6f95',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '443dc64a-880c-5782-b6f5-6b7055d444e5',
  '85d9846b-3c18-5219-9598-75b245ba6f95',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '45e6b701-d924-5ed1-91d2-1f78b5960ca7',
  'c1803d60-36a5-55a9-a16b-5108be45ad9b',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'dfa15750-8f36-544b-bcc5-718dcfb9a224',
  'c1803d60-36a5-55a9-a16b-5108be45ad9b',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '9d6b5a6b-0fbe-5087-bd45-b1f14d3e332e',
  'c1803d60-36a5-55a9-a16b-5108be45ad9b',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'bb9d4a37-0c5a-57f2-a392-15642680b74f',
  'e699579f-f3d7-54d8-a54e-c17c70a2fc7c',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'aa68317b-6043-549d-a3a1-14edd08233cd',
  'e699579f-f3d7-54d8-a54e-c17c70a2fc7c',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '34443f58-a68d-5146-b54d-b46a7297ee1d',
  'e699579f-f3d7-54d8-a54e-c17c70a2fc7c',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '704f22fd-9d0f-59a0-801a-004447986cd3',
  'd9791f6b-9576-5b9c-a943-57c797b9668b',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '1e9ccde8-89ba-593b-a6a0-64712dd83463',
  'd9791f6b-9576-5b9c-a943-57c797b9668b',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '493ebe26-4f57-59a9-874f-c754ad50b22f',
  'd9791f6b-9576-5b9c-a943-57c797b9668b',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'b2e1cbe8-01f3-552e-ad8f-b1b9ff6d4d77',
  'fb6cb740-8b21-52fa-a7fe-ed04a6a5d132',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '5455b5dd-5e2a-5915-b742-acb91e7202e8',
  'fb6cb740-8b21-52fa-a7fe-ed04a6a5d132',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '52f08720-19a2-50f7-b3fd-fbec92c64e6f',
  'fb6cb740-8b21-52fa-a7fe-ed04a6a5d132',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'ebb77c07-7f90-518d-b934-512dd8742cc8',
  'e6b372f5-5b7a-53b9-8374-c3e7fc7dea42',
  'active_account_required',
  'published_discount',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '7f841f7d-1c33-51b7-aa41-841552d4ced8',
  'e6b372f5-5b7a-53b9-8374-c3e7fc7dea42',
  'repayment_insurance',
  'published_discount',
  'repayment',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  true,
  false,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '69ce0786-a22e-5c44-917c-87bce550da60',
  'e6b372f5-5b7a-53b9-8374-c3e7fc7dea42',
  'other',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.',
  false,
  true,
  '467c05fd-0729-57a1-b4f0-060eee6fa49e',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'fbf7b176-3aa9-5716-8bac-cfe72ccaf67a',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'income_domiciliation_required',
  'qualifying',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Směřování příjmů na účet vedený u KB',
  true,
  false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'dce95499-da20-5ae1-ac18-4da20dca0125',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'life_insurance_required',
  'qualifying',
  'life',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Rizikové životní pojištění u Komerční pojišťovny, a. s.',
  true,
  false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  'aaf99ca9-99ec-5fdd-909b-e4e560305c7b',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'property_insurance_required',
  'qualifying',
  'property',
  'mandatory_for_rate',
  null,
  null,
  null,
  null,
  null,
  'Pojištění zastavené nemovitosti u Komerční pojišťovny, a. s.',
  true,
  false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  '49206581-517a-5751-ae91-f295d5bd3b52',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  'PENB_class_requirement',
  'qualifying',
  null,
  null,
  null,
  null,
  'A|B',
  null,
  null,
  'PENB energetická třída A nebo B k zastavené nemovitosti',
  true,
  false,
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();


-- 6) product fees (insurance % of payment kept as text; amount NULL)

insert into public.mortgage_product_fees (
  id, product_id, rate_variant_id, fee_type, amount, currency, frequency,
  is_mandatory, description, checked_at, source_evidence_id, is_active, valid_from
) values (
  '4035410d-46cd-5d6e-b5bd-3de477b1ca08',
  '21348311-a3f4-5e86-877d-732aba85bac8',
  null,
  'insurance_repayment',
  null,
  'CZK',
  'monthly',
  false,
  'PPI cost = 8.7% of current/prescribed monthly mortgage payment (published). Not merged into nominal interest. Published share of monthly payment: 8.7%. Amount left NULL (not converted to fixed CZK).',
  '2026-08-09T00:00:00.000Z',
  '2f7deb25-4be2-5763-854e-826c4bbda866',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  fee_type = excluded.fee_type,
  amount = excluded.amount,
  currency = excluded.currency,
  frequency = excluded.frequency,
  is_mandatory = excluded.is_mandatory,
  description = excluded.description,
  checked_at = excluded.checked_at,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_product_fees (
  id, product_id, rate_variant_id, fee_type, amount, currency, frequency,
  is_mandatory, description, checked_at, source_evidence_id, is_active, valid_from
) values (
  'd58baa21-a03e-5b9e-b490-5b6ad0e4efac',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  null,
  'insurance_repayment',
  null,
  'CZK',
  'monthly',
  false,
  'PPI cost = 10.99% of monthly payment (published). Not merged into nominal interest. Published share of monthly payment: 10.99%. Amount left NULL (not converted to fixed CZK).',
  '2026-08-09T00:00:00.000Z',
  '6186cf87-157c-5912-85ea-9de81f9aaa3d',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  fee_type = excluded.fee_type,
  amount = excluded.amount,
  currency = excluded.currency,
  frequency = excluded.frequency,
  is_mandatory = excluded.is_mandatory,
  description = excluded.description,
  checked_at = excluded.checked_at,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();


-- 7) representative examples (IMPORT_READY published examples only)

insert into public.mortgage_representative_examples (
  id, product_id, rate_variant_id, loan_amount, term_years, fixation_months,
  nominal_rate, rpsn, monthly_payment, total_amount_payable, number_of_payments,
  included_fees, insurance_included, insurance_cost, account_cost,
  representative_example_text, checked_at, valid_from, source_evidence_id, is_active
) values (
  'c9868347-f7db-5eb4-80af-9c6ddcbe90a4',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  'cda6d59c-4458-520a-9e41-fa32e39d403d',
  2500000,
  30,
  36,
  4.99,
  6.11,
  13405,
  5374722,
  360,
  null,
  true,
  1474,
  null,
  'Published representative example [with_repayment_insurance] [manifest:moneta-rpsn-with-ppi]',
  '2026-08-09T00:00:00.000Z',
  '2026-08-09T00:00:00.000Z',
  '7ba4ea56-eb7a-5c7a-be47-564c78de33a6',
  true
)
on conflict (id) do update set
  rate_variant_id = excluded.rate_variant_id,
  loan_amount = excluded.loan_amount,
  term_years = excluded.term_years,
  fixation_months = excluded.fixation_months,
  nominal_rate = excluded.nominal_rate,
  rpsn = excluded.rpsn,
  monthly_payment = excluded.monthly_payment,
  total_amount_payable = excluded.total_amount_payable,
  number_of_payments = excluded.number_of_payments,
  insurance_included = excluded.insurance_included,
  insurance_cost = excluded.insurance_cost,
  account_cost = excluded.account_cost,
  representative_example_text = excluded.representative_example_text,
  checked_at = excluded.checked_at,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_representative_examples (
  id, product_id, rate_variant_id, loan_amount, term_years, fixation_months,
  nominal_rate, rpsn, monthly_payment, total_amount_payable, number_of_payments,
  included_fees, insurance_included, insurance_cost, account_cost,
  representative_example_text, checked_at, valid_from, source_evidence_id, is_active
) values (
  'e3e8d16a-d850-5c6d-a69c-47c9879ce43c',
  '6b2c007b-f774-5dde-aaa0-94cadcb9dc97',
  null,
  2500000,
  30,
  36,
  5.19,
  5.33,
  13712,
  4953903,
  360,
  null,
  false,
  null,
  null,
  'Published representative example [without_repayment_insurance] [manifest:moneta-rpsn-without-ppi]',
  '2026-08-09T00:00:00.000Z',
  '2026-08-09T00:00:00.000Z',
  '7ba4ea56-eb7a-5c7a-be47-564c78de33a6',
  true
)
on conflict (id) do update set
  rate_variant_id = excluded.rate_variant_id,
  loan_amount = excluded.loan_amount,
  term_years = excluded.term_years,
  fixation_months = excluded.fixation_months,
  nominal_rate = excluded.nominal_rate,
  rpsn = excluded.rpsn,
  monthly_payment = excluded.monthly_payment,
  total_amount_payable = excluded.total_amount_payable,
  number_of_payments = excluded.number_of_payments,
  insurance_included = excluded.insurance_included,
  insurance_cost = excluded.insurance_cost,
  account_cost = excluded.account_cost,
  representative_example_text = excluded.representative_example_text,
  checked_at = excluded.checked_at,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_representative_examples (
  id, product_id, rate_variant_id, loan_amount, term_years, fixation_months,
  nominal_rate, rpsn, monthly_payment, total_amount_payable, number_of_payments,
  included_fees, insurance_included, insurance_cost, account_cost,
  representative_example_text, checked_at, valid_from, source_evidence_id, is_active
) values (
  '0ee2ceb5-8d3a-5a12-ae05-df1ae492e424',
  '53f176ac-6488-507e-b02a-82eeb07477a6',
  '9b762b00-7f77-53e2-b5c9-14a6b113853c',
  4000000,
  30,
  36,
  5.19,
  5.34,
  21966,
  7903819.83,
  360,
  null,
  null,
  null,
  null,
  'Published representative example [product_page_advertised_from_conditional] [manifest:kb-product-page-representative-example]',
  '2026-08-09T00:00:00.000Z',
  '2026-08-09T00:00:00.000Z',
  'ea271d28-bc5a-5e71-a91d-6502192c41ad',
  true
)
on conflict (id) do update set
  rate_variant_id = excluded.rate_variant_id,
  loan_amount = excluded.loan_amount,
  term_years = excluded.term_years,
  fixation_months = excluded.fixation_months,
  nominal_rate = excluded.nominal_rate,
  rpsn = excluded.rpsn,
  monthly_payment = excluded.monthly_payment,
  total_amount_payable = excluded.total_amount_payable,
  number_of_payments = excluded.number_of_payments,
  insurance_included = excluded.insurance_included,
  insurance_cost = excluded.insurance_cost,
  account_cost = excluded.account_cost,
  representative_example_text = excluded.representative_example_text,
  checked_at = excluded.checked_at,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();


-- 8) eligibility rules (verified/import-ready; no automatic pricing)

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  '38b8dd73-4d78-5790-88a2-d592956adc36',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  null,
  'income',
  'foreign_income_or_residence',
  'manual_assessment',
  'Mortgage treated as foreign-currency mortgage when at least one applicant has foreign-currency income or residence outside CZ; loan remains in CZK. No automatic rate change.',
  false,
  null,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  '783de3e8-f3a4-5d73-aaa6-ae9f6d2be991',
  'c256f92b-1363-5269-ad3f-c92f6f685dfe',
  null,
  'regulatory',
  'max_amount',
  'max_amount',
  'Max amount 20,000,000 CZK.',
  false,
  null,
  '4c39a68d-cecf-52a2-9678-084f2d94aac4',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  '736a675e-0d63-59a7-8221-3dae6e2e1288',
  'c256f92b-1363-5269-ad3f-c92f6f685dfe',
  null,
  'regulatory',
  'max_ltv',
  'max_ltv',
  'Max product LTV 90%. Not a rate pricing band.',
  false,
  null,
  '4c39a68d-cecf-52a2-9678-084f2d94aac4',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  '079ab194-517f-5c36-8bcd-dd77728284b9',
  'f564aaac-5892-5c77-b1e7-854e0b420cbe',
  null,
  'regulatory',
  'max_ltv',
  'max_ltv',
  'Max product LTV 70%.',
  false,
  null,
  '4c39a68d-cecf-52a2-9678-084f2d94aac4',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  'a4b44313-8cd7-54c3-ba29-c45aa40e4000',
  '27191d0b-5002-53d0-8b1b-f1fb7817fb0e',
  null,
  'income',
  'annual_turnover_300k_to_100m',
  'eligible',
  'Annual turnover 300,000 to 100,000,000 CZK.',
  false,
  null,
  '4c39a68d-cecf-52a2-9678-084f2d94aac4',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  'f985eca2-d6c8-58bf-93c8-637b6198ed28',
  '55ae593d-1eee-585f-b03c-ea6e7f91c72e',
  null,
  'regulatory',
  'max_ltv',
  'max_ltv',
  'Max product LTV 70% (product eligibility — not rate LTV).',
  false,
  null,
  'dc8f3ec4-9079-5494-b1e4-98e209cf339f',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  '30912cab-32de-5594-a849-a0b93b26a273',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  '7aeda71c-3d01-5aa9-8b76-02c649002c31',
  'income',
  'foreign_income_or_residence',
  'manual_assessment',
  'Treated as foreign-currency mortgage when at least one applicant has income in a foreign currency or residence outside CZ; loan remains in CZK. Eligibility only — no automatic pricing impact.',
  false,
  null,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  'd28556f6-31bb-5141-9719-72a02fea0b64',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  '35d765b8-c850-517d-b86a-a35c6cc79c5c',
  'income',
  'foreign_income_or_residence',
  'manual_assessment',
  'Treated as foreign-currency mortgage when at least one applicant has income in a foreign currency or residence outside CZ; loan remains in CZK. Eligibility only — no automatic pricing impact.',
  false,
  null,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  'b25e3e5a-f308-50a9-b46a-76214f668338',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'b677567b-7f46-5e03-b61e-0ad7c1c884b8',
  'income',
  'foreign_income_or_residence',
  'manual_assessment',
  'Treated as foreign-currency mortgage when at least one applicant has income in a foreign currency or residence outside CZ; loan remains in CZK. Eligibility only — no automatic pricing impact.',
  false,
  null,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  'c34b90f8-dce4-54dc-bbae-46980fce278c',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  '25b51acc-905f-5695-a866-8b8fc9dddeb5',
  'income',
  'foreign_income_or_residence',
  'manual_assessment',
  'Treated as foreign-currency mortgage when at least one applicant has income in a foreign currency or residence outside CZ; loan remains in CZK. Eligibility only — no automatic pricing impact.',
  false,
  null,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  '2b4d5e65-0ee3-58eb-b540-af579fbf845e',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  'ba82cf3a-dad0-5f6b-ad20-088d082208df',
  'income',
  'foreign_income_or_residence',
  'manual_assessment',
  'Treated as foreign-currency mortgage when at least one applicant has income in a foreign currency or residence outside CZ; loan remains in CZK. Eligibility only — no automatic pricing impact.',
  false,
  null,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();

insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  '7d79f3a5-ed1e-5666-a3c7-cc899ae9def8',
  '298b6e63-e369-5885-9717-5a3b0c8f2975',
  '6d0f2036-1cb1-568f-bfc0-031bc5c515b0',
  'income',
  'foreign_income_or_residence',
  'manual_assessment',
  'Treated as foreign-currency mortgage when at least one applicant has income in a foreign currency or residence outside CZ; loan remains in CZK. Eligibility only — no automatic pricing impact.',
  false,
  null,
  '4642db37-5575-5296-a827-889cce9805e6',
  true,
  '2026-08-09T00:00:00.000Z'
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();


-- 9) market benchmarks: none in this verified manifest


-- Post-insert assertions inside the same transaction
do $$
declare
  rate_n int;
  missing_ev int;
  one_sided int;
  bad_rate int;
  bad_fix int;
  dupes int;
  cs_494 int;
  kb_514 int;
  csob_n int;
  rb_klasik_n int;
begin
  select count(*) into rate_n from public.mortgage_rate_variants where is_active and notes like '%[manifest:%';
  if rate_n <> 66 then
    raise exception 'IMPORT ASSERT: expected 66 manifest rates, found %', rate_n;
  end if;

  select count(*) into missing_ev
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%' and source_evidence_id is null;
  if missing_ev <> 0 then
    raise exception 'IMPORT ASSERT: % rates missing evidence', missing_ev;
  end if;

  select count(*) into one_sided
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%'
    and ((ltv_min is null) <> (ltv_max is null));
  if one_sided <> 0 then
    raise exception 'IMPORT ASSERT: one-sided LTV present';
  end if;

  select count(*) into bad_rate
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%'
    and (nominal_interest_rate <= 0 or nominal_interest_rate >= 30);
  if bad_rate <> 0 then
    raise exception 'IMPORT ASSERT: invalid nominal rate';
  end if;

  select count(*) into bad_fix
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%'
    and fixation_months is not null
    and fixation_months <= 0;
  if bad_fix <> 0 then
    raise exception 'IMPORT ASSERT: invalid fixation';
  end if;

  select count(*) into dupes from (
    select 1
    from public.mortgage_rate_variants
    where is_active
    group by product_id, coalesce(fixation_months, (-1)),
      coalesce(ltv_min, (-1)::numeric), coalesce(ltv_max, (-1)::numeric),
      ltv_min_exclusive, ltv_max_exclusive, pricing_scenario_key, rate_type,
      coalesce(financing_purpose, ''),
      coalesce(min_loan_amount, (-1)::numeric), coalesce(max_loan_amount, (-1)::numeric)
    having count(*) > 1
  ) d;
  if dupes <> 0 then
    raise exception 'IMPORT ASSERT: duplicate active identities: %', dupes;
  end if;

  -- Current CS Oznámení 3y must be 4.94 (not stale 5.09)
  select count(*) into cs_494 from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'ceska-sporitelna'
    and v.fixation_months = 36
    and v.nominal_interest_rate = 4.94
    and v.pricing_scenario_key = 'oznameni_account_ppi_budoucnost';
  if cs_494 <> 1 then raise exception 'IMPORT ASSERT: expected CS 3y Oznámení 4.94'; end if;

  -- Stale KB 3y 5.39 must be gone; current 5.24 must exist
  select count(*) into kb_514 from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'komercni-banka'
    and v.fixation_months = 36
    and v.nominal_interest_rate = 5.39;
  if kb_514 <> 0 then raise exception 'IMPORT ASSERT: stale KB 3y 5.39 still active'; end if;

  select count(*) into csob_n from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'csob';
  if csob_n <> 0 then raise exception 'IMPORT ASSERT: CSOB rates imported'; end if;

  select count(*) into rb_klasik_n from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'raiffeisenbank' and p.slug = 'retail-klasik';
  if rb_klasik_n <> 0 then raise exception 'IMPORT ASSERT: RB Klasik rates imported'; end if;
end $$;

commit;
