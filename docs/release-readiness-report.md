# Release readiness report — Hypotéka Jasně

**Datum auditu:** 2026-07-22  
**Scope:** PROMPT 20 — finální QA, regression suite, release gate  
**Verze build spec:** `FUNNEL_DASHBOARD_SPEC.version` = 2026-07-22.19M  
**Auditor:** automatizované příkazy + HTTP smoke proti lokální produkční build (`npm run start`)

---

## Verdikt

| Stav | Hodnocení |
|------|-----------|
| **NOT READY** (PUBLIC / paid) | Ano — legal production gate a ESLint errors |
| **BETA READY** | Ano — core flows 200, unit suite green, build OK |
| **PUBLIC READY** | Ne |
| **PAID TRAFFIC READY** | Ne — chybí legal identita, partner handoff env, premium rentgen offline |

---

## Spuštěné příkazy (skutečné výsledky)

| Příkaz | Exit | Výsledek |
|--------|------|----------|
| `npm run lint` | **1** | 53 problémů: **18 errors**, 35 warnings (`react-hooks/set-state-in-effect`, `react-hooks/purity`, `prefer-const`, `@next/next/no-img-element`, unused vars) |
| `npm run typecheck` | **0** | OK |
| `npm run check:data` | **0** | OK — 21 katalog ID, provenance checks |
| `npm run check:legal` (soft) | **0** | OK s 3× WARN (`PARTNER_HANDOFF_SOFT`, `OPERATOR_IDENTITY_SOFT`, `LEGAL_TEXT_NOT_REVIEWED`) |
| `LEGAL_STRICT_PRODUCTION=true npm run check:legal` | **1** | **2× ERROR** — partner handoff + operator identity |
| `npm test` | **0** | Celá unit/integration suite OK (~170 s) |
| `npm run test:regression-gate` | **0** | 10/10 (nový soubor) |
| `npm run test:release-audit` | **0** | 7/7 |
| `npm run test:a11y-smoke` | **0** | 6/6 |
| `npm run build` (1. pokus) | **1** | `EPERM: unlink .next\server\app\akademie` (OneDrive lock) |
| `npm run build` (po smazání `.next`) | **0** | OK — statická generace routes |
| `npm run start` + `npm run test:e2e-critical` | **0** | 22 critical + 3 optional GET → 200; POST `/api/leads` invalid → 400 |
| Extra HTTP smoke (PowerShell `Invoke-WebRequest`) | **0** | 200: `/copilot`, `/refinancovani-radar`, `/duvera`, `/o-nas`, `/financni-pas`, `/faq` |
| `AUDIT_BASE=http://127.0.0.1:3000 node scripts/responsive-audit.mjs` | **0** | OK (~11 min) — **385 kombinací route×viewport**, 0× P0, **1× P1**; raw JSON → `docs/responsive-audit-raw.json` |

### Manuální viewport matice (Chrome / Edge / 360 / 390 / 430 / 768)

**Automatizováno** přes `responsive-audit.mjs` (360, 390, 430, 768 px v matici + zoom/font/nav checks). **Manuální Chrome/Edge desktop** nebyl otevřen — doplnit před PUBLIC READY.

---

## Interní release score

| Oblast | Skóre | Poznámka |
|--------|-------|----------|
| Functionality | **7/10** | Klíčové routes 200; premium rentgen / B2B části „Připravujeme“ |
| UX | **7.5/10** | 360/390/430/768 bez overflow; 1× P1 horizontální scroll na `/` při zoom 200 % |
| Trust | **8/10** | Claim badges, rate status pipeline, partner claim gating |
| Data integrity | **8/10** | Regression gate + rate-engine + finance-math green |
| Legal readiness | **4/10** | Strict gate fail; soft warnings |
| SEO | **8/10** | `generateMetadata` / static SEO, sitemap 200 |
| Performance | **6/10** | Build OK; Lighthouse / Core Web Vitals neběžely |
| Accessibility | **7/10** | Static a11y smoke OK; bez axe/Lighthouse |

---

## Regression suite (PROMPT 20)

Nový soubor: `src/lib/release/regression-gate.test.ts`  
Spouštění: `npm run test:regression-gate`

| Oblast | Test |
|--------|------|
| Anuitní výpočet | Golden 4M / 5% / 30y ≈ 21 472,87 Kč |
| LTV rule engine | Mladý ≤36 → 90 %; 3. nemovitost → investment 70 % |
| Partner verification | UNVERIFIED → žádné silné „prověřený“ labely |
| Data status fallback | STALE/UNVERIFIED → „Data ověřujeme“ |
| LIVE/STALE/MODEL rates | `resolveMortgageRate` chain |
| Legal production gate | Soft warnings vs forced strict errors |

Opraveno v `release-audit.test.ts`: analytics count **56**, scanner ignoruje komentáře (ne user-facing `localStorage`).

---

## Klíčové flows — HTTP smoke

| Flow | Route | Status |
|------|-------|--------|
| Homepage | `/` | 200 |
| Hypoteční připravenost | `/navrh-na-miru` | 200 |
| Kalkulačky | `/kalkulacky` | 200 |
| Finanční pas | `/financni-pas` | 200 |
| Investiční pas | `/investicni-pas` | 200 |
| Investiční rentgen | `/investicni-rentgen` | 200 |
| AI Copilot | `/copilot` | 200 |
| Refinancování | `/refinancovani-radar` | 200 |
| Akademie | `/akademie` | 200 |
| Zahraniční průvodci | `/pruvodce-investora`, `/pruvodce-investora/dubaj` | 200 |
| Trust centrum | `/duvera` | 200 |
| Metodika | `/metodika` | 200 |
| Zdroje | `/zdroje` | 200 |
| O nás | `/o-nas` | 200 |
| Kontakt / lead | `/kontakt` | 200 |
| GDPR | `/pravni/gdpr` | 200 |
| Podmínky | `/pravni/zasady` | 200 |

Console errors / hydration / infinite loading: **neauditováno v prohlížeči** v tomto běhu (jen server-side fetch).

---

# P0 BLOCKERS

### P0-1 — Legal production gate selže ve strict režimu

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P0 |
| **Route** | Build + všechny lead formuláře |
| **Reprodukce** | `LEGAL_STRICT_PRODUCTION=true npm run check:legal` |
| **Výstup** | `PARTNER_HANDOFF_NOT_READY`, `OPERATOR_IDENTITY_REQUIRED_FOR_LEADS` |
| **Řešení** | Vyplnit env dle `docs/legal-production-checklist.md` (`LEGAL_OPERATOR_*`, `LEGAL_PARTNER_*`). Na Vercel Production build selže bez `isLegalIdentityComplete()`. |

### P0-2 — ESLint errors (18)

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P0 (CI gate) |
| **Route** | N/A — kód |
| **Reprodukce** | `npm run lint` → exit 1 |
| **Dotčené soubory (výběr)** | `AcademyPathsHub.tsx`, `RefinanceRadarView.tsx`, `B2bPortalView.tsx`, `rates.ts`, `b2b-portal.test.ts` |
| **Řešení** | Refaktor localStorage hydration na `useSyncExternalStore` / lazy init; odstranit `Date.now()` v renderu; opravit `prefer-const` v testech. |

### P0-3 — Production build na OneDrive (EPERM)

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN (ops) |
| **Severity** | P0 pro lokální release |
| **Route** | `npm run build` |
| **Reprodukce** | První build bez smazání `.next` → `EPERM unlink ...\akademie` |
| **Řešení** | Build mimo sync složku, nebo před buildem smazat `.next`; CI na Vercel tento problém typicky nemá. |

---

# P1 IMPORTANT

### P1-1 — Právní texty bez formálního review

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P1 |
| **Route** | `/pravni/*` |
| **Reprodukce** | `check:legal` → `LEGAL_TEXT_NOT_REVIEWED` |
| **Řešení** | Nastavit `LEGAL_REVIEWED_BY`, `LEGAL_LAST_REVIEW_DATE`; neuvádět „právně zkontrolováno“ bez toho. |

### P1-2 — Premium Investiční rentgen není prodejný

| Pole | Hodnota |
|------|---------|
| **Status** | KNOWN / by design |
| **Severity** | P1 pro paid traffic |
| **Route** | `/investicni-rentgen` |
| **Reprodukce** | UI copy „Připravujeme — zatím nelze koupit online“ |
| **Řešení** | Dokončit checkout + SLA; do té doby neposílat paid traffic na premium CTA. |

### P1-3 — Homepage horizontální scroll při zoom 200 %

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P1 |
| **Route** | `/` @ 1280×720, zoom 200 % |
| **Reprodukce** | `AUDIT_BASE=http://127.0.0.1:3000 node scripts/responsive-audit.mjs` → `+76px` overflow; offender: `<a>` s třídou `inline-flex … hover:text-deep-teal` |
| **Řešení** | `min-w-0` na flex children v hero/header; zkrátit nebo zalomit dlouhý link text. |

### P1-4 — Partner handoff soft mode

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P1 |
| **Route** | `/partneri`, lead handoff |
| **Reprodukce** | `PARTNER_HANDOFF_SOFT` warning |
| **Řešení** | Zveřejnit ověřenou identitu partnera + JERRS URL. |

### P1-5 — React hooks lint v produkčních view

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P1 |
| **Route** | `/refinancovani-radar`, `/akademie/cesty`, `/dashboard`, … |
| **Reprodukce** | ESLint `react-hooks/set-state-in-effect` |
| **Řešení** | Sjednotit pattern s `useSyncExternalStore` (viz `RefinanceRadarView` online hook). |

---

# P2 IMPROVEMENTS

### P2-1 — ESLint warnings (35)

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P2 |
| **Route** | N/A |
| **Reprodukce** | `npm run lint` |
| **Řešení** | Postupný cleanup unused vars, `next/image` místo `<img>` (`CountryInvestmentHub`, `UnifiedDestinationCards`). |

### P2-2 — Performance baseline chybí

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P2 |
| **Route** | `/`, `/kalkulacky` |
| **Reprodukce** | Lighthouse neběžel |
| **Řešení** | Přidat Lighthouse CI budget (LCP, CLS, INP). |

### P2-3 — E2E critical paths neobsahují všechny flows z matice

| Pole | Hodnota |
|------|---------|
| **Status** | OPEN |
| **Severity** | P2 |
| **Route** | `scripts/e2e-critical-paths.mjs` |
| **Reprodukce** | Chybí `/copilot`, `/refinancovani-radar`, `/duvera` v default listu (manuálně 200) |
| **Řešení** | Rozšířit `CRITICAL_GET` o tyto cesty. |

### P2-4 — Manuální cross-browser QA

| Pole | Hodnota |
|------|---------|
| **Status** | NOT RUN |
| **Severity** | P2 |
| **Route** | Celý web |
| **Reprodukce** | Chrome + Edge desktop/mobile nebyly otevřeny v tomto auditu |
| **Řešení** | Checklist před PUBLIC READY. |

### P2-5 — Visible „Připravujeme“ copy (intentional)

| Pole | Hodnota |
|------|---------|
| **Status** | ACCEPTED |
| **Severity** | P2 |
| **Route** | Rentgen premium, B2B portal, LegalView |
| **Reprodukce** | Grep „Připravujeme“ v komponentách |
| **Řešení** | OK pro beta; sledovat konverzi a očekávání uživatelů. |

---

## Opravy provedené během auditu (blocker fixes)

1. `src/lib/release/regression-gate.test.ts` — nová regression baterie (PROMPT 20).
2. `src/lib/release/release-audit.test.ts` — analytics 56, comment-safe jargon scan.
3. `package.json` — přidány skripty `test:regression-gate`, `test:a11y-smoke` (dříve volané z `npm test` bez definice).
4. `FinancialPassportView.tsx` — odstraněn user-facing text „localStorage“ (release audit).

---

## Doporučený postup před PUBLIC READY

1. Vyřešit **P0-1** (legal env) a ověřit `npm run build` na Vercel Production.
2. Snížit **P0-2** ESLint errors na 0; zapnout lint v CI.
3. Opravit **P1-3** overflow na homepage (zoom 200 %).
4. Rozšířit **e2e-critical** o copilot, refinancování, duvera.
5. Teprve potom zvážit **PAID TRAFFIC** (premium produkt + analytics consent + partner handoff).

---

*Report generován z reálných exit kódů příkazů v lokálním prostředí Windows 11 + Node npm workspace `HypotekaJasne.cz`.*
