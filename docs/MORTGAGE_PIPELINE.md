# Mortgage products pipeline

## Stages

```
RAW INGEST → NORMALIZE → VALIDATE → ANOMALY CHECK → STAGING → PUBLISH → HISTORY
```

| Stage | Module | Behavior |
|-------|--------|----------|
| RAW | scrape + `mortgage_products_raw` | Only scraped payloads — no invented rates |
| NORMALIZE | `normalize.ts` | `ScrapedBankRate` → `MortgageProduct[]` |
| VALIDATE | `validate.ts` | Structure + RPSN rules |
| ANOMALY | `anomaly.ts` | Rate jump ≥ 0.5 p.b. or ≥ 15% → **block auto-publish** |
| STAGING | `mortgage_products_staging` | `pending` / `auto_published` / `blocked` |
| PUBLISH | `mortgage_products` | Production read model |
| HISTORY | `mortgage_products_history` | Every create/update/stale/reject |

## RPSN

- Never a universal client RPSN.
- Publish `representativeAPR` only with `representativeExample`, or compute only with complete fees.
- Otherwise UI: **Na vyžádání**.

## Ops

1. Run SQL: `supabase/mortgage_products_pipeline.sql`
2. Daily cron `0 4 * * *` → `/api/scrape-rates` (also runs pipeline)
3. Review: `GET/POST /api/mortgage-pipeline/review` with `Authorization: Bearer CRON_SECRET`

### Approve

```http
POST /api/mortgage-pipeline/review
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json

{
  "pipelineRunId": "...",
  "productId": "...",
  "approve": true,
  "reviewedBy": "operator",
  "notes": "Verified against bank site"
}
```

## Stale fallback

If a product disappears from scrape, production row is kept with `status=STALE` (not deleted).

## Tests

```bash
npm run test:pipeline
```
