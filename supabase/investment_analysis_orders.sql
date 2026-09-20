-- Investment analysis orders (Investiční rentgen checkout)
-- Run in Supabase SQL Editor (service role bypasses RLS for inserts/updates).

create extension if not exists "pgcrypto";

create table if not exists public.investment_analysis_orders (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  access_token text not null,
  product_code text not null,
  status text not null default 'DRAFT',
  currency text not null default 'CZK',
  amount_expected_czk integer not null,
  email text,
  phone text,
  customer_name text,
  billing_type text,
  billing_company_name text,
  billing_ico text,
  billing_dic text,
  billing_address text,
  property_label text,
  input_snapshot jsonb not null default '{}'::jsonb,
  result_snapshot jsonb,
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  stripe_price_id text,
  last_stripe_event_id text,
  storage_path text,
  report_id text,
  fulfillment_error text,
  paid_at timestamptz,
  processing_at timestamptz,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint investment_analysis_orders_status_check check (
    status in (
      'DRAFT',
      'CHECKOUT_CREATED',
      'PAYMENT_PENDING',
      'PAID',
      'PROCESSING',
      'READY',
      'AWAITING_DOCUMENTS',
      'FAILED',
      'CANCELLED',
      'REFUNDED',
      'EXPIRED'
    )
  ),
  constraint investment_analysis_orders_product_check check (
    product_code in ('INVESTMENT_XRAY', 'INDIVIDUAL_ANALYSIS', 'rentgen_premium')
  )
);

create index if not exists investment_analysis_orders_email_idx
  on public.investment_analysis_orders (email);
create index if not exists investment_analysis_orders_status_idx
  on public.investment_analysis_orders (status);
create index if not exists investment_analysis_orders_created_at_idx
  on public.investment_analysis_orders (created_at desc);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now(),
  order_id uuid references public.investment_analysis_orders (id) on delete set null
);

alter table public.investment_analysis_orders enable row level security;
alter table public.stripe_webhook_events enable row level security;

-- No anon policies: service role only.
