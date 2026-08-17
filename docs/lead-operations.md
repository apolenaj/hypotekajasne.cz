# Lead operations readiness (Phase 6.1 / 6.2)

## Path

```text
lead_submit (client)
→ POST /api/leads (validation + consent + sanitized attribution)
→ Supabase insert (`leads`) with retention, page_intent, lifecycle=new
→ structured [lead_ops] log (leadId only, no PII)
→ best-effort notify: LEAD_OPS_RECIPIENT_EMAIL via Resend (when keys set)
  and/or optional LEAD_OPS_WEBHOOK_URL (timeout + 1 retry; never undoes DB success)
→ JSON { ok, leadId, nextStep }
→ client lead_success / lead_error analytics (after consent)
→ privacy retention cron `/api/cron/privacy-retention` (vercel.json)
→ ops lifecycle PATCH `/api/ops/leads/:id/lifecycle` (Bearer auth)
→ aggregate report GET `/api/ops/leads/report` (Bearer auth, no PII)
```

## Confirmed in code

- Database insert returns `leadId` (UUID) without logging name/email/phone.
- Client cannot supply lead ID; server/DB generates it.
- `page_intent` accepted only for: refinance | osvc | foreign_income | investment | american.
- Click IDs (`gclid`, `fbclid`, `gbraid`, `wbraid`, …) are stripped and never stored on insert.
- Retention columns + `computeEnquiryRetentionUntil` aligned with public GDPR months.
- Cron registered: `vercel.json` → `/api/cron/privacy-retention` (requires `CRON_SECRET`).
- Webhook retries the same `leadId` payload — retry does not create a second lead.
- Lifecycle stages: new → contacted → qualified → appointment → application → approved → funded | lost.
- Revenue: `expected_revenue_amount` / `realized_revenue_amount` nullable; unknown stays NULL; funded does not invent amounts.
- Marketing consent remains optional and separate from privacy acknowledgment.

## Notification channel

| Item | Status |
|------|--------|
| Business owner | Michal Heinzke (qualified leads forwarded by Josef) |
| Technical recipient | `LEAD_OPS_RECIPIENT_EMAIL` (server-only; Production = Josef’s inbox) |
| E-mail provider | Resend HTTP API — requires `RESEND_API_KEY` + `LEAD_OPS_FROM_EMAIL` + `RESEND_EMAIL_DOMAIN` |
| Optional webhook | `LEAD_OPS_WEBHOOK_URL` (HTTPS only; must not be an e-mail address) |
| Failure | Structured `[lead_ops]` error (no PII); lead row remains |
| Recovery | One automatic retry per channel; retry never creates a second lead |

## Manual launch gates (not claimed PASS without operator check)

1. **Outbound e-mail provider keys** — set `RESEND_API_KEY` + verified `LEAD_OPS_FROM_EMAIL` (do not invent a new paid provider without approval).
2. **Production cron** — confirm Vercel Cron + `CRON_SECRET`; dry-run `GET /api/cron/privacy-retention?dryRun=true` returns OK (counts only, no PII).
3. **GA4 DebugView / Realtime** — confirm funnel events arrive after analytics consent.
4. **Apply SQL** — `supabase/leads_lifecycle_revenue.sql` on production before relying on lifecycle columns / report view.
5. **Optional** — set `LEAD_OPS_API_SECRET` (or reuse `CRON_SECRET`) for ops lifecycle/report routes.

## Phase 7 marketing launch (controlled)

See:

- `docs/phase7-measurement.md`
- `docs/phase7-google-ads-draft.md`
- `docs/phase7-social-14d.md`
- `docs/phase7-retargeting.md`
- `docs/phase7-budget-launch.md`
- `docs/phase7-lead-ops-handoff.md`

Paid campaigns remain **DRAFT** until budget + GA4 Realtime confirmation.
