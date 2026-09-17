-- Premium Investiční Audit PDFs (private bucket)
-- Apply in Supabase SQL editor or CLI.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'premium-rentgen-reports',
  'premium-rentgen-reports',
  false,
  20971520, -- 20 MB
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Service role uploads from API; clients only get short-lived signed URLs.
-- No public anon read policies on purpose.
