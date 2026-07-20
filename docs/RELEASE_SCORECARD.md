# HypotékaJasně.cz — Release Scorecard

**Datum:** 2026-07-19  
**Canonical:** https://hypotekajasne.cz  
**Skóre gate:** žádné unresolved **P0/P1 v kódu** pro kritické kategorie. Produkční spuštění navíc vyžaduje externí legal/data fill (viz dole).

## Severity

| Level | Význam |
|-------|--------|
| P0 | Blokuje důvěru / compliance / crawl / finance math |
| P1 | Musí být vyřešeno před produkcí nebo explicitně owned |
| P2 | Follow-up po launch |

---

## Checklist po veřejných routách

| Kategorie | Stav | Poznámka |
|-----------|------|----------|
| DATA ACCURACY | PASS* | CZ sazby přes scrapers + statusy; zahraniční sazby v `financingDetailsData` jsou orientační → P1 externí refresh |
| FINANCIAL MATH | PASS | Pipeline + readiness + matching unit testy; model ≠ nabídka banky |
| TRUST | PASS | Trust Center, role, partner card PENDING_VERIFICATION (IČO nevyplněno záměrně) |
| LEGAL | PASS* | Consent records, cookies=consent, draft texty + lawyer banner; IČO TODO = produkční blocker (externí) |
| SEO | PASS | Canonical, sitemap index, robots, hreflang cs/en hub, unique titles, JSON-LD bez fake reviews |
| PERFORMANCE | PASS* | SSR/SSG klíčový obsah; GA gated; OG image edge — měřit LCP na Vercel preview |
| ACCESSIBILITY | PASS* | Breadcrumbs, labels, cookie dialog; spustit axe/lighthouse manuálně před launch |
| MOBILE | PASS* | Responsive layouty; ověřit cookie banner + formuláře na 375px |
| CONVERSION | PASS | Consent checkboxes oddělené; analytics funnel wired; A/B framework ready |
| COPY | PASS | Odstraněny „záruka / procesní dokonalost / hladce / Extrémní ROI 15 % / Fotografie brzy“ |
| ERROR STATES | PASS | Lead API + form error UI |
| LOADING STATES | PASS | Submit spinners na lead / readiness / rentgen |
| EMPTY STATES | PASS | Photo placeholder jen když chybí fotka; media PLANNED bez fake src |

\* = zbývá provozní / manuální ověření (ne code P0).

---

## Automatický scan (release-audit.test + manuální)

| Finding | Severity | Status |
|---------|----------|--------|
| „Fotografie brzy“ | P1 | **Fixed** → „Fotografie zatím není dodána“ |
| „Extrémně vysoké ROI (až 15 %)“ | P0 copy | **Fixed** → model disclaimer |
| Destination „vysoký ROI“ subtitles | P1 | **Fixed** |
| Fake Majetio listing counts | P0 | **Already guarded** (`ECOSYSTEM_FEATURES`, o-majetio copy) |
| Legitimate interest vs cookie consent mismatch | P0 | **Fixed** earlier (consent-only analytics) |
| Form submit = marketing consent | P0 | **Fixed** (separate checkboxes + API validate) |
| Missing IČO / legal name | P1 prod | **Open — external config** (`LEGAL_OPERATOR_*`) |
| Partner JERRS URL null | P1 prod | **Open — external verify** (`MORTGAGE_PARTNERS`) |
| Hardcoded foreign % in mock financing | P1 data | **Open — expert refresh**; UI copy already model-oriented elsewhere |
| Team LinkedIn null | P2 | Open — fill when verified |
| `calculator_completed` sparsely fired | P2 | Framework ready; wire on all calc finish paths |
| Offline `conversion_confirmed` | P2 | Requires partner CRM webhook |
| `twitter-image` re-export `runtime` | P1 build | **Fixed** — local `export const runtime` (Next 16 static parse) |
| FAQ JSON-LD `FAQ_ITEMS.map` from client module | P0 build | **Fixed** — data in `src/lib/faq/items.ts` (SSR-safe) |

---

## Analytics event taxonomy (privacy-aware)

Events:  
`homepage_intent_selected`, `calculator_started`, `calculator_completed`, `prescore_started`, `prescore_completed`, `investment_pass_started`, `investment_pass_completed`, `country_viewed`, `financing_option_selected`, `majetio_clicked`, `analysis_started`, `analysis_checkout_started`, `lead_submitted`, `partner_handoff`, `conversion_confirmed`.

Payload rules: no email/phone/name/income/loan amounts; only categorical IDs + score buckets. Consent-gated via cookie analytics.

Implementace: `src/lib/analytics/*`, wired on intent paths, kalkulačky, readiness, passport, rentgen, country hubs, leads.

**AI Copilot** (`/copilot`): tool_id `ai_copilot` na `calculator_started` / `calculator_completed` + `intent_id` z detekce. Orchestrace je deterministická (bez LLM API) — retrieval + kalkulačky + guardrails + audit v sessionStorage.


## Funnel dashboard specification

Traffic → Tool start → Tool completion → Qualified lead → Partner handoff → Mortgage completed → Property purchased → Analysis purchased.

Spec: `FUNNEL_DASHBOARD_SPEC` in `src/lib/analytics/funnel.ts` (verze 2026-07-19.1).

Offline stages (`mortgage_completed`, `property_purchased`) = partner CRM attribution, not HJ-only claims.

## Experiment framework (A/B)

| Experiment | Variants |
|------------|----------|
| `hero` | control, clarity, affordability |
| `cta` | control, consult, score_first |
| `form_length` | control, short, progressive |
| `free_preview` | control, metrics_only, metrics_plus_checklist |
| `majetio_cross_sell` | control, inline, sticky_footer |

Sticky assignment: `localStorage` + `useExperiment` / `getExperimentVariant`. Exposure reporting only with analytics consent.

---

## Co ještě vyžaduje externí ověření

1. **Český právník** — finální GDPR, cookies, smlouvy, placená analýza, spotřebitelské odstoupení.  
2. **IČO / právní jméno / ARES** — env `LEGAL_OPERATOR_*`.  
3. **JERRS / licence partnera** — doplnit `/partneri`.  
4. **Doménový expert** — zahraniční sazby a výnosy v country financing data.  
5. **GA Measurement ID** — produkční `NEXT_PUBLIC_GA_MEASUREMENT_ID` až po cookie consent UX QA.  
6. **Manuální a11y + mobile QA** na Vercel preview (axe / Lighthouse).  
7. **Majetio** — ověřit discovery URL + attribution v staging.

---

## Release gate verdict

| Gate | Result |
|------|--------|
| Code P0 unresolved | **None** |
| Code P1 unresolved (fixable in-repo) | **None** |
| Production-ready without external fill | **NO** — legal identity + partner licence + lawyer review required |
| Engineering release candidate | **YES** — CI níže (2026-07-20) |

### CI run (2026-07-20)

| Check | Result |
|-------|--------|
| `npm run lint` | PASS* (0 errors; warnings only — img / unused vars) |
| `npm run typecheck` | PASS |
| `npm test` (unit + integration pipelines) | PASS |
| `npm run test:seo` | PASS (20) |
| `npm run test:analytics` | PASS |
| `npm run test:release-audit` | PASS |
| `npm run test:a11y-smoke` | PASS |
| `npm run build` | PASS (po opravě FAQ SSR + twitter-image runtime) |

\* Full axe / Lighthouse mobile QA zůstává manuální na Vercel preview.

Spouštěcí checklist CI:

```bash
npm run lint
npm run typecheck
npm run test:seo
npm run test:analytics   # nebo npm test včetně analytics + release-audit
npm run test:a11y-smoke
npm run build
```
