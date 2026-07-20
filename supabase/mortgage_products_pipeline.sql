-- Mortgage products production pipeline (HypotékaJasně.cz)
-- RAW → NORMALIZE → VALIDATE → ANOMALY → STAGING → PUBLISH → HISTORY
-- Spusťte v Supabase SQL Editoru.

create extension if not exists "pgcrypto";

-- ─── Published products (production read model) ─────────────────────────────
create table if not exists public.mortgage_products (
  id text primary key,
  country text not null default 'cz',
  lender text not null,
  product_name text not null,
  product_type text not null,
  purpose text not null,
  residency text not null default 'resident',
  currency text not null default 'CZK',
  rate_type text not null default 'fixed',
  fixation integer,
  ltv_min numeric,
  ltv_max numeric,
  loan_amount_min numeric,
  loan_amount_max numeric,
  term_min integer,
  term_max integer,
  nominal_rate_from numeric,
  representative_apr numeric,
  representative_example text,
  required_account boolean,
  required_insurance boolean,
  fees jsonb not null default '[]'::jsonb,
  source_url text,
  source_type text not null default 'official_bank',
  valid_from timestamptz,
  scraped_at timestamptz,
  verified_at timestamptz,
  status text not null default 'STALE'
    check (status in ('LIVE', 'VERIFIED', 'MODELLED', 'PARTNER_QUOTE', 'STALE')),
  confidence numeric not null default 0
    check (confidence >= 0 and confidence <= 1),
  raw_snapshot_hash text,
  pipeline_run_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mortgage_products_country_idx
  on public.mortgage_products (country);
create index if not exists mortgage_products_lender_idx
  on public.mortgage_products (lender);
create index if not exists mortgage_products_status_idx
  on public.mortgage_products (status);
create index if not exists mortgage_products_scraped_at_idx
  on public.mortgage_products (scraped_at desc);

-- ─── Staging (awaiting auto-publish or manual review) ───────────────────────
create table if not exists public.mortgage_products_staging (
  id text not null,
  pipeline_run_id uuid not null,
  payload jsonb not null,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected', 'auto_published', 'blocked')),
  anomaly_flags jsonb not null default '[]'::jsonb,
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  primary key (pipeline_run_id, id)
);

create index if not exists mortgage_products_staging_review_idx
  on public.mortgage_products_staging (review_status);

-- ─── History (every change) ─────────────────────────────────────────────────
create table if not exists public.mortgage_products_history (
  history_id uuid primary key default gen_random_uuid(),
  product_id text not null,
  pipeline_run_id uuid,
  change_type text not null
    check (change_type in ('created', 'updated', 'stale', 'disappeared', 'rejected', 'rollback')),
  previous_payload jsonb,
  next_payload jsonb,
  anomaly_flags jsonb not null default '[]'::jsonb,
  changed_at timestamptz not null default now()
);

create index if not exists mortgage_products_history_product_idx
  on public.mortgage_products_history (product_id, changed_at desc);

-- ─── Raw ingest snapshots ───────────────────────────────────────────────────
create table if not exists public.mortgage_products_raw (
  raw_id uuid primary key default gen_random_uuid(),
  pipeline_run_id uuid not null,
  lender text not null,
  source_url text,
  raw_payload jsonb not null,
  raw_snapshot_hash text not null,
  ingested_at timestamptz not null default now()
);

create index if not exists mortgage_products_raw_run_idx
  on public.mortgage_products_raw (pipeline_run_id);

-- ─── Pipeline runs + error log ──────────────────────────────────────────────
create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  trigger text not null default 'cron'
    check (trigger in ('cron', 'manual', 'api')),
  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'failed')),
  stage text,
  stats jsonb not null default '{}'::jsonb,
  error_log jsonb not null default '[]'::jsonb
);

-- ─── Alerts (anomaly / disappearance / stale) ───────────────────────────────
create table if not exists public.pipeline_alerts (
  id uuid primary key default gen_random_uuid(),
  pipeline_run_id uuid,
  product_id text,
  severity text not null default 'warning'
    check (severity in ('info', 'warning', 'critical')),
  alert_type text not null,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists pipeline_alerts_open_idx
  on public.pipeline_alerts (acknowledged, created_at desc);

-- RLS: public read published products only
alter table public.mortgage_products enable row level security;
alter table public.mortgage_products_staging enable row level security;
alter table public.mortgage_products_history enable row level security;
alter table public.mortgage_products_raw enable row level security;
alter table public.pipeline_runs enable row level security;
alter table public.pipeline_alerts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mortgage_products'
      and policyname = 'Allow public read mortgage_products'
  ) then
    create policy "Allow public read mortgage_products"
      on public.mortgage_products
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- Staging / history / raw / runs / alerts: service role only (no public policies)

notify pgrst, 'reload schema';
