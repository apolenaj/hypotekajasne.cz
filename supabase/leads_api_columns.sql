-- Additive columns required by POST /api/leads (final schema in leads.sql).
-- Safe to re-run. Does NOT drop/rename existing columns (e.g. legacy
-- property_value / has_insurance / status may remain).
-- Apply AFTER or WITH supabase/leads_retention.sql.
-- Does not recreate the table. Does not delete rows.

alter table public.leads
  add column if not exists source text,
  add column if not exists country text,
  add column if not exists notes text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.leads.source is
  'Lead intake source key written by POST /api/leads';
comment on column public.leads.metadata is
  'JSON bag including consent snapshot; see leads_consent_metadata.sql';
