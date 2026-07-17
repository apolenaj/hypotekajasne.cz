-- Datová čistota: chybějící reálné sazby = NULL (žádné umělé dopočty).
-- Spusťte v Supabase SQL Editoru, poté: NOTIFY pgrst, 'reload schema';

alter table public.bank_rates
  alter column rpsn drop not null;

alter table public.bank_rates
  alter column rate_without_insurance drop not null;

alter table public.bank_rates
  alter column rpsn_with_insurance drop not null;

alter table public.bank_rates
  alter column rpsn_without_insurance drop not null;

alter table public.bank_rates
  alter column american_rate_without_insurance drop not null;

alter table public.bank_rates
  alter column american_rpsn_with_insurance drop not null;

alter table public.bank_rates
  alter column american_rpsn_without_insurance drop not null;

-- current_rates: bez pojištění může chybět
alter table public.current_rates
  alter column rate_without_insurance drop not null;

alter table public.current_rates
  alter column rpsn_without_insurance drop not null;

notify pgrst, 'reload schema';
