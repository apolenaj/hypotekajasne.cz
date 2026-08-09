-- Phase 2: central illustrative / reference mortgage rates (Hypotéka Jasně)
-- Additive only — does NOT replace bank_rates / current_rates or switch the UI.
--
-- Product meaning:
--   Rows are ORIENTAČNÍ / MODEL / market_reference rates reviewed manually (~weekly).
--   They are NOT guaranteed bank offers, personalised quotes, or "best rates".
--   Forbidden rate_kind values: guaranteed, offer, and similar.
--
-- History:
--   Manual updates MUST insert a new row and deactivate the previous active row
--   (is_active=false, valid_to=<update ts>). Never overwrite historical rates in place.
--
-- RLS approach (selected):
--   RLS enabled with NO anon/authenticated policies.
--   Browser clients cannot SELECT/INSERT/UPDATE/DELETE.
--   Reads go through a server-side service using SUPABASE_SERVICE_ROLE_KEY
--   (bypasses RLS). Service-role key must never ship to the client.
--
-- Apply in Supabase SQL Editor, then:
--   notify pgrst, 'reload schema';

create extension if not exists "pgcrypto";

create table if not exists public.mortgage_rates (
  id uuid primary key default gen_random_uuid(),
  country_code text not null default 'CZ',
  purpose text not null default 'purchase',
  fixation_years integer not null,
  ltv_min numeric(5, 2) not null default 0,
  ltv_max numeric(5, 2) not null default 80,
  -- Boundary flags (app selection): minExclusive → ltv > ltv_min; maxExclusive → ltv < ltv_max
  -- CZ standard: <=80 uses (0,80,false,false); >80–90 uses (80,90,true,false)
  ltv_min_exclusive boolean not null default false,
  ltv_max_exclusive boolean not null default false,
  rate numeric(6, 3) not null,
  rate_kind text not null default 'illustrative',
  provider_name text null,
  source_name text null,
  source_url text null,
  checked_at timestamptz not null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz null,
  is_active boolean not null default true,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mortgage_rates_fixation_years_positive
    check (fixation_years > 0),
  constraint mortgage_rates_rate_bounds
    check (rate > 0 and rate < 30),
  constraint mortgage_rates_ltv_range
    check (ltv_min >= 0 and ltv_max <= 100 and ltv_min < ltv_max),
  constraint mortgage_rates_valid_window
    check (valid_to is null or valid_to > valid_from),
  constraint mortgage_rates_rate_kind_known
    check (rate_kind in ('illustrative', 'model', 'market_reference')),
  constraint mortgage_rates_purpose_known
    check (purpose in ('purchase', 'refinance', 'investment'))
);

alter table public.mortgage_rates
  add column if not exists ltv_min_exclusive boolean not null default false;

alter table public.mortgage_rates
  add column if not exists ltv_max_exclusive boolean not null default false;

-- Idempotent constraint refresh if an older draft of this table already exists.
alter table public.mortgage_rates
  drop constraint if exists mortgage_rates_rate_positive;
alter table public.mortgage_rates
  drop constraint if exists mortgage_rates_rate_bounds;
alter table public.mortgage_rates
  add constraint mortgage_rates_rate_bounds
    check (rate > 0 and rate < 30);

alter table public.mortgage_rates
  drop constraint if exists mortgage_rates_ltv_range;
alter table public.mortgage_rates
  add constraint mortgage_rates_ltv_range
    check (ltv_min >= 0 and ltv_max <= 100 and ltv_min < ltv_max);

alter table public.mortgage_rates
  drop constraint if exists mortgage_rates_rate_kind_known;
alter table public.mortgage_rates
  add constraint mortgage_rates_rate_kind_known
    check (rate_kind in ('illustrative', 'model', 'market_reference'));

alter table public.mortgage_rates
  drop constraint if exists mortgage_rates_purpose_known;
alter table public.mortgage_rates
  add constraint mortgage_rates_purpose_known
    check (purpose in ('purchase', 'refinance', 'investment'));

create index if not exists mortgage_rates_active_lookup_idx
  on public.mortgage_rates (
    country_code,
    purpose,
    fixation_years,
    is_active,
    checked_at desc
  );

create index if not exists mortgage_rates_validity_idx
  on public.mortgage_rates (valid_from, valid_to)
  where is_active = true;

-- One active reference rate per identity key. Inactive history rows remain free.
drop index if exists mortgage_rates_one_active_identity_uidx;
create unique index mortgage_rates_one_active_identity_uidx
  on public.mortgage_rates (
    country_code,
    purpose,
    fixation_years,
    ltv_min,
    ltv_max,
    ltv_min_exclusive,
    ltv_max_exclusive,
    rate_kind
  )
  where is_active = true;

create or replace function public.set_mortgage_rates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mortgage_rates_set_updated_at on public.mortgage_rates;
create trigger mortgage_rates_set_updated_at
  before update on public.mortgage_rates
  for each row
  execute function public.set_mortgage_rates_updated_at();

alter table public.mortgage_rates enable row level security;

-- Remove any earlier draft public-read policy (server-side reads only).
drop policy if exists "Allow public read active mortgage_rates"
  on public.mortgage_rates;

-- Intentionally NO policies for anon / authenticated.
-- Effect: browser PostgREST access is denied for all verbs.
-- Service role (server API) bypasses RLS for controlled reads/writes.

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- CZ slot architecture (NO invented production rates in this migration)
--
-- LTV boundary semantics (no gap, no overlap at exactly 80):
--   <= 80%      → ltv_min=0,  ltv_max=80, ltv_min_exclusive=false → ltv >= 0 && ltv <= 80
--   > 80–90%    → ltv_min=80, ltv_max=90, ltv_min_exclusive=true  → ltv > 80 && ltv <= 90
--
-- Do NOT use artificial 80.01 thresholds. Selection is done in app code with the flags.
--
-- PURCHASE (fill after external verification):
--   (purchase, 1/3/5y, 0–80 inclusive)
--   (purchase, 1/3/5y, >80–90)
--
-- REFINANCE (fill after external verification):
--   (refinance, 1y, 0–80), (refinance, 3y, 0–80), (refinance, 5y, 0–80)
--
-- INVESTMENT:
--   Structure supported in app types; leave empty until verified.
--
-- DO NOT INSERT made-up market rates here.
-- ---------------------------------------------------------------------------
-- Weekly owner workflow (Supabase → Table Editor) — no admin UI yet:
--
--   1) Verify orientational rate externally.
--   2) Find current ACTIVE matching row.
--   3) UPDATE: is_active = false, valid_to = NOW().
--   4) INSERT new row: same identity keys, new rate,
--      is_active = true, valid_from = NOW(),
--      checked_at = actual verification timestamp.
--   5) Confirm exactly one ACTIVE row for that identity.
--
-- History-preserving SQL sketch (replace :placeholders; never invent rates):
--
--   begin;
--   update public.mortgage_rates
--     set is_active = false,
--         valid_to = now()
--     where id = :old_id
--       and is_active = true;
--
--   insert into public.mortgage_rates (
--     country_code, purpose, fixation_years, ltv_min, ltv_max,
--     rate, rate_kind, source_name, checked_at, valid_from, is_active, notes
--   ) values (
--     'CZ', 'purchase', 3, 0, 80,
--     :verified_rate, 'illustrative', :source_name,
--     :verified_at, now(), true,
--     'Orientační referenční sazba — ne bankovní nabídka'
--   );
--   commit;
-- ---------------------------------------------------------------------------
