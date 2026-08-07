-- Consent / privacy metadata stored in public.leads.metadata (jsonb).
-- No separate consent table yet — fields live on each lead insert.
-- Apply documentation only; does not alter table columns.

-- Expected metadata keys written by POST /api/leads:
--   privacy_notice_version
--   privacy_notice_acknowledged
--   privacy_notice_acknowledged_at
--   marketing_consent
--   marketing_consent_at
--   marketing_consent_withdrawn_at  (null at insert; set on future withdrawal flow)
--   marketing_consent_version
--   transfer_consent                 (only when a real third-party transfer is accepted)
--   transfer_consent_at
--   transfer_consent_version
--   transfer_recipient
--   consent_policy_version
--   consent                          (full FormConsentRecord snapshot)
--
-- Table timestamps:
--   public.leads.created_at
--   (updated_at not on table yet — add when withdrawal/update flows exist)

comment on table public.leads is
  'Enquiry leads. Consent/privacy fields live in metadata jsonb — see supabase/leads_consent_metadata.sql';
