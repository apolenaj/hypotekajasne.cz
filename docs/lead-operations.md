# Lead operations readiness (Phase 6.1 / 6.2)

## Path

```text
lead_submit (client)
→ POST /api/leads (validation + consent + sanitized attribution)
→ Supabase insert (`leads`) with retention, page_intent, lifecycle=new
→ structured [lead_ops] log (leadId only, no PII)
→ optional LEAD_OPS_WEBHOOK_URL notify (timeout + 1 retry; never undoes DB success)
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
| Channel | Optional internal webhook via `LEAD_OPS_WEBHOOK_URL` (URL must not be logged) |
| Failure | Structured `[lead_ops]` error; lead row remains |
| Recovery | One automatic retry + ops can re-notify manually using stored `leadId` |
| Ops owner | **Not invented in code** — business decision (see manual gates) |

## Manual launch gates (not claimed PASS without operator check)

1. **Ops owner / inbox** — document who monitors new leads (Supabase table and/or webhook target). Public copy stays “Ozveme se co nejdříve”.
2. **Production cron** — confirm Vercel Cron + `CRON_SECRET`; dry-run `GET /api/cron/privacy-retention?dryRun=true` returns OK (counts only, no PII).
3. **GA4 DebugView / Realtime** — confirm funnel events arrive after analytics consent.
4. **Apply SQL** — `supabase/leads_lifecycle_revenue.sql` on production before relying on lifecycle columns / report view.
5. **Optional** — set `LEAD_OPS_API_SECRET` (or reuse `CRON_SECRET`) for ops lifecycle/report routes.

## Synthetic test leads

Use marker `phase_6_2_<timestamp>` in `metadata.test_marker`, verify `page_intent`, then delete only that row
(`scripts/delete-phase62-synthetic-lead.ts`). Controlled retention test may use
`?onlyLeadId=<uuid>` only when the row carries a synthetic marker.
