-- Property photos for Investiční rentgen orders (private bucket)
-- Apply in Supabase SQL editor. Metadata is stored in investment_analysis_orders.input_snapshot.photos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rentgen-order-photos',
  'rentgen-order-photos',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Service role only — no anon policies.
