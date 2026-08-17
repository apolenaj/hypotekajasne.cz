-- Phase 6.2 — additive lead lifecycle + revenue attribution.
-- Safe to re-run. Does not invent revenue. Public SELECT remains denied.

-- Lifecycle stage (first-class; default new on insert).
alter table public.leads
  add column if not exists lifecycle_status text not null default 'new';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_lifecycle_status_check'
  ) then
    alter table public.leads
      add constraint leads_lifecycle_status_check
      check (
        lifecycle_status in (
          'new',
          'contacted',
          'qualified',
          'appointment',
          'application',
          'approved',
          'funded',
          'lost'
        )
      );
  end if;
end $$;

-- Operational attribution (no click IDs — those require marketing consent + legal basis).
alter table public.leads
  add column if not exists page_intent text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_page_intent_check'
  ) then
    alter table public.leads
      add constraint leads_page_intent_check
      check (
        page_intent is null
        or page_intent in (
          'refinance',
          'osvc',
          'foreign_income',
          'investment',
          'american'
        )
      );
  end if;
end $$;

alter table public.leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists landing_path text;

-- Revenue readiness: NULL = unknown (never coerce to 0).
alter table public.leads
  add column if not exists expected_revenue_amount numeric,
  add column if not exists realized_revenue_amount numeric,
  add column if not exists revenue_currency text not null default 'CZK',
  add column if not exists realized_at timestamptz,
  add column if not exists revenue_status text not null default 'unknown';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_revenue_status_check'
  ) then
    alter table public.leads
      add constraint leads_revenue_status_check
      check (
        revenue_status in ('unknown', 'expected', 'realized', 'written_off')
      );
  end if;
end $$;

create index if not exists leads_lifecycle_status_idx
  on public.leads (lifecycle_status);

create index if not exists leads_page_intent_idx
  on public.leads (page_intent);

create index if not exists leads_realized_at_idx
  on public.leads (realized_at desc nulls last);

-- Append-only audit for lifecycle transitions (internal / service-role only).
create table if not exists public.lead_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_at timestamptz not null default now(),
  actor_source text not null default 'ops_api',
  reason text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists lead_lifecycle_events_lead_id_idx
  on public.lead_lifecycle_events (lead_id, changed_at desc);

alter table public.lead_lifecycle_events enable row level security;

-- No public policies: anon/authenticated cannot read or write history.
-- Service role bypasses RLS for server-side ops.

-- Aggregate ops reporting (service role / postgres only; RLS on base tables still applies to invokers).
create or replace view public.lead_ops_funnel_daily
with (security_invoker = true)
as
select
  (created_at at time zone 'Europe/Prague')::date as day_prague,
  coalesce(page_intent, 'unknown') as page_intent,
  coalesce(utm_source, 'unknown') as attribution_source,
  lifecycle_status,
  count(*)::bigint as lead_count,
  count(*) filter (where lifecycle_status = 'contacted')::bigint as contacted_count,
  count(*) filter (where lifecycle_status = 'qualified')::bigint as qualified_count,
  count(*) filter (where lifecycle_status = 'appointment')::bigint as appointment_count,
  count(*) filter (where lifecycle_status = 'application')::bigint as application_count,
  count(*) filter (where lifecycle_status = 'approved')::bigint as approved_count,
  count(*) filter (where lifecycle_status = 'funded')::bigint as funded_count,
  count(*) filter (where lifecycle_status = 'lost')::bigint as lost_count,
  sum(expected_revenue_amount) filter (where expected_revenue_amount is not null) as expected_revenue_sum,
  sum(realized_revenue_amount) filter (
    where realized_revenue_amount is not null and realized_at is not null
  ) as realized_revenue_sum
from public.leads
where deleted_at is null
group by 1, 2, 3, 4;

comment on view public.lead_ops_funnel_daily is
  'Internal aggregate funnel/revenue by day, page_intent, utm_source, lifecycle. No PII. Service-role access only.';
