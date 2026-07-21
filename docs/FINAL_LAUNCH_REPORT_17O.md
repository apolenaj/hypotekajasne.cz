# FINAL LAUNCH REPORT — PROMPT 17O

**Date:** 2026-07-21  
**Scope:** HypotékaJasně.cz production launch gate (audit + critical-path smoke).  
**Rule:** No new “wow” features. Evidence-based; unverified items marked MANUAL.

---

## FINAL LAUNCH REPORT

**Overall score: 6.5 / 10**

**Recommended Launch Decision: CONDITIONAL GO**

Soft public launch (education + calculators + operator-only leads) is viable **if** marketing copy stays honest.  
Full marketing scale (named specialist handoff, paid analysis checkout, “complete legal identity”) is **NO-GO** until P0 items below are closed.

---

## P0 Launch Blockers

### P0-1 — Operator legal identity incomplete
- **Route:** `/pravni/*`, `/partneri`, paid analysis gate  
- **File:** `src/lib/legal/operator.ts`, `.env.local`  
- **Problem:** `LEGAL_OPERATOR_LEGAL_NAME`, `LEGAL_OPERATOR_ICO`, `LEGAL_OPERATOR_REGISTER_URL` = **MISSING** (verified presence check; values not logged).  
- **Impact:** Paid checkout stays off; legal pages cannot claim full production-ready operator identity.  
- **Fix:** Fill verified env; confirm ARES/register URL.  
- **Verify:** `npm run check:legal` with `LEGAL_STRICT_PRODUCTION=true` → no OPERATOR errors; MANUAL review of `/pravni/gdpr`.

### P0-2 — Mortgage partner identity unpublished
- **Route:** `/partneri`, lead forms, `/navrh-na-miru`  
- **File:** `src/lib/legal/partner-config.ts`  
- **Problem:** `LEGAL_PARTNER_LEGAL_NAME` / IČO / JERRS URL **MISSING** → handoff soft mode (provozovatel-only).  
- **Impact:** Marketing that promises a **named licensed specialist handoff** would be false. Code correctly withholds partner checkbox when not ready.  
- **Fix:** Either (A) fill verified partner env + public NEXT_PUBLIC mirrors, or (B) keep soft launch and train ads/copy: “nezávazná konzultace / specialista — identifikace zveřejníme po ověření”.  
- **Verify:** `/partneri` + form consent; `isMortgagePartnerHandoffReady() === true` only after env.

### P0-3 — Deploy freshness (stale process risk)
- **Route:** `/moje-moznosti` (primary hero CTA)  
- **File:** `src/app/moje-moznosti/page.tsx`  
- **Problem:** E2E against **stale** process on `:3000` returned **404**; fresh `next build` + `:3005` returned **200**.  
- **Impact:** If production serves an old artifact, north-star funnel breaks.  
- **Fix:** Redeploy from commit that includes `/moje-moznosti`; smoke `GET /moje-moznosti` post-deploy.  
- **Verify:** `E2E_BASE_URL=https://<prod> npm run test:e2e-critical`

### P0-4 — Legal texts still marked draft for lawyer review
- **Route:** legal surfaces using `LAWYER_REVIEW_NOTICE`  
- **File:** `src/lib/legal/roles.ts`  
- **Problem:** Explicit notice that texts need Czech lawyer review before production.  
- **Impact:** Compliance risk if marketed as fully lawyer-approved GDPR/terms.  
- **Fix:** External lawyer sign-off; then remove/replace draft notice.  
- **Verify:** MANUAL lawyer checklist + `docs/LEGAL_REMAINING_STEPS.md`.

---

## P1 Before Scaling

| ID | Route / file | Problem | Impact | Fix | Verify |
|----|--------------|---------|--------|-----|--------|
| P1-1 | ESLint repo-wide | **19 errors**, 32 warnings — `npm run lint` / `verify` **FAIL** | CI/quality gate broken; React Compiler setState-in-effect noise | Triage React Compiler rules; fix prefer-const / unused | `npm run lint` exit 0 |
| P1-2 | Nav „Více“ → `/transakce`, `/profesionalni-portal` | BETA demos still in primary nav | Users treat demos as live product | Label BETA or demote from nav | MANUAL nav click |
| P1-3 | SEO catalog | BETA pages were indexable | Fixed this audit: `noIndex: true` on deal room + B2B in `src/lib/seo/pages.ts` | Keep until GA live | `npm run test:seo`; sitemap excludes |
| P1-4 | Mobile `<sm` | Header CTA `hidden … sm:inline-flex` (`Navbar.tsx`) | Ad traffic @390px must open hamburger for CTA | Keep drawer CTA obvious; MANUAL fold test | 390px Chrome |
| P1-5 | Cookie banner | `z-[100]` fixed bottom | May obscure CTAs | MANUAL pad/`--cookie-banner-pad` | first visit 390px |
| P1-6 | GA | `NEXT_PUBLIC_GA_MEASUREMENT_ID` MISSING | Analytics dark for launch KPIs | Set ID + consent banner QA | `analyticsStatus()` |
| P1-7 | Model rate 5% | `src/lib/rates/model-fallback.ts` | OK if labelled; risk if some UI omits badge | Spot-check `RateProvenanceBanner` / CalculationKindBadge | MANUAL |
| P1-8 | Paid analysis | Checkout gated (`PAID_ANALYSIS_CHECKOUT_LIVE` MISSING) | OK for soft launch; don’t advertise instant purchase | Keep gated until operator+lawyer ready | `/investicni-rentgen` premium CTA |

---

## P2 Post-launch

- Sticky mobile CTA (not present — missing enhancement, not a bug).  
- `/moje-moznosti` is `noIndex` (privacy/funnel) — intentional SEO tradeoff.  
- Academy media mostly PLANNED placeholders (`AcademyMediaPlaceholders`).  
- Full Playwright visual regression suite.  
- Hide/quarantine more experimental tools (alert center, digital twin demos) if noise.  
- Server-side cookie consent audit trail (optional per legal docs).

---

## Category Scores (0–10)

| Category | Score | Notes |
|----------|------:|-------|
| First impression | 7 | Clear brand hero + primary CTA → moje možnosti (code). Visual fold = MANUAL |
| Value proposition | 8 | Diagnostics / calculators / education — not “bank approval” |
| Navigation | 6 | Rich but dense; BETA entries; wording mismatch „dovolit“ vs „půjčit“ |
| Mobile UX | 6 | Structure OK; header CTA hidden &lt;sm; cookie risk = MANUAL |
| Calculator reliability | 8 | `finance-math` golden suite + financing/decision/investment tests |
| Data trust | 8 | Provenance, statuses, no invented foreign rates |
| Country accuracy architecture | 8 | Jurisdiction matrix + contamination tests; Dubai rates UNAVAILABLE |
| Lead conversion | 7 | Supabase credentials SET locally; invalid payload → 400; partner soft mode |
| Trust | 7 | Disclaimers, methodology, zdroje; partner unpublished is honest |
| Compliance readiness | 5 | Soft legal OK; lawyer draft + missing operator/partner = incomplete |
| SEO | 7 | Strong metadata/sitemap/json-ld tests; BETA noIndex applied |
| Performance | — | **MANUAL VERIFICATION REQUIRED** (Lighthouse / field CWV) |
| Accessibility | 7 | a11y smoke + responsive tests; full AT = MANUAL |
| AI usefulness | 7 | Copilot citations / no rate hallucination policy in tests |
| Business monetization clarity | 6 | `/jak-vydelavame` + gated premium; partner compensation disclosure ready when LIVE |
| Error handling | 7 | Leads fail closed; rate model fallback labelled |
| Production polish | 4 | Lint fail; large surface; stale-server trap |

---

## Automated Test Results

| Check | Result |
|-------|--------|
| `npm run typecheck` | **PASS** |
| `npm test` (unit/integration suite) | **PASS** (exit 0) |
| `npm run test:seo` | **PASS** (29) |
| `npm run test:finance-math` | **PASS** (43) — run earlier in 17N |
| `npm run check:data` | **PASS** |
| `npm run check:legal` | **PASS with WARN** (partner + operator soft) |
| `npm run lint` | **FAIL** — 19 errors, 32 warnings |
| `npm run build` | **PASS** (106 static routes; includes `/moje-moznosti`) |
| `npm run test:e2e-critical` @ `:3005` (fresh build) | **PASS** |
| `npm run test:e2e-critical` @ `:3000` (stale) | **FAIL** — `/moje-moznosti` 404 |
| Playwright | **Not present** — lean HTTP smoke added: `scripts/e2e-critical-paths.mjs` |
| Lighthouse / real device 390px | **MANUAL VERIFICATION REQUIRED** |
| Live lead insert to Supabase | **MANUAL VERIFICATION REQUIRED** |
| Hydration / console errors in browser | **MANUAL VERIFICATION REQUIRED** |

### Env presence (`.env.local`, values not disclosed)

| Key | Status |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | SET |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | SET |
| `SUPABASE_SERVICE_ROLE_KEY` | SET |
| `LEGAL_OPERATOR_*` (name/IČO/register) | MISSING |
| `LEGAL_PARTNER_*` | MISSING |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | MISSING |
| `PAID_ANALYSIS_CHECKOUT_LIVE` | MISSING |

---

## Persona journeys (code + HTTP smoke)

| Persona | Path | Automated | Manual still needed |
|---------|------|-----------|---------------------|
| 1 First buyer | `/` → `/moje-moznosti` → `/kalkulacky` → `/navrh-na-miru` | Routes 200 on fresh build | Wizard complete + lead submit |
| 2 Dubai investor | `/pruvodce-investora/dubaj` → financing → modelář → rentgen | Routes 200 | Financing UNAVAILABLE UX clarity |
| 3 Property | `/investicni-rentgen` free → premium | Route 200 | Free compute + premium form |
| 4 Novice | `/akademie` → calc → `/financni-pas` | Routes 200 | Full lesson path |
| 5 Mobile ad | 390px first visit | Code review only | **MANUAL** cookie + hamburger + hero |

---

## Manual Verification Still Required

1. Chrome 390×844 throttled 3G: hero CTA, cookie vs content, drawer CTA.  
2. Submit real lead on `/navrh-na-miru` → row in Supabase `leads`.  
3. Visual check RateProvenanceBanner when API rates down.  
4. Lawyer review of GDPR / cookies / contracts / paid analysis terms.  
5. Production deploy smoke: `test:e2e-critical` against production URL.  
6. Lighthouse LCP/INP/CLS on `/` and `/kalkulacky`.  
7. Screen reader pass on lead form + cookie banner.  
8. Confirm marketing landing pages do not name unpublished partner.

---

## Changes made during this audit (non-wow)

1. `noIndex: true` for BETA `/transakce` and `/profesionalni-portal` in `src/lib/seo/pages.ts`.  
2. Critical-path E2E: `scripts/e2e-critical-paths.mjs` + `npm run test:e2e-critical`.

---

## Decision summary

| Mode | Decision |
|------|----------|
| Soft launch: education + tools + operator-only leads | **CONDITIONAL GO** after fresh deploy smoke |
| Paid ads promising named licensed handoff | **NO-GO** until P0-2 |
| Paid analysis checkout live | **NO-GO** until P0-1 + lawyer + checkout flag |
| Claim “10/10 production polish” | **NO** — lint fail + compliance soft |
