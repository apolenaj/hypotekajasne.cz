-- Migrace: americké hypotéky do bank_rates
-- Spusťte v Supabase SQL Editoru, pokud tabulka už existuje.

alter table public.bank_rates
  add column if not exists american_rate_with_insurance numeric,
  add column if not exists american_rate_without_insurance numeric,
  add column if not exists american_rpsn_with_insurance numeric,
  add column if not exists american_rpsn_without_insurance numeric,
  add column if not exists american_source_url text;

notify pgrst, 'reload schema';
