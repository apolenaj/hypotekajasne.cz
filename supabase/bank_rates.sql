-- Per-bank scraped mortgage rates (HypotékaJasně.cz)
-- Spusťte v Supabase SQL Editoru.

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
  source_url text,
  updated_at timestamptz not null default now()
);

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

-- Po vytvoření tabulky obnoví PostgREST schema cache (jinak PGRST125 / „Invalid path“)
notify pgrst, 'reload schema';

-- Zápis probíhá přes service role (API scrape), RLS insert není potřebný.
