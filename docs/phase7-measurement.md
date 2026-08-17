# Phase 7 — Measurement & conversion architecture

Status: **PREPARATION** (no paid spend activated)

## Conversion hierarchy

| Role | Event | Use |
|------|--------|-----|
| **Primary** | `lead_success` | Only event for Ads optimization / conversion import |
| Secondary | `lead_submit` | Funnel diagnostics — do **not** optimize paid campaigns on this alone |
| Secondary | `lead_form_view` | Form exposure |
| Secondary | `cta_click` | CTA engagement |
| Secondary | `situation_select` | Homepage / intent selection |

Code constants: `src/lib/marketing/phase7-conversion.ts`

## Safe parameters (allowed)

- `page_intent` ∈ refinance | osvc | foreign_income | investment | american
- `cta_destination`, `cta_placement`
- `source_page` / landing path
- `referrer_host` (host only)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` (sanitized lowercase tokens)
- coarse calculator bands (LTV band, fixation months, purpose)

## Forbidden in analytics / Ads / Meta / URL params

- name, email, phone, message/notes
- full street address
- raw click IDs stored in first-party lead rows (`gclid` / `fbclid` stripped on insert)

`gclid` policy: Google may attribute via Consent Mode cookies after consent; we do **not** persist click IDs on `leads`.

## Consent gating

- Defaults: analytics + ads storage **denied** until decision
- GA4 loads only when `analyticsAllowed`
- Meta Pixel stub loads only when `marketingAllowed` **and** `NEXT_PUBLIC_META_PIXEL_ID` is set (currently **unset** in Production)

## UTM standard

Pattern:

```text
utm_source   = google | facebook | Instagram → facebook/instagram as source
utm_medium   = cpc | paid_social | remarketing | organic_social | email
utm_campaign = cz_{funnel}_{channel}_{type}[_variant]
utm_content  = creative or CTA id (lowercase)
utm_term     = keyword theme (search only)
```

Examples:

```text
utm_campaign=cz_refinance_google_search_brand
utm_campaign=cz_osvc_facebook_paid_social_week1
utm_campaign=cz_refinance_google_remarketing_formabandon
```

Builder: `buildPhase7UtmCampaign()`.

## Josef — GA4 Realtime / DebugView manual gate

1. Open GA4 → **Realtime** (and optionally **Admin → DebugView** with debug mode).
2. Incognito → https://www.hypotekajasne.cz — **before** cookies: confirm no GA hits / no Ads/Meta marketing tags.
3. Accept **analytics** cookies (marketing optional/off for this check).
4. Homepage → choose refinancing situation → open `/temata/refinancovani` → scroll to form.
5. Confirm events (names exactly):
   - `situation_select`
   - `cta_click`
   - `lead_form_view`
   - `lead_submit` (only if you submit a **synthetic** test — then delete DB row)
   - `lead_success` (same)
6. For each event: `page_intent` / path context correct; **no** email/phone/name.
7. Confirm one submit does not fire duplicate `lead_success` optimization events beyond documented continuity aliases.

Until Josef confirms Realtime/DebugView: **GA4 MEASUREMENT = MANUAL GATE**. Client dataLayer + network collect already verified in Phase 6.2.
