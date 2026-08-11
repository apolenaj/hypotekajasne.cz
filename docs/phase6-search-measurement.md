# Phase 6 — Search measurement plan

**NO FIRST-PARTY SEARCH QUERY DATA YET.**

Connect Google Search Console to `https://www.hypotekajasne.cz` and wait for indexation + enough impressions before judging SEO “success.”

## Commercial URLs to track (Wave 1)

| Intent | Canonical URL |
|--------|----------------|
| Refinance | `/temata/refinancovani` |
| OSVČ | `/temata/hypoteka-osvc` |
| Foreign income | `/temata/hypoteka-ze-zahranicniho-prijmu` |
| Investment | `/temata/investicni-hypoteka` |
| American | `/temata/americka-hypoteka` |

## After indexation — evaluate per landing

### Search Console

- Impressions
- Clicks
- CTR
- Average position
- Queries that actually surface (do not invent targets)

### Product analytics (consent-gated Phase 4)

- Organic landing sessions (where attribution available)
- `cta_click` / situation_select from homepage → commercial path
- Calculator starts from commercial pages
- `lead_form_view`, `lead_submit`, `lead_success`, `lead_error`
- Safe metadata only: `page_intent` ∈ refinance | osvc | foreign_income | investment | american

### Quality checks (manual)

- No rise in soft-404 / thin impressions on wrong intents
- No cannibalization between `/temata/hypoteka-v-zahranici` (buy abroad) and foreign-income landing
- `/moje-moznosti` remains noindex

## Cadence

1. Week 0–2: crawl/index confirmation only  
2. Week 4–8: first CTR/position read (if data exists)  
3. Week 12+: conversion quality (lead success rate from commercial landings)

Do **not** claim SEO success immediately after deployment.
