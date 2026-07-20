# Final Release Scorecard — HypotékaJasně.cz

**Datum:** 2026-07-20  
**Canonical:** https://hypotekajasne.cz  
**Audit scope:** language · responsive · financial data · copy · UX · navigation · mobile · a11y · performance · production wording  
**Gate:** žádné skóre &lt; 9/10 bez konkrétního P1/P2 ticketu.

---

## Verdikt

# CONDITIONAL GO

Produkt je technicky buildovatelný, lokalizace CS je po opravách konzistentní, responzivita nemá P0/P1 page scroll, SEO/a11y smoke a finanční unit testy procházejí.  
**Plné GO** blokují externí právní / provozní položky (IČO, právní review, partner JERRS) — ne chybějící produktové funkce.

---

## Scoring (0–10)

| Oblast | Skóre | Zdůvodnění | Tickets pokud &lt; 9 |
|--------|-------|------------|---------------------|
| Design | **9** | Teal/gold systém, konzistentní heading/body, hero bez card clutter na hlavních landing | — |
| Responsive | **9** | Viz `docs/RESPONSIVE_QA.md` — 0 P0/P1 page H-scroll po retestu; desktop nav od xl; tabulky/charts localized scroll | — |
| Czech localization | **9** | P0 developer EN odstraněn; FAQ→Časté otázky; Trust Center→Centrum důvěry; Dashboard→přehled; Cash-Flow→peněžní tok | P2: zbytky anglicismů (ROI/SWOT v subnav — povolené zkratky; „Cookies“ v právním kontextu OK jako „Zásady cookies“) |
| UX | **9** | Hlavní nástroje mají účel / význam / další krok; claim badges; empty/loading stavy | P2: sjednotit „co dál“ CTA na okrajových tool pages (alerty, reporty) |
| Data trust | **9** | Claim kinds CS, freshness badges, metodika `/metodika`, Centrum důvěry | P1-ext: expert refresh zahraničních sazeb |
| Financial correctness | **9** | `test:money`, pipeline, financing, investment — měna bez FX záměny; RPSN/LTV v modelech oddělené od bankovní nabídky | — |
| SEO | **9** | Unique titles, sitemap index, JSON-LD bez fake reviews, canonical host, hreflang EN hub | P2: Lighthouse field data po deploy |
| Performance | **8** | Build OK; SSR/SSG klíčových stránek; GA gated | **P1:** změřit LCP/CLS na produkčním preview; **P2:** snížit client islands u těžkých tool views |
| Accessibility | **8** | Cookie dialog ARIA, breadcrumbs, sticky header, keyboard Tab smoke OK | **P1:** axe/Lighthouse na `/`, `/navrh-na-miru`, `/investicni-rentgen`; **P2:** ESLint `set-state-in-effect` (React Compiler) — tech debt |
| Legal readiness | **7** | Consent-only cookies, oddělené checkboxy, draft texty bez public TODO | **P1-ext:** IČO + právník (`docs/LEGAL_REMAINING_STEPS.md`); checkout placené analýzy off do live |
| Conversion | **9** | Intent paths, readiness, rentgen CTA, consent-gated analytics funnel | P2: wire `calculator_completed` na všechny calc finish paths |
| Consistency | **9** | Statusy Dostupné / Beta (ověřujeme) / Připravujeme; nav CS; footer disclaimer bez interních review vět | P2: dočistit API route developer notes (ne UI) |

**Průměr (aritmetický):** ≈ **8.7** — release gate = CONDITIONAL GO (legal/performance field data).

---

## Audit 1 — Language (CS)

| Stav | Detail |
|------|--------|
| Fixed | Developer EN (localStorage, revoke, In-app/LIVE enums, share link, SaaS enforce) |
| Fixed | FAQ → Časté otázky; Trust Center → Centrum důvěry; Dashboard → Můj přehled |
| Fixed | Cash-Flow → peněžní tok; Upload → nahrání; Newsletter → Novinky e-mailem; Timeline → Časová osa; Scraped → Ze zdroje banky; Provenience → Původ dat |
| Fixed | Marketing „absolutně nejlepší VIP sazby“ → střízlivý model text |
| Allowed | LTV, RPSN, ROI, IRR, DSTI, DTI, Majetio, HypotékaJasně, S&P 500 |
| P2 | Okrajové EN v interních API comments / EN hub (`/en`) — záměr |

## Audit 2 — Responsive

Viz `docs/RESPONSIVE_QA.md`. Gate: **0 P0 / 0 P1** page horizontal scroll.

## Audit 3 — Financial data

| Check | Result |
|-------|--------|
| `formatMoney` CZK/AED/EUR bez FX záměny | PASS (`test:money`) |
| Financing CASH / local / unavailable | PASS (`test:financing`) |
| Pipeline normalize + rates | PASS (`test:pipeline`) |
| Model ≠ bankovní nabídka v UI copy | PASS (claim badges) |

## Audit 4 — Copy

| Removed / softened | Location |
|--------------------|----------|
| absolutně nejlepší VIP sazby | `cz-guide-articles-data.ts` |
| BETA localStorage / signed URL | Document vault, report share |
| REVOKED / Revoke / Token jargon | Report share panel |
| rates N/A | `mock-data.ts` → „Bez bankovního úvěru“ |

## Audit 5 — UX (hlavní stránky)

| Route | Co mohu | Co znamená | Co dál |
|-------|---------|------------|--------|
| `/` | Intent + affordability | Model rozpočtu | Připravenost / země / rentgen |
| `/navrh-na-miru` | Skóre připravenosti | Band + gaps | Partner / pas |
| `/investicni-rentgen` | Analýza nemovitosti | Claim layers | Prémiová poptávka / Majetio |
| `/akademie` | Lekce / cesty | Progress | Další lekce |
| `/duvera` | Role platformy | Trust | Metodika / kontakt |

## Audit 6 — Navigation

- Žádné dead `routes.ts` odkazy vůči `page.tsx`.
- Magazín: textové odkazy (ne image-only).
- Majetio funkce: status badges (Připravujeme / Beta).

## Audit 7 — Mobile

Formuláře single-column; tabulky inner-scroll; nav hamburger &lt;1280; cookie max-height + main padding.

## Audit 8 — Accessibility

| Check | Result |
|-------|--------|
| `test:a11y-smoke` | PASS |
| Keyboard Tab homepage | PASS (25/25) |
| Cookie `role=dialog` + labels | PASS |
| Full axe CI | **P1 open** |

## Audit 9 — Performance

| Check | Result |
|-------|--------|
| `npm run build` | PASS (2026-07-20) |
| Field CWV | **P1 open** — změřit po deploy |
| Layout shift data load | Skeletons na dashboard; charts `min-w-0` |

## Audit 10 — Production copy

| Forbidden in public UI | Status |
|------------------------|--------|
| SSR / Source of Truth / Data provenance / productId labels | PASS (UI) |
| TODO / Legal review banners | PASS |
| Developer localStorage messaging | Fixed |
| Scanner | `test:release-audit` rozšířen |

---

## Automatizované běhy (2026-07-20)

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** |
| `npm run test:release-audit` | **PASS** |
| `npm run test:a11y-smoke` | **PASS** |
| `npm run test:seo` | **PASS** |
| `npm run test:money` | **PASS** |
| `npm run test:nav` | **PASS** (aktualizováno na xl desktop) |
| `npm run test:pipeline` | **PASS** |
| `npm run test:financing` | **PASS** |
| `npm run lint` | **FAIL*** — 21× převážně `react-hooks/set-state-in-effect` (React Compiler) + drobné prefer-const |
| `npm run check:data` | PASS (v rámci test suite) |

\*Lint není ship-blocker funkcí, ale **P2 ticket**: vyčistit setState-in-effect / impure Date.now v B2B demo handlerech.

---

## Co bylo opraveno v tomto auditu

1. CS lokalizace P0/P1 (developer EN, FAQ, Trust, Dashboard, Cash-Flow, Upload, Newsletter, Timeline, Scraped, Provenience, notify statuses, share panel).
2. Marketing absolut „nejlepší VIP sazby“.
3. rates `N/A` → srozumitelný CS text.
4. Feature badge „Beta (ověřujeme)“.
5. Nav testy + desktop breakpoint xl (responsive).
6. Rozšířený `release-audit` scanner proti developer jargon.
7. Cookies footer/legal label → „Zásady cookies“.

## Co zůstává (tickets)

| ID | Severity | Owner | Popis |
|----|----------|-------|-------|
| LEG-01 | **P1-ext** | Provozovatel + právník | IČO, právní jméno, ARES — `docs/LEGAL_REMAINING_STEPS.md` |
| LEG-02 | **P1-ext** | Právník | Finální review GDPR/cookies/smlouvy před placeným checkoutem |
| PAR-01 | **P1-ext** | Ops | Ověření partnerů JERRS / URL na `/partneri` |
| DAT-01 | **P1-ext** | Doménový expert | Refresh zahraničních financing % |
| PERF-01 | **P1** | Eng | Field LCP/CLS/INP na Vercel preview (Home, Rentgen, Připravenost) |
| A11Y-01 | **P1** | Eng | axe + keyboard audit 3 klíčových flows |
| LINT-01 | **P2** | Eng | ESLint React Compiler set-state-in-effect (~15 views) |
| CONV-01 | **P2** | Eng | `calculator_completed` na všechny kalkulačky |
| COPY-01 | **P2** | Eng | Dočistit EN v API route notes (ne UI) |

---

## Doporučený launch checklist

1. Vyplnit `LEGAL_OPERATOR_*` v produkčním env.  
2. Právník greenlight draft textů.  
3. Spustit PERF-01 + A11Y-01 na preview URL.  
4. `PAID_ANALYSIS_CHECKOUT_LIVE` nechat **false**, dokud LEG-01/02.  
5. Soft launch: organická návštěva + manuální smoke 320/375/1280.  
6. Po uzavření P1-ext → změnit verdikt na **GO**.

---

## Související dokumenty

- `docs/RESPONSIVE_QA.md`
- `docs/LEGAL_REMAINING_STEPS.md`
- `docs/RELEASE_SCORECARD.md` (historický)
- `docs/responsive-audit-raw.json`
