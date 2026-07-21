# Country data cross-contamination — audit notes (PROMPT 17C)

## Data flow (live Investor Guide)

`/pruvodce-investora/[stat]` → `InvestorGuidePage` → `COUNTRY_DOSSIERS[countryId]` + Decision Lab.

EU markets (ES/IT/HR/SK) share structure via `euBase`, but **tax/holding/ownership labels must be per-country extras**.

## Guards

- `src/lib/country-data/jurisdiction-matrix.ts` — exclusive terms, currency matrix
- `npm run test:country-data` — contamination tests
- No silent fallback to CZ/Spain in prediction/hub/buy-vs-rent getters

## Known modelled limitations (not invented local data)

- Foreign historical series = CZ-scaled proxy (disclosed in UI)
- Shared buy-vs-rent transaction fee rate is generic model — not ITP/DLD/RETT
