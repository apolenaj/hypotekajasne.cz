-- Povolení NULL pro RPSN, pokud scraper nemá ověřenou hodnotu.
-- Spusťte v Supabase SQL Editoru, poté: NOTIFY pgrst, 'reload schema';

alter table public.bank_rates
  alter column rpsn drop not null;

notify pgrst, 'reload schema';
