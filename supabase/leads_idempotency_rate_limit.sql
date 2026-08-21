-- Phase 7.1 — lead idempotency + distributed rate limiting.
-- Backward-compatible. Safe to re-run. Does not modify existing lead rows.
-- Service role bypasses RLS; anon/authenticated have no policies (deny).

-- ---------------------------------------------------------------------------
-- 1) Idempotency key on leads (nullable for legacy rows)
-- ---------------------------------------------------------------------------
alter table public.leads
  add column if not exists idempotency_key text;

-- UUID-shaped keys only when present (no PII).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_idempotency_key_format'
  ) then
    alter table public.leads
      add constraint leads_idempotency_key_format
      check (
        idempotency_key is null
        or idempotency_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      );
  end if;
end $$;

-- One lead per key; NULL keys remain unique-unconstrained (legacy compatible).
create unique index if not exists leads_idempotency_key_uidx
  on public.leads (idempotency_key)
  where idempotency_key is not null;

-- ---------------------------------------------------------------------------
-- 2) Rate-limit buckets (hashed client id only — never store raw IP)
-- ---------------------------------------------------------------------------
create table if not exists public.lead_api_rate_limits (
  client_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint lead_api_rate_limits_count_nonneg check (request_count >= 0),
  constraint lead_api_rate_limits_hash_len check (char_length(client_hash) between 16 and 128)
);

create index if not exists lead_api_rate_limits_window_idx
  on public.lead_api_rate_limits (window_started_at);

alter table public.lead_api_rate_limits enable row level security;

-- No public policies: deny for anon/authenticated. Service role only.

-- Atomic consume: returns allowed / retry_after / count. Never logs PII.
create or replace function public.consume_lead_api_rate_limit(
  p_client_hash text,
  p_max_requests integer default 8,
  p_window_seconds integer default 600
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.lead_api_rate_limits%rowtype;
  v_retry integer;
begin
  if p_client_hash is null
     or char_length(p_client_hash) < 16
     or p_max_requests < 1
     or p_window_seconds < 1 then
    return jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', p_window_seconds,
      'current_count', 0,
      'error', 'invalid_args'
    );
  end if;

  -- Opportunistic cleanup of stale windows (retention ~ 24h).
  delete from public.lead_api_rate_limits
  where window_started_at < v_now - interval '24 hours';

  select * into v_row
  from public.lead_api_rate_limits
  where client_hash = p_client_hash
  for update;

  if not found then
    insert into public.lead_api_rate_limits (
      client_hash, window_started_at, request_count, updated_at
    ) values (
      p_client_hash, v_now, 1, v_now
    );
    return jsonb_build_object(
      'allowed', true,
      'retry_after_seconds', 0,
      'current_count', 1
    );
  end if;

  if v_row.window_started_at <= v_now - make_interval(secs => p_window_seconds) then
    update public.lead_api_rate_limits
    set window_started_at = v_now,
        request_count = 1,
        updated_at = v_now
    where client_hash = p_client_hash;
    return jsonb_build_object(
      'allowed', true,
      'retry_after_seconds', 0,
      'current_count', 1
    );
  end if;

  if v_row.request_count >= p_max_requests then
    v_retry := greatest(
      1,
      ceil(
        extract(
          epoch from (
            v_row.window_started_at
            + make_interval(secs => p_window_seconds)
            - v_now
          )
        )
      )::integer
    );
    return jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', v_retry,
      'current_count', v_row.request_count
    );
  end if;

  update public.lead_api_rate_limits
  set request_count = v_row.request_count + 1,
      updated_at = v_now
  where client_hash = p_client_hash;

  return jsonb_build_object(
    'allowed', true,
    'retry_after_seconds', 0,
    'current_count', v_row.request_count + 1
  );
end;
$$;

revoke all on function public.consume_lead_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_lead_api_rate_limit(text, integer, integer)
  to service_role;
