# Interní metodika dat (NEVEŘEJNÉ)

Tento dokument **nesmí** být renderován ve veřejném UI. Veřejná metodika žije v:

- `src/lib/data/public-methodology.ts`
- `/metodika`, `/zdroje`

## Source of Truth (engineering)

| Doména | Kanonický modul / úložiště |
|--------|----------------------------|
| CZ sazby | `supabase:bank_rates` + `src/lib/scrape/bank-scrapers.ts` |
| Sazba bez pojištění (orientační) | `bank_rates` + offset +0,3 p.b. (MODELLED) |
| KB insider | `src/lib/scrape/rate-policy.ts#KB_INSIDER_RATES` |
| RPSN | `supabase:current_rates` / `bank_rates` |
| Americká hypotéka | `bank_rates.american_*` |
| LTV / DTI / DSTI limity | `src/lib/data/static-regulatory.ts` |
| Výnosy / ceny | `src/lib/data/static-market.ts`, `src/lib/market-metrics.ts` |
| Historie | `src/lib/historical-data.ts` |
| Katalog | `src/lib/data/catalog.ts` (`DATA_CATALOG`, `canonicalModule`, `usedIn`) |

## Freshness thresholds (ms)

Viz `FRESHNESS_THRESHOLD_MS` v `src/lib/data/freshness.ts`.

- LIVE ≈ 48 h → STALE
- PARTNER_QUOTE ≈ 7 dní
- VERIFIED ≈ 6 měsíců
- MODELLED — nestárne do LIVE

## Scoring

Verze vah: `2026-07-market-matching-v1` (interní identifikátor).

Veřejné váhy v % jsou na `/metodika` bez anglických klíčů dimenzí.

## Pravidlo

Jakákoli změna veřejných textů metodiky musí zůstat bez názvů tabulek, cest `src/…`, API endpointů a env proměnných.
