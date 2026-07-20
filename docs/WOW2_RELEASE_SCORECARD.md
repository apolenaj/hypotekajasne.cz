# HypotékaJasně.cz + Majetio — WOW 2.0 Release Scorecard

**Datum auditu:** 2026-07-20  
**Verze platformy:** engineering RC (CI green)  
**Auditor:** system audit — customer journeys, integrace, konzistence  
**Cíl:** Ověřit, že jde o **jeden konzistentní systém**, ne sbírku funkcí.

**Reference identity:** Revolut (jednoduchost) + Bloomberg (data clarity) + Zillow (property discovery) + modern mortgage advisor — s vlastní identitou HypotékaJasně / Majetio.

---

## Executive verdict

| Otázka | Odpověď |
|--------|---------|
| Je to jeden systém? | **Částečně** — sdílené typy (ClaimKind, FeatureStatus, Financial Passport v2), Report Engine, NBA, data catalog existují, ale **journey wiring a SoT migrace nejsou dokončené**. |
| Je produkt WOW 2.0 ready? | **Ne pro launche jako ucelený lifecycle produkt** — silné moduly, slabé **handoffy mezi nimi**. |
| Engineering RC? | **Ano** — lint, typecheck, build, 20+ test suites, SEO/release audit. |
| Production trust gate? | **Ne** — demo personalizace v Alert Center, chybí fixation date v profilu, partner IČO/JERRS, lawyer sign-off (viz RELEASE_SCORECARD.md). |

**Hlavní diagnóza:** Platforma má **16+ BETA modulů** a kvalitní guardrails, ale chybí **Journey Orchestrator** — jednotná vrstva, která propojí kroky A/B/C a odstraní duplicitní dashboardy / alerty / prázdné větve.

---

## Scoring summary (0–10)

| Oblast | Skóre | Cíl WOW 2.0 |
|--------|------:|-------------|
| **Product usefulness** | **7.2** | 9+ |
| **Trust** | **7.8** | 9+ |
| **Data quality** | **7.0** | 9+ |
| **Personalization** | **6.2** | 9+ |
| **AI intelligence** | **7.5** | 9+ |
| **Conversion** | **6.5** | 9+ |
| **Retention** | **7.0** | 9+ |
| **Design** | **8.2** | 9+ |
| **Mobile** | **7.3** | 9+ |
| **Performance** | **7.6** | 9+ |
| **Accessibility** | **7.0** | 9+ |
| **SEO** | **8.7** | 9+ |
| **Monetization readiness** | **7.4** | 9+ |
| **Průměr** | **7.3** | **9.0** |

> Položky pod 9/10 mají P1/P2 akce níže.

---

## Customer Journey A — First-time buyer / owner-occupier

**Spec:** Visitor → Calculator → Financial Passport → Mortgage Readiness → Majetio matches → Property analysis → Deal Room → Mortgage → Ownership → Refinance

| Krok | Route | Journey link | 3 otázky (Q1/Q2/Q3) |
|------|-------|--------------|---------------------|
| Visitor | `/` | ✅ Hero → calc / intent | ✅ / ⚠️ / ⚠️ (refinance intent → calc, ne radar) |
| Calculator | `/kalkulacky` | ⚠️ → Readiness, ne Passport | ✅ / ✅ / ⚠️ (LeadGen → děkujeme dead-end) |
| Financial Passport | `/financni-pas` | ⚠️ vyžaduje profil z Readiness | ✅ / ✅ / ⚠️ (Copilot místo next step) |
| Mortgage Readiness | `/navrh-na-miru` | ✅ → Passport, Majetio | ✅ / ✅ / ✅ |
| Majetio matches | external + `/o-majetio` | ⚠️ exit bez return path | ⚠️ / ⚠️ / ❌ (žádný CTA → Rentgen) |
| Property analysis | `/investicni-rentgen` | ❌ bez → Deal Room | ✅ / ✅ / ⚠️ (Premium → lead, ne transakce) |
| Deal Room | `/transakce` | ⚠️ jen z Due Diligence / Offer | ✅ / ✅ / ⚠️ (financing → radar, skip mortgage) |
| Mortgage | *fragmentováno* | ❌ žádná jednotná route | ⚠️ / ⚠️ / ❌ |
| Ownership | `/portfolio` | ❌ není post-close flow | ⚠️ demo maskuje prázdný stav |
| Refinance | `/refinancovani-radar` | ⚠️ Portfolio bez CTA | ✅ / ✅ / ✅ |

**Journey A completeness:** **52 %** (5.2/10 kroků plně propojeno)

### A — Critical gaps
1. **Rentgen → Deal Room** chybí (P1)
2. **Majetio return → HJ** bez deep link (P1)
3. **Pořadí Calculator ↔ Passport ↔ Readiness** nekonzistentní s journey spec (P2 — sjednotit copy nebo flow)
4. **Mortgage step** rozptýlený — Global Financing + Vault + kontakt (P1 — „Mortgage Hub“ nebo Deal Room tab)
5. **Portfolio OS** není ownership registry — vždy demo twins (P1)

---

## Customer Journey B — Investor

**Spec:** Investment Passport → Market compare → Watchlist → Analysis → Purchase → Digital Twin → Portfolio OS → Next property

| Krok | Route | Journey link | Stav |
|------|-------|--------------|------|
| Investment Passport | `/investicni-pas` | ❌ dead-end → metodika/navrh | ⚠️ |
| Market compare | `/investicni-rentgen/porovnani` + in-page country compare | ❌ dva „compare“ bez propojení | ⚠️ |
| Watchlist | `/sledovani` | ⚠️ alert hrefs only | ✅ empty state |
| Analysis | `/investicni-rentgen` | ⚠️ z NBA/watchlist | ✅ |
| Purchase | `/transakce` | ❌ nedosažitelné z Rentgen/compare | ⚠️ |
| Digital Twin | *lib only* | ❌ COMING_SOON, no UI route | ❌ |
| Portfolio OS | `/portfolio` | ❌ demo seed, ne user twins | ⚠️ |
| Next property | *none* | ❌ text-only rec | ❌ |

**Journey B completeness:** **38 %**

### B — Critical gaps
1. **Investment Passport → compare/watchlist** (P1)
2. **Watchlist owned → Digital Twin bootstrap** (P1)
3. **Digital Twin UI route** nebo explicit „COMING_SOON“ gate místo demo (P1)
4. **Portfolio OS — odstranit auto DEMO seed v produkci** (P0 trust)
5. **Sjednotit Investment Passport vs Financial Passport** entry pro investory (P1)

---

## Customer Journey C — Existing homeowner / refinance

**Spec:** Mortgage import → Refinance Radar → Alert → Refinance

| Krok | Route | Journey link | Stav |
|------|-------|--------------|------|
| Mortgage import | `/navrh-na-miru`, `/financni-pas` | ⚠️ chybí `fixationEnd` | ⚠️ |
| Refinance Radar | `/refinancovani-radar` | ✅ import z FP (partial) | ✅ demo label |
| Alert | `/alerty` + inline + dashboard | ⚠️ triple surface | ⚠️ demo defaults |
| Refinance decision | in Radar | ✅ stay vs refinance | ✅ |

**Journey C completeness:** **62 %**

### C — Critical gaps
1. **`fixationEnd` v Financial Passport / wizard** (P0 pro refinance journey)
2. **Homepage „Chci refinancovat“ → `/refinancovani-radar`** ne kalkulačka (P1)
3. **NBA `fixationMonthsRemaining` z `yearsLeft`** — logická chyba (P0)
4. **Alert Center `includeDemo: true` default** — fake personalization (P0)
5. **Refinance Radar ↔ Alert Center** obousměrný link (P2)

---

## Cross-cutting audit

### DATA CONSISTENCY — 7.0/10

| ✅ Silné | ❌ Slabé |
|---------|---------|
| `src/lib/data/catalog.ts` + freshness + verify script | Catalog pokrývá ~20 domén; chybí passport, rentgen, alert-center, portfolio |
| ClaimKind (DATA/MODEL/ODHAD/NEOVERENO) napříč moduly | Paralelní country moduly: dossier, country-info, country-detail, mock-data |
| CZ rates: Supabase + statusy | LTV duplicitně v `cnb-limits` + `REGULATORY_RECORDS` |
| Foreign rates = null (no invention) | Marketing subtitles (Dubai tax) ≠ dossier nuance |

**P1:** Rozšířit DATA_CATALOG; sync check cnb-limits ↔ REGULATORY_RECORDS.  
**P1:** Country dossier jako canonical; legacy moduly → redirect/sync.  
**P2:** `npm run check:data` v CI gate.

---

### AI SAFETY — 8.0/10 (within deterministic copilot scope)

| ✅ | ❌ |
|----|-----|
| Rule-based orchestrator, ne LLM hallucination | Guardrails = regex post-processing |
| Profile gate pro affordability | Úzká sada forbidden phrases |
| Citations + audit sessionStorage | „AI Copilot“ marketing vs deterministický engine — očekávání uživatele |
| Tests: no approval language | |

**P2:** Rozšířit guardrail patterns; UI badge „Deterministický asistent (ne ChatGPT)“.  
**P2:** LLM path (pokud přijde) — structured output + retrieval-only.

---

### FINANCIAL MATH — 8.5/10

| ✅ Testováno | ❌ Netestováno E2E |
|-------------|-------------------|
| mortgage-decision, financing, investment-engine | Supabase rates → freshness → UI |
| financial-passport, readiness, property-compare | banking.ts offer assembly |
| refinance-radar calculate | |
| B2B score isolation (payment ≠ score) | |

**P1:** E2E test: live rate fetch → calculator display status.  
**P2:** Deprecate/remove unused `estimateBankRpsn`.

---

### PERMISSIONS — 7.5/10

| ✅ | ❌ |
|----|-----|
| Deal Room role model | No server auth — localStorage trust |
| Document Vault access + audit | B2B roles client-only |
| Report share: token, password, revoke | Bridge APIs mostly 503/COMING_SOON |
| Consent-gated partner transfer | |

**P1:** Server-side share grant persistence (report + B2B).  
**P2:** Org auth / SSO blueprint activation (majetio/sso.ts).

---

### GDPR — 8.0/10

| ✅ | ❌ |
|----|-----|
| Consent versioning 2026-07-19.1 | Client-side `consentedAt` only |
| Separate marketing / partner / privacy | No server consent log (except lead metadata) |
| Analytics consent-only | Email/push alerts COMING_SOON |
| API validates form consent | |

**P1:** Lawyer sign-off (external).  
**P2:** Consent receipt server log for partner handoff.

---

### USER TRUST — 7.8/10

| ✅ | ❌ |
|----|-----|
| ClaimBadge, Trust Center, StaleDataAlert | Alert Center demo alerts vypadají personalizovaně |
| Partner IČO = PENDING_VERIFICATION (honest) | Portfolio vždy demo — uživatel neví, co je jeho |
| Compensation disclosure | Dubai card oversimplified claims |
| No fake JSON-LD reviews | |

**P0:** `includeDemo: false` default v Alert Center build.  
**P0:** Portfolio OS — demo jen explicit „Ukázka“, ne auto-seed.  
**P1:** Label demo state všude kde DEMO_* data.

---

### PERFORMANCE — 7.6/10

| ✅ | ❌ |
|----|-----|
| SSR/SSG key pages | No LCP/INP budget in CI |
| OG edge images | 16+ client-heavy BETA islands |
| GA consent-gated | Large secondary nav / feature surface |
| Build passes | |

**P1:** Lighthouse CI on `/`, `/kalkulacky`, `/financni-pas` (mobile).  
**P2:** Code-split heavy tools (Rentgen, Compare, Portfolio charts).

---

### MOBILE UX — 7.3/10

| ✅ | ❌ |
|----|-----|
| Responsive Tailwind layouts | Secondary nav 20+ items — overwhelming |
| Cookie dialog a11y labels | Compare/Radar tables horizontal scroll |
| Print views on compare/reports | No dedicated mobile QA sign-off |

**P1:** Mobile journey test 375px — refinance + passport forms.  
**P2:** Bottom nav pro 4 core actions (Calc, Passport, Rentgen, Dashboard).

---

### ACCESSIBILITY — 7.0/10

| ✅ | ❌ |
|----|-----|
| Breadcrumbs aria-label | a11y-smoke = static file checks only |
| Cookie dialog role=dialog | No axe in CI |
| h1 on hero | Chart/radar accessibility unverified |

**P1:** axe-core on 5 critical routes in CI.  
**P2:** Radar charts — text alternative table.

---

### SEO — 8.7/10

| ✅ | ❌ |
|----|-----|
| Unique titles/descriptions (test enforced) | `/dashboard` noIndex but duplicate content with `/` |
| Sitemap index 4 buckets | Many BETA pages indexed |
| hreflang en hub | |
| Canonical hypotekajasne.cz | |

**P2:** noIndex BETA-only tools until journey complete.  
**P2:** Consolidate dashboard canonical (pick `/` OR `/dashboard`).

---

### EMPTY / ERROR / NO-DATA / STALE — 7.5/10

| Stav | Hodnocení |
|------|-----------|
| Empty states | ✅ většina obrazovek; ❌ Portfolio masked by demo |
| Error states | ✅ Lead API, forms |
| No-data | ✅ display.ts „Na vyžádání“ |
| Stale | ⚠️ ne všude `withEffectiveStatus` |

**P1:** Stale wrapper na všechny rate reads.  
**P1:** Watchlist → compare silent no-op — přidat toast.

---

### PARTNER DISCLOSURES — 8.0/10

| ✅ | ❌ |
|----|-----|
| /partneri, /jak-vydelavame | Partner bez verified IČO |
| B2B sponsored badges | Majetio external bez return disclosure flow |
| Global financing NOT_INTEGRATED honest | |
| Report white-label + HJ attribution | |

**P1:** Verified partner data before production leads.  
**P2:** Majetio handoff return URL contract.

---

## Majetio integrační kontrakty

| Kontrakt | Endpoint | Status | Journey fit |
|----------|----------|--------|-------------|
| Affordability widget | `/api/bridge/majetio/affordability` | COMING_SOON | B/A — property detail |
| Financing handoff | `/api/bridge/majetio/financing-handoff` | BETA | A — Majetio → HJ calc |
| Twin sync | `/api/bridge/majetio/twin-sync` | COMING_SOON | B — ownership |
| Watchlist sync | `/api/bridge/majetio/watchlist-sync` | COMING_SOON | B — watchlist |
| Report share (server) | `/api/bridge/reports/share` | COMING_SOON | B2B |
| B2B analysis order | `/api/bridge/b2b/analysis/order` | BETA client | B2B |

**Verdikt:** Kontrakty jsou **typově čisté** (claimKind, disclaimers, no PII v URLs). Chybí **aktivace na obou stranách** a **return journey** z Majetio zpět do Deal Room / Rentgen.

**P1:** Majetio staging: financing-handoff + attribution llid test.  
**P1:** Document `returnUrl` + `propertyId` v handoff contract.  
**P2:** Affordability widget LIVE on Majetio property detail.

---

## Duplicity k odstranění / sloučení

| Duplicita | Dopad | Akce |
|-----------|-------|------|
| **Home dashboard + `/dashboard`** | Dva entry pointy, stejný widget | P1: jeden canonical; druhý redirect |
| **Alert Center + Watchlist alerts + Radar alerts + Dashboard strings** | Confusion, triple maintenance | P1: Alert Center jako single inbox; ostatní = feed |
| **Investment Passport vs Financial Passport** | Investor lost | P1: unified „Passport“ s tabs nebo clear routing |
| **Country compare (investiční pas) vs Property compare** | Two compares | P2: rename + cross-links |
| **4× country content modules** | SoT drift | P1: dossier canonical |
| **Copilot jako empty-state default** | Dead-end off-journey | P1: next-step CTAs per persona |
| **Refinance Radar mini-dashboard vs Alert Center** | Redundant KPI | P2: Radar = detail; Alert = notification |
| **Report Engine vs B2B vs Rentgen premium** | Three report paths | P2: unified „Analysis delivery“ layer |
| **16 BETA features in flat nav** | Cognitive overload | P1: persona-based nav (Buyer / Investor / Owner / Pro) |

---

## Hlavní obrazovky — 3 otázky

Každá obrazovka musí odpovědět: **(1) Co vidím? (2) Co to znamená? (3) Co dál?**

| Obrazovka | Q1 | Q2 | Q3 | Skóre |
|-----------|----|----|-----|------:|
| `/` marketing | ✅ | ✅ | ⚠️ intent paths uneven | 8 |
| `/` dashboard | ✅ | ✅ | ✅ NBA | 8.5 |
| `/kalkulacky` | ✅ | ✅ | ⚠️ LeadGen dead-end | 7 |
| `/financni-pas` | ✅ | ✅ | ⚠️ Copilot tangent | 7.5 |
| `/navrh-na-miru` | ✅ | ✅ | ✅ | 9 |
| `/investicni-pas` | ✅ | ⚠️ | ❌ no forward | 6 |
| `/investicni-rentgen` | ✅ | ✅ | ❌ no Deal Room | 7 |
| `/investicni-rentgen/porovnani` | ✅ | ✅ | ⚠️ | 7.5 |
| `/sledovani` | ✅ | ✅ | ⚠️ Copilot empty | 7 |
| `/transakce` | ✅ | ✅ | ⚠️ financing skips steps | 7.5 |
| `/portfolio` | ⚠️ demo | ⚠️ | ❌ no refinance link | 5.5 |
| `/refinancovani-radar` | ✅ | ✅ | ✅ | 8.5 |
| `/alerty` | ✅ | ⚠️ demo | ✅ actions | 7 |
| `/copilot` | ✅ | ✅ | ⚠️ generic | 7.5 |
| `/profesionalni-portal` | ✅ | ✅ | ✅ | 8 |
| `/reporty` | ✅ | ✅ | ✅ | 8.5 |
| `/o-majetio` | ✅ | ✅ | ❌ no HJ return | 6.5 |

**Průměr main screens:** **7.4/10** — pod WOW 2.0 cílem 9.

---

## P1 akce (skóre < 9 — must fix)

| ID | Oblast | Akce | Ovlivní skóre |
|----|--------|------|---------------|
| P1-01 | Personalization / Trust | Alert Center: `includeDemo: false` default; demo jen s badge | Personalization +1.5, Trust +0.5 |
| P1-02 | Trust / Journey B | Portfolio OS: remove auto `DEMO_PORTFOLIO_TWINS` seed; empty state + „Přidat nemovitost“ | Trust +1, Product +0.8 |
| P1-03 | Journey C | Add `fixationEnd` to Financial Passport + wizard; import to Refinance Radar | Product +1, Data +0.5 |
| P1-04 | Journey C | Fix NBA `fixationMonthsRemaining` — use fixation date, not `yearsLeft` | Personalization +1 |
| P1-05 | Conversion | Rentgen + Compare CTAs → `/transakce` or Due Diligence when „vážný zájem“ | Conversion +1.2 |
| P1-06 | Conversion | Homepage refinance intent → `/refinancovani-radar` | Conversion +0.5 |
| P1-07 | Conversion | Investment Passport result → compare + watchlist + rentgen | Conversion +0.8 |
| P1-08 | Journey A | Majetio handoff `returnUrl` + CTA on `/o-majetio` → Rentgen | Conversion +0.5 |
| P1-09 | Product | Journey Orchestrator: extend NBA rules for Deal Room, Portfolio, Document Vault | Retention +1 |
| P1-10 | Data | Extend DATA_CATALOG + country dossier as SoT | Data quality +1 |
| P1-11 | Navigation | Persona nav (Buyer / Investor / Owner / Pro) místo flat 20+ tools | Mobile +0.7, Conversion +0.5 |
| P1-12 | Journey B | Watchlist → owned twin bootstrap on „koupil jsem“ | Product +1 |
| P1-13 | Permissions | Server-side report/B2B share persistence | Permissions +0.5 |
| P1-14 | Performance | Lighthouse mobile CI (3 routes) | Performance +0.8, Mobile +0.5 |
| P1-15 | Accessibility | axe-core CI smoke (5 routes) | Accessibility +1 |
| P1-16 | Partner | Verified IČO/JERRS before live partner transfer | Trust +0.5, Monetization +0.3 |

---

## P2 akce (polish po P1)

| ID | Akce |
|----|------|
| P2-01 | Sloučit `/dashboard` → `/` nebo redirect |
| P2-02 | Unified Mortgage Hub (Deal Room financing tab) |
| P2-03 | Digital Twin UI route nebo hard COMING_SOON gate |
| P2-04 | Portfolio recommendations → href refinance + next property |
| P2-05 | Softern Dubai/marketing destination copy |
| P2-06 | Copilot UI: „deterministický asistent“ label |
| P2-07 | noIndex immature BETA routes |
| P2-08 | Bottom mobile nav (4 core actions) |
| P2-09 | Majetio affordability widget LIVE |
| P2-10 | `check:data` in CI |
| P2-11 | Consolidate triple alert into Alert Center feed only |
| P2-12 | Investment vs Financial Passport naming/architecture doc |

---

## Co odstranit / nepoužívat v produkci

- [ ] Auto demo alerts presentované jako personalizované (Alert Center)
- [ ] Auto demo portfolio twins bez opt-in
- [ ] Generic „Zeptat se Copilota“ jako primární CTA mimo copilot page
- [ ] Homepage refinance → generic calculator
- [ ] Unsupported Dubai „0% daň a bezúročné splátky“ bez kontextu (mock-data subtitles)
- [ ] Dead-end `/dekujeme` bez next step
- [ ] Silent watchlist → compare import failure
- [ ] Duplicate dashboard entry bez rozdílu
- [ ] Placeholder partner registry bez PENDING badge v lead flow

---

## WOW 2.0 target architecture (doporučení)

```
┌─────────────────────────────────────────────────────────┐
│              Journey Orchestrator (NBA v2)               │
│  persona: buyer | investor | owner | pro                 │
│  next action always answers Q1/Q2/Q3                     │
└──────────────────────────┬──────────────────────────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌─────────┐         ┌─────────────┐       ┌──────────────┐
│ Passport │◄──────►│ Property OS  │◄────►│ Majetio API  │
│ (single) │         │ Watch/Twin/  │       │ handoff/ret  │
│          │         │ Portfolio    │       │              │
└─────────┘         └─────────────┘       └──────────────┘
     │                     │                     │
     └──────────┬──────────┴──────────┬──────────┘
                ▼                     ▼
         ┌────────────┐        ┌─────────────┐
         │ Data Catalog│        │ Alert Center│
         │ (SoT)       │        │ (single inbox)│
         └────────────┘        └─────────────┘
                │
         ┌──────┴──────┐
         ▼             ▼
   Report Engine   B2B Portal
   (delivery)      (monetization)
```

---

## Release gate — WOW 2.0 vs engineering RC

| Gate | Engineering RC (2026-07-20) | WOW 2.0 product |
|------|------------------------------|-----------------|
| CI green | ✅ | ✅ |
| Journey A complete | ❌ 52 % | Needs P1-05,08,09 |
| Journey B complete | ❌ 38 % | Needs P1-02,07,12 |
| Journey C complete | ❌ 62 % | Needs P1-03,04,06 |
| No fake personalization | ❌ | Needs P1-01,02 |
| Single alert inbox | ❌ | Needs P2-11 |
| Main screens ≥9 on 3Q test | ❌ avg 7.4 | After P1 set |
| Majetio contracts live | ⚠️ partial | Staging P1 |

**Doporučení:** Spustit **public beta** s jasným „BETA journey“ labelem po P1-01..06 (trust + top conversion fixes). **WOW 2.0 public launch** až po průměru skóre ≥8.5 a journey completeness ≥75 %.

---

## Appendix — moduly v ekosystému (16 HJ features)

`hj.report_engine`, `hj.b2b_portal`, `hj.alert_center`, `hj.academy_gamification`, `hj.market_pulse`, `hj.due_diligence`, `hj.offer_strategy`, `hj.deal_room`, `hj.document_vault`, `hj.global_financing_router`, `hj.refinance_radar`, `hj.portfolio_os`, `hj.property_compare`, + copilot, dashboard, watchlist, financial passport.

**Závěr:** Moduly jsou **production-grade jako stavebnice**; WOW 2.0 vyžaduje **montáž do jedné cesty** — orchestrátor, ne další features.

---

*Související: `docs/RELEASE_SCORECARD.md`, `docs/DATA_AUDIT.md`, `docs/PROPERTY_DIGITAL_TWIN.md`, `docs/MORTGAGE_PIPELINE.md`*
