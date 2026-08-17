# Phase 7 — Retargeting

**Status: NOT READY** (no Meta Pixel ID in Production; Google remarketing not enabled)

## Preconditions (all required)

1. Marketing cookie consent granted by user  
2. Consent Mode: `ad_storage` / `ad_user_data` / `ad_personalization` update only after marketing accept  
3. No PII in tags or URLs  
4. Scripts unloaded / storage denied on reject  
5. Audience size sufficient (platform minimums)  
6. Explicit budget approval before LIVE  

## Proposed audiences (when ready)

| Audience | Definition | Notes |
|----------|------------|-------|
| Commercial LP visitors | `/temata/*` Wave 1 | Split by `page_intent` if possible |
| Rates visitors | `/sazby` | Soft intent |
| Form openers no submit | `lead_form_view` without `lead_success` (7–30d) | High priority |
| Funnel-specific | refinance / osvc / … | Separate creatives |

## Exclusions

- Users after `lead_success` (7–90d)  
- Synthetic / internal traffic where distinguishable  
- Audiences below platform minimum  
- Sensitive financial hardship profiling  

## Creative rules

Do **not** imply knowledge of a person’s mortgage balance, income, or approval odds.  
Use generic: “Dokončete nezávaznou poptávku” / “Porovnejte zveřejněné sazby”.

## Pixel / tag

| Tag | Env | Status |
|-----|-----|--------|
| GA4 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Present (analytics consent) |
| Meta Pixel | `NEXT_PUBLIC_META_PIXEL_ID` | **Missing** → retargeting NOT READY |
| Google Ads remarketing | Ads UI + consent | NOT READY |

## State machine

`NOT READY` → (pixel + consent QA) → `READY` (paused campaigns) → (budget approval) → `LIVE`
