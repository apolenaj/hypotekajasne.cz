-- Tabulka pro sjednocený sběr leadů (HypotékaJasně.cz)
-- Spusťte v Supabase SQL Editoru, pokud tabulka ještě neexistuje.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  source text not null,
  country text,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;

-- Vkládání přes service role obchází RLS.
-- Pro přímý insert z klientského anon klíče (fallback) povolte insert:
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'leads'
      and policyname = 'Allow anonymous lead inserts'
  ) then
    create policy "Allow anonymous lead inserts"
      on public.leads
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

-- Veřejné čtení leadů neumožňujte.
