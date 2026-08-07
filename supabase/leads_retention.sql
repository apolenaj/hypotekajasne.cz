-- Retention + consent columns for public.leads (PHASE 1 P0).
-- Safe to re-run. Apply in Supabase SQL Editor / migration pipeline.

alter table public.leads
  add column if not exists updated_at timestamptz,
  add column if not exists last_interaction_at timestamptz,
  add column if not exists retention_until timestamptz,
  add column if not exists privacy_notice_version text,
  add column if not exists deleted_at timestamptz,
  add column if not exists legal_hold boolean not null default false,
  add column if not exists active_case boolean not null default false,
  add column if not exists marketing_consent boolean,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists marketing_consent_withdrawn_at timestamptz,
  add column if not exists marketing_consent_version text;

-- Backfill interaction timestamps for existing rows
update public.leads
set
  last_interaction_at = coalesce(last_interaction_at, created_at),
  updated_at = coalesce(updated_at, created_at)
where last_interaction_at is null
   or updated_at is null;

create index if not exists leads_retention_until_idx
  on public.leads (retention_until)
  where deleted_at is null and legal_hold = false;

create index if not exists leads_deleted_at_idx
  on public.leads (deleted_at)
  where deleted_at is not null;

comment on column public.leads.retention_until is
  'When ordinary retention expires; null while active_case = true';
comment on column public.leads.legal_hold is
  'When true, automated retention cleanup must skip this row';
comment on column public.leads.active_case is
  'Active enquiry/case — excluded from ordinary retention cleanup';
comment on column public.leads.deleted_at is
  'Soft-delete / anonymization timestamp from retention cleanup';
