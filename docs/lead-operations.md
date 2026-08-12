# Lead operations readiness (Phase 6.1)

## Path

```text
lead_submit (client)
→ POST /api/leads (validation + consent)
→ Supabase insert (`leads`) with retention + page_intent metadata
→ structured [lead_ops] log (leadId only, no PII)
→ optional LEAD_OPS_WEBHOOK_URL notify (best-effort; never undoes DB success)
→ JSON { ok, leadId, nextStep }
→ client lead_success / lead_error analytics (after consent)
→ privacy retention cron `/api/cron/privacy-retention` (vercel.json)
```

## Confirmed in code

- Database insert returns `leadId` (UUID) without logging name/email/phone.
- `page_intent` accepted only for safe literals: refinance | osvc | foreign_income | investment | american.
- Retention columns + `computeEnquiryRetentionUntil` aligned with public GDPR months.
- Cron registered: `vercel.json` → `/api/cron/privacy-retention` (requires `CRON_SECRET`).
- Marketing consent remains optional and separate from privacy acknowledgment.

## Manual launch gates (not claimed PASS without operator check)

1. **Notification SLA / assignment owner** — no customer SMS/email provider is wired by default. Set `LEAD_OPS_WEBHOOK_URL` only if an internal ops webhook exists. Public copy stays “Ozveme se co nejdříve” (no invented SLA).
2. **Production cron execution** — confirm Vercel Cron runs with `CRON_SECRET` and retention dry-run returns OK on production.
3. **Inbox ownership** — document who monitors new leads in Supabase / webhook target (business decision).

## Synthetic test leads

Use Phase 6 E2E synthetic identity only, verify `page_intent`, then delete with `scripts/delete-phase6-e2e-lead.ts`.
