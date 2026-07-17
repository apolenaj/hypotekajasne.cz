-- Per-bank scraped mortgage rates (HypotékaJasně.cz)
-- Spusťte v Supabase SQL Editoru (včetně ALTER níže, pokud tabulka už existuje).

create extension if not exists "pgcrypto";

create table if not exists public.bank_rates (
  id text primary key,
  bank_name text not null,
  rate numeric not null,
  rpsn numeric not null,
  rate_with_insurance numeric,
  rate_without_insurance numeric,
  rpsn_with_insurance numeric,
  rpsn_without_insurance numeric,
  -- Americká hypotéka (neúčelový úvěr zajištěný nemovitostí)
  american_rate_with_insurance numeric,
  american_rate_without_insurance numeric,
  american_rpsn_with_insurance numeric,
  american_rpsn_without_insurance numeric,
  american_source_url text,
  source_url text,
  updated_at timestamptz not null default now()
);

-- Migrace pro existující instalace
alter table public.bank_rates
  add column if not exists american_rate_with_insurance numeric,
  add column if not exists american_rate_without_insurance numeric,
  add column if not exists american_rpsn_with_insurance numeric,
  add column if not exists american_rpsn_without_insurance numeric,
  add column if not exists american_source_url text;

create index if not exists bank_rates_updated_at_idx
  on public.bank_rates (updated_at desc);

alter table public.bank_rates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'bank_rates'
      and policyname = 'Allow public read bank_rates'
  ) then
    create policy "Allow public read bank_rates"
      on public.bank_rates
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- Po vytvoření/ALTER obnoví PostgREST schema cache (jinak PGRST125 / „Invalid path“)
notify pgrst, 'reload schema';

-- Zápis probíhá přes service role (API scrape), RLS insert není potřebný.
