# Remediation Baseline — Hypotéka Jasně

**Datum auditu:** 2026-07-21  
**Prompt:** 0 — Master Audit, Safety Rules & Baseline  
**Zásada:** Nevymýšlet finanční / právní / bankovní data. Žádný redesign v této fázi.

---

## 1. Aktuální architektura

### 1.1 Framework a stack

| Položka | Verze / detail |
|---------|----------------|
| Next.js | **16.2.10** (App Router, Turbopack build) |
| React / React DOM | **19.2.4** |
| TypeScript | ^5 |
| Tailwind CSS | v4 (`@tailwindcss/postcss`) |
| UI | Base UI + shadcn-style primitives, Lucide, Recharts |
| Backend data | `@supabase/supabase-js` ^2.110.7 |
| Hosting | Vercel (`vercel.json` cron) |
| Runtime auth | **Žádná** (NextAuth / Supabase Auth nepoužity) |

### 1.2 Routing (App Router)

Canonical mapa: `src/lib/routes.ts`.

**Veřejné produktové cesty (výběr):**

| Oblast | Cesty |
|--------|-------|
| Home / funnel | `/`, `/moje-moznosti`, `/navrh-na-miru`, `/dashboard` |
| Kalkulačky | `/kalkulacky`, `/koupe-vs-najem`, `/historicky-vyvoj`, `/potencialni-vyvoj` |
| Investice | `/investicni-rentgen`, `/modelar`, `/porovnani`, `/investicni-pas` |
| Země | `/pruvodce-investora`, `/pruvodce-investora/[stat]` |
| Vzdělávání | `/akademie`, `/akademie/[slug]`, `/akademie/cesty…`, `/clanky…` |
| Trust / legal | `/metodika`, `/duvera`, `/zdroje`, `/pravni/*`, `/partneri` |
| Tools (často BETA / localStorage) | `/transakce`, `/profesionalni-portal`, `/dokumentovy-trezor`, `/alerty`, `/portfolio`, `/sledovani`, `/refinancovani-radar`, `/globalni-financovani`, `/reporty`, `/copilot`, `/financni-pas` |
| i18n | `/en` (částečné EN) |

~55 `page.tsx`. Middleware: `src/middleware.ts` (preview / `SEO_FORCE_NOINDEX`).

### 1.3 Datová vrstva

| Vrstva | Umístění | Role |
|--------|----------|------|
| DataRecord + statusy | `src/lib/data/*` | SoT kontrakt pro dynamická čísla |
| Provenance / claims | `src/lib/sources/*` | Externí autority, validace |
| Regulatory | `src/lib/cnb-limits.ts` → `static-regulatory.ts` | ČNB limity (hardcoded konstanty + provenance metadata) |
| Market static | `static-market.ts`, country dossiers | Editorial / model — musí mít status |
| Live rates | Supabase + scrape pipeline + `src/lib/rates/*` | LIVE / VERIFIED / MODEL fallback |
| Catalog check | `scripts/verify-data-catalog.mjs` | CI sanity |

**DataStatus (kód):**  
`LIVE | VERIFIED | MODEL | ESTIMATE | UNVERIFIED | PARTNER_QUOTE | STALE`  
(`src/lib/data/types.ts`)

**Poznámka vs. Prompt 0 UI pravidla:** Prompt uvádí i `NEEDS UPDATE`. V kódu **neexistuje** — nejbližší je `STALE`. `PARTNER_QUOTE` je navíc. Remediation později: sjednotit veřejné labely (mapovat STALE → „Vyžaduje aktualizaci“), nevymýšlet nová čísla.

### 1.4 API routes

| Route | Účel |
|-------|------|
| `POST /api/leads` | Lead + consent → Supabase |
| `GET/POST /api/scrape-rates` | Scrape bank rates + pipeline (cron) |
| `GET /api/cron/update-rates` | Legacy redirect na scrape |
| `…/mortgage-pipeline/review` | Manuální review staged produktů |
| `…/bridge/majetio/*` | Affordability, financing handoff, twin/watchlist sync |
| `…/bridge/b2b/*` | Analysis order, engagement |
| `…/bridge/deal-room/sync` | Deal room |
| `…/bridge/documents/*` | Upload URL, share handoff |
| `…/bridge/financing/partner-inquiry` | Partner inquiry |
| `…/bridge/reports/share` | Report share tokens |

Mnoho bridge endpointů je **COMING_SOON / soft** — nesmí se vydávat za plnou produkční integraci.

### 1.5 Kalkulační logika

| Modul | SoT |
|-------|-----|
| Anuita / PV / LTV / DSTI helpers | `src/lib/finance-math/*` (re-export `calculators.ts`) |
| CZ decision tool | `mortgage-decision.ts` |
| Financing products | `financing/*` |
| Affordability / readiness / passport | `affordability.ts`, `mortgage-readiness`, `financial-passport` |
| Investment engine | `investment-engine/*` |
| Modeler / rentgen / refinance / portfolio stress | respective `src/lib/*` |
| Golden QA | `npm run test:finance-math` |

### 1.6 Formuláře a consent

| Formulář | Soubor |
|----------|--------|
| Lead capture | `LeadCaptureForm.tsx`, `LeadGen.tsx`, Rentgen premium |
| Consent fields | `FormConsentFields.tsx` |
| Cookie banner | `CookieConsentBanner` + localStorage `hj_cookie_consent_v1` |
| Partner transfer | Jen pokud `isMortgagePartnerHandoffReady()` |

### 1.7 Local storage / DB

- **DB:** Supabase (leads, rates/products — viz `supabase/*.sql`).
- **Client persistence:** desítky `hj-*` klíčů v localStorage / sessionStorage (academy, vault, deal-room, B2B demo, rates cache, analytics debug, …). Seznam evidence: viz audit 17O / explore.
- **Cookies HTTP:** prakticky ne — consent je localStorage.

### 1.8 Autentizace

**Žádná uživatelská autentizace.** Anonymní session seeds (vault actor, B2B viewer). Server API chrání `CRON_SECRET` u scrape/review.

### 1.9 Externí integrace

| Integrace | Stav |
|-----------|------|
| Supabase | Produkční závislost pro leads + rates |
| Bank scrape (Cheerio) | Cron denně 04:00 UTC |
| Majetio URL / bridges | Částečně; sync často COMING_SOON |
| Google Analytics | Opt-in + `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Meta Pixel | Env stub — **není plný fbq loader** |
| Platební brána | Není live; `PAID_ANALYSIS_CHECKOUT_LIVE` gate |

### 1.10 SEO / structured data

- Metadata: `buildPageMetadata` / `STATIC_PAGE_SEO`
- Sitemap buckets + `robots.ts`
- JSON-LD: Organization, WebSite, FAQ, Course, Article, breadcrumbs
- BETA pages deal-room / B2B: `noIndex: true` (po 17O)

### 1.11 Tracking

- Abstrakce `track()` + adapters (noop / debug / gtag)
- Consent-gated; bez GA ID nepretenduje odesílání
- Taxonomy + north-star funnel v `analytics/*`

### 1.12 Loading / error states

- **Žádné** route-level `loading.tsx` / `error.tsx`
- Klientské hydratační `!ready` + text „Načítám…“ na mnoha tool views
- Rate tools: loading při fetch
- Async kontrakt loading/success/empty/error/fallback **není jednotný** napříč všemi surfaces — riziko pro Prompt 0 pravidla

### 1.13 Sdílené komponenty

`Providers`, `Navbar`, `Footer`, consent stack, `LeadCaptureForm`, `DataStatusBadge`, trust/provenance, `RateProvenanceBanner`, `CalculationKindBadge`, `LiveDataTrustBar`, calculators panels.

### 1.14 Zdroje finančních dat

1. Scraped CZ bank rates → Supabase → rate engine  
2. Model fallback 5 % p.a. (`rates/model-fallback.ts`) — musí být označen MODEL  
3. ČNB limity — konstanty + provenance URL  
4. Country dossiers — editorial / claims, ne live FX  
5. Investment opex / vacancy — uživatelský / model input  

---

## 2. Nalezené problémy

| ID | Závažnost | Problém |
|----|-----------|---------|
| B1 | P0 (ops/legal) | Operator + partner env často nevyplněné → soft legal / handoff off |
| B2 | P1 | `npm run lint` historicky fail (React Compiler setState-in-effect, unused vars) — `verify` padá |
| B3 | P1 | Chybí App Router `error.tsx` / `loading.tsx`; hydratační „Načítám…“ na tool pages |
| B4 | P1 | DataStatus vs Prompt: chybí `NEEDS UPDATE` (máme `STALE`); UI labely musí zůstat CS |
| B5 | P1 | BETA tools v navigaci (`/transakce`, `/profesionalni-portal`) |
| B6 | P1 | Meta Pixel jen stub |
| B7 | P2 | Middleware deprecation warning (Next 16 → proxy) |
| B8 | P2 | Dead storage constants (`hj-offer-strategy-v1`) |
| B9 | P2 | GA často unset → analytics dark |
| B10 | Info | Žádné TODO/FIXME v src; incompleteness = `COMING_SOON` feature flags |

---

## 3. Riziková místa

1. **Lead pipeline** — bez Supabase credentials API fail-closed (správně), ale UX musí mít error, ne hang.  
2. **Rate scrape** — anomálie / staging pipeline; nesmí auto-publish unnatural jumps.  
3. **Foreign financing** — `ratePercentPa: null` / UNAVAILABLE — UI nesmí vymýšlet %.  
4. **DSTI model caps (0.45)** — model, ne ČNB binding — musí zůstat označené.  
5. **Partner / licence claims** — pouze po ověřeném env.  
6. **Paid analysis** — checkout gated; text „Připravujeme“ / lead, ne falešný nákup.  
7. **Client-only demos** — deal room / B2B / vault vypadají jako produkt, data jen localStorage.  
8. **Enum leak** — interní hodnoty (`employee`) jen přes CS labely.  

---

## 4. Environment variables

### Required / critical

| Variable | Účel |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + fallback leads |
| `SUPABASE_SERVICE_ROLE_KEY` | Leads admin, scrape, pipeline |
| `CRON_SECRET` | Auth scrape / review |

### Legal / commercial (nevymýšlet hodnoty)

| Variable | Účel |
|----------|------|
| `LEGAL_OPERATOR_LEGAL_NAME` / `ICO` / `REGISTER_URL` / `DIC` / address / email / phone | Provozovatel |
| `LEGAL_PARTNER_*` (+ `NEXT_PUBLIC_*` mirror) | Partner handoff |
| `LEGAL_STRICT_PRODUCTION` / `LEGAL_REQUIRE_*` | CI hard gate |
| `PAID_ANALYSIS_CHECKOUT_LIVE` / `NEXT_PUBLIC_…` | Placená analýza |

### Optional product

| Variable | Účel |
|----------|------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Analytics |
| `NEXT_PUBLIC_META_PIXEL_ID` | Marketing stub |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | Debug events |
| `NEXT_PUBLIC_SITE_URL` | Canonical |
| `NEXT_PUBLIC_MAJETIO_BASE_URL` | Majetio links |
| `NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK` | Rentgen cena override |
| `SEO_FORCE_NOINDEX` | Preview / emergency |
| `VERCEL_ENV` / `VERCEL_URL` | Platform |
| `E2E_BASE_URL` / `AUDIT_BASE` | Scripts |

---

## 5. Externí API / služby

| Služba | Směr |
|--------|------|
| Supabase REST | Read/write rates, leads, products |
| Bank public rate pages | Scrape (server) |
| Majetio | Outbound URLs + bridge stubs |
| Google gtag | Client, consent-gated |
| ČNB (provenance URL) | Manuální / editorial check, ne live API client |

**Žádné falešné bank API klienty v kódu.** Foreign rates = UNAVAILABLE / null, ne hardcoded fake %.

---

## 6. Stav testů (baseline)

| Suite | Poznámka |
|-------|----------|
| `npm test` | Rozsáhlý unit/integration (pipeline, decision, finance-math, SEO, legal, country, …) |
| `npm run test:e2e-critical` | HTTP smoke proti běžícímu serveru |
| `npm run check:data` / `check:legal` | Catalog + soft legal |
| `npm run typecheck` | Součást baseline run |
| `npm run lint` | Známý fail risk (viz B2) |
| `npm run build` | Součást baseline run |
| Playwright | V `devDependencies`, critical path je custom node smoke |

Výsledky konkrétního běhu Prompt 0: viz závěrečný report v PR / chat (doplněno po CI lokálně).

---

## 7. Kritická TODO / incompleteness (bez vymyšlených dat)

1. Doplnit **ověřené** `LEGAL_OPERATOR_*` a případně `LEGAL_PARTNER_*` (externě).  
2. Lawyer review právních textů (`docs/LEGAL_REMAINING_STEPS.md`).  
3. Sjednotit async UI stavy (loading / empty / error / fallback) + App Router error boundaries.  
4. Opravit lint (root cause React Compiler / unused) aby `verify` prošel.  
5. Dohrát nebo z quarantiny BETA surfaces v nav.  
6. Mapovat veřejný status `STALE` → copy „Vyžaduje aktualizaci“ / rozhodnout o alias `NEEDS UPDATE`.  
7. Zapnout GA jen s consent policy.  
8. Meta Pixel — buď implementovat po policy, nebo odstranit stub z očekávání.  
9. Route-level loading/error pro kritické funnely.  
10. Production deploy smoke: `E2E_BASE_URL=https://hypotekajasne.cz npm run test:e2e-critical`.

---

## 8. Safety rules (závazné pro další prompty)

Viz Prompt 0 — shrnutí:

- Nevymýšlet finanční / právní / bankovní / regulatorní data.  
- Žádné fake API.  
- Model ≠ LIVE. Status badge povinný.  
- Odstranit user-visible tech stringy (`employee`, `undefined`, `null`, `TODO`, raw enums).  
- Žádný infinite „Načítám…“.  
- Nepředstírat licenci partnera ani právní audit.  
- CS copy, a11y (keyboard, labels, focus, semantic HTML).  
- Po větších změnách: lint, typecheck, build, relevant tests.  
- Opravovat root cause.

---

## 9. Baseline run log (2026-07-21 Prompt 0)

| Check | Výsledek | Poznámka |
|-------|----------|----------|
| typecheck (`tsc --noEmit`) | **PASS** | Exit 0 |
| lint (`eslint`) | **FAIL** | ~19 errors / ~32 warnings — převážně `react-hooks/set-state-in-effect`, unused vars, prefer-const. **Není type/build blocker**; fix v pozdějším remediation promptu (root cause), ne v Prompt 0. |
| build (`next build`) | **PASS** | Exit 0; Next 16.2.10 Turbopack; warning middleware→proxy |
| Code changes in Prompt 0 | `docs/remediation-baseline.md` only | Žádný redesign; žádná změna kalkulací / dat |

---

*Konec baseline dokumentu. Další remediation prompty navazují na sekce 2–7.*
