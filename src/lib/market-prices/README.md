# Czech market series — update guide

Versioned historical series for the homepage section **Vývoj cen nemovitostí v ČR** (pozemky + komerční).

## Principles

- Prefer a verified file in the repo over live scraping.
- Do not invent missing years, interpolate, or convert EUR with today’s FX.
- Do not mix providers with different methodology into one series.
- Administrative land prices (BPEJ) are not market prices.

## How to update

1. Open the source publication (URL in each series’ `sourceUrl`).
2. Transcribe values from a **table** or labelled figure — not by eye from a line chart.
3. Edit the constants in `cz-market-series.ts`.
4. Set `verifiedAt` to today’s date (`YYYY-MM-DD`).
5. Update `publishedAt` if the report date changed.
6. Run:

```bash
npm test -- src/lib/market-prices/cz-market-series.test.ts
npm run typecheck
```

## Current series

| ID | Segment | Update cadence |
|----|---------|----------------|
| `farmy-agri-avg-cz` | Zemědělská půda | Annual (FARMY.CZ January report) |
| `farmy-orna-cz` / `farmy-ttp-cz` | Orná / TTP | Annual (same report) |
| `prf-office-vacancy-prague` | Kanceláře — neobsazenost | After PRF Q4 press release |
| `prf-office-prime-rent-prague` | Kanceláře — prime rent | After PRF Q4 |
| `cw-industrial-vacancy-cz` | Průmysl — neobsazenost | After C&W Q4 Marketbeat |
| `cw-industrial-prime-rent-prague` | Průmysl — prime rent | After C&W Q4 Marketbeat |

## Blocked (documented in `CZ_MARKET_BLOCKED`)

- **Stavební pozemky** — needs ČSÚ DataStat/XLSX export (no stable public API found).
- **Obchodní prostory** — no free long comparable sale-price series; retail reports are mostly snapshot + licensed.

There is **no automatic scraper**. Updates are manual after each annual/Q4 publication.
