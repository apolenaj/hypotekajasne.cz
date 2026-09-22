-- Admin notification idempotency flags for Investiční rentgen orders.
-- Run in Supabase SQL Editor (service role). Safe to re-run.

alter table public.investment_analysis_orders
  add column if not exists admin_checkout_notification_sent_at timestamptz;

alter table public.investment_analysis_orders
  add column if not exists admin_payment_notification_sent_at timestamptz;

comment on column public.investment_analysis_orders.admin_checkout_notification_sent_at is
  'When the internal „čeká na platbu“ ops e-mail was sent (idempotent).';

comment on column public.investment_analysis_orders.admin_payment_notification_sent_at is
  'When the internal „ZAPLACENO“ ops e-mail was sent (idempotent).';
