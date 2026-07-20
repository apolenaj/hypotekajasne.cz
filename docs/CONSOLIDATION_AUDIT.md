# HypotékaJasně.cz — Consolidation Audit

**Datum:** 2026-07-20  
**Rozsah:** veřejné routes (`src/app`), UI komponenty, user-facing copy v `src/lib`  
**Cíl:** jeden jednotný finální produkt — bez nových velkých funkcí  
**Fáze:** audit + bezpečné odstranění dead code (bez rozsáhlého redesignu)

---

## Executive verdict

Projekt má **dvě generace UI** vedle sebe: nový Premium / Cockpit / Trust Center vs. starší emerald-glass marketing huby a orphan sekce. Engineering je silný (data statusy, feature badges, testy), ale veřejný web ještě **nepůsobí jako jedna finální generace**.

| Otázka | Odpověď |
|--------|---------|
| Je to jedna generace produktu? | **Ne** — nejsilnější konflikt na `/pruvodce-investora/[stat]` |
| Lze launchovat bez další konsolidace? | **Ne jako trust-first CZ brand** — EN cookie CTA, `productId`, demo auto-seed, legal TODO |
| Co udělat teď? | Audit + smazat orphan legacy; P0 copy/demo až v další fázi |

---

## Klasifikace termínů

| Výraz | Typ | Doporučení |
|-------|-----|------------|
| LIVE / VERIFIED / MODELLED / STALE / PARTNER QUOTE | interní + trust taxonomie | **Nechat anglicky v Trust Center / metodice** s českým vysvětlením; mimo trust UI preferovat české popisky („živé“, „ověřené“, „model“) |
| Data provenance / Source of Truth | interní | **Nezobrazovat** uživateli; UI: „Zdroj dat“, „Metodika“ |
| SSR / server-rendered / productId | interní / developer | **Odstranit z UI** (P0) |
| TODO / Legal review required | developer / legal gate | **Odstranit z produkčního UI** nebo nahradit lidskou větou (P0) |
| Decision cockpit | marketing EN | **Přeložit** („Rozhodovací přehled“ / „Cockpit bydlení a investic“) |
| Cash Flow / Gross Yield / Net Yield / Cash-on-Cash / Break-even occupancy | odborné | **Česky + EN v závorce** při prvním výskytu |
| Executive summary | odborné | **Přeložit** („Shrnutí pro rozhodování“) |
| Developer payment plan | odborné industry | **Může zůstat EN** s vysvětlením „platební plán developera (ne bankovní úvěr)“ |
| Property score / investiční skóre | produkt | Preferovat česky („investiční skóre“) |
| Insider | marketing / partner | **Přeložit nebo vysvětlit** („partnerský / neveřejný údaj“) |
| Lead-generation wizard | developer | **Nezobrazovat**; v kódu OK |
| Accept all / Settings | UX EN | **Přeložit** (P0 cookie) |

---

## Mapa veřejných routes

| Path | Primární view | Stav generace |
|------|---------------|---------------|
| `/` | `HomeExperience` + `CockpitHero` | Nová (OK) |
| `/en` | EN hub | Záměrně EN |
| `/dashboard` | `HomeDashboard` | Nová / tool |
| `/navrh-na-miru` | `MortgageReadinessWizard` | Nová |
| `/financni-pas` | `FinancialPassportView` | Nová |
| `/investicni-pas` | `InvestmentPassportView` | Nová |
| `/copilot` | `CopilotView` | Nová |
| `/portfolio` | `PortfolioOsView` | Nová + demo leak |
| `/sledovani` | `SmartWatchlistView` | Nová |
| `/alerty` | `AlertCenterView` | Nová |
| `/trhovy-puls` | `MarketPulseView` | Nová |
| `/refinancovani-radar` | `RefinanceRadarView` | Nová + demo default |
| `/globalni-financovani` | `GlobalFinancingRouterView` | Nová |
| `/dokumentovy-trezor` | `DocumentVaultView` | Nová |
| `/transakce`, `/transakce/[id]` | Deal Room | Nová |
| `/strategie-nabidky` | `OfferStrategyView` | Nová |
| `/proverka-nemovitosti` | `DueDiligenceView` | Nová |
| `/reporty`, `/reporty/sdilet/[token]` | Report Engine | Nová |
| `/profesionalni-portal` | `B2bPortalView` | Nová (B2B) |
| `/investicni-rentgen*` | Rentgen + modelář + porovnání | Nová + EN jargon |
| `/kalkulacky*` | Decision Lab / kalkulačky | Smíšené |
| `/pruvodce-investora/[stat]` | `CountryDossierView` + Decision Lab | **Jedna generace (konsolidováno 2026-07-20)** |
| `/akademie*`, `/clanky*` | SSR content | Nová + EN labels |
| Trust (`/duvera`, `/metodika`, `/zdroje`, …) | Trust Center | Konzistentní |
| `/pravni/*` | `LegalView` | Legal + TODO leak |
| `/dekujeme` | thank-you | Positioning risk |

Shell: `Navbar` + `Footer` + cookie banner (`Providers`).

---

## Nalezené problémy (P0–P3)

### P0 — musí pryč před důvěryhodným launchem

| ID | Problém | Kde | Akce |
|----|---------|-----|------|
| P0-1 | Trojitá země: starý hub + Premium Dossier + legacy guide | `InvestorGuidePage.tsx` | V další fázi ponechat **jeden** surface (Dossier + kalkulačky); hub/guide sloučit nebo schovat |
| P0-2 | Portfolio OS auto-seed demo twinů při každé návštěvě | `PortfolioOsView.tsx` | Empty state + explicitní „Načíst demo“ |
| P0-3 | Refinance Radar default `useDemo=true` bez profilu | `RefinanceRadarView.tsx` | Stejně — bez auto-demo |
| P0-4 | `productId` viditelné uživateli | `RentgenLandingSections.tsx`, `RentgenToolIsland.tsx`, `LegalView.tsx` | Skrýt; interní ID jen v kódu/API |
| P0-5 | „Legal review required“ + TODO IČO v legal UI | `LegalView.tsx` | Nahradit produkční copy / gate |
| P0-6 | Cookie CTA anglicky (`Accept all` / `Reject optional` / `Settings`) | `CookieConsentBanner.tsx` | České labely |
| P0-7 | Thank-you: „Náš specialista se vám ozve…“ | `dekujeme/page.tsx` | Partner/handoff jazyk (ne „náš poradce“) |
| P0-8 | Operator TODO string v UI | `operator.ts` / legal | Nezobrazovat „TODO config“ |

### P1 — jednotná generace / brand

| ID | Problém | Kde | Akce |
|----|---------|-----|------|
| P1-1 | „Decision cockpit“ v hero | `CockpitHero.tsx` | Přeložit |
| P1-2 | „SSR first“, „Pricing & funnel“, Free/Preview | `RentgenLandingSections.tsx` | České product copy |
| P1-3 | EN yield labely bez překladu | `InvestmentEnginePanel.tsx`, `SmartCalculator.tsx` | Česky (+ EN) |
| P1-4 | „Executive summary“, „Country dossier“ | dossier UI | Přeložit |
| P1-5 | Akademie: Sources / Related tools / CTA / Learning hub | academy pages | Přeložit |
| P1-6 | `/zdroje` ukazuje `supabase:…` a `src/lib/…` | catalog → `/zdroje` | Lidské názvy zdrojů |
| P1-7 | RPSN popover default source = DB tabulky | `RpsnDisplay.tsx` | Lidský label |
| P1-8 | Status badge EN všude mimo Trust | `display.ts` → UI | Kontextové české popisky |
| P1-9 | Offer Strategy / Compare EN labely | offer + compare views | Přeložit |
| P1-10 | B2B „Share link“, „Submit property…“ | `B2bPortalView.tsx` | Přeložit (i B2B CZ) |
| P1-11 | Report Engine EN chrome | report views | Přeložit |
| P1-12 | Demo defaulty v DD / Offer / Compare / Global financing | příslušné views | Explicitní demo CTA |

### P2 — cleanup / konzistence

| ID | Problém | Kde | Akce |
|----|---------|-----|------|
| P2-1 | Orphan legacy home/country komponenty | viz „Dead code“ níže | **Smazáno v této fázi** |
| P2-2 | Duplicitní entry points koupě vs nájem | `/kalkulacky/…` + country page | Sjednotit framing |
| P2-3 | Více lead formulářů | LeadGen / LeadCapture / readiness | Sdílený pattern |
| P2-4 | Feature badges BETA/COMING SOON EN | `FeatureStatusBadge` | CZ labely |
| P2-5 | Breadcrumb EN názvy nástrojů | Alert Center, Document Vault… | CZ názvy navigace |
| P2-6 | Developer payment plan bez vysvětlení | financing / dossier | Doplnit českou glosu |
| P2-7 | Vizuální nesoulad tool suite vs home cockpit | portfolio, deal room… | Design tokens pass |
| P2-8 | `/hypotecni-akademie` redirect + dead MortgageAcademyView | academy | Redirect OK; view smazán |

### P3 — polish

| ID | Problém | Akce |
|----|---------|------|
| P3-1 | `/en` hub | Ponechat |
| P3-2 | Report type enum v UI (`property_analysis`) | Human label |
| P3-3 | Demo ID stringy v Rentgen | Skrýt / přátelský název |
| P3-4 | „Lead-generation wizard“ jako string | Nenalezeno ve UI — OK |
| P3-5 | ArticlesView deprecated | Smazán |

---

## Duplicitní komponenty (stejný účel)

| Pár | Verdikt |
|-----|---------|
| `CockpitHero` (live) vs `Hero` (orphan) | Smazat Hero |
| `HomeExperience` vs `HomeHub` | Smazat HomeHub |
| `CountryDossierView` vs `CountryInvestmentHub` vs `CountryGuide` vs `CountryDetailView` | DetailView orphan → smazat; Hub+Guide+Dossier = P0 konsolidace |
| Cookie banner | Jedna instance — OK |
| Footer | Jedna instance — OK |
| Magazine SSR vs `ArticlesView` | Smazat ArticlesView |
| `/akademie` vs `MortgageAcademyView` | Smazat MortgageAcademyView |
| Kalkulačky overlapping | Decision Lab / SmartCalculator / InvestmentEngine — P2 sjednocení copy |

---

## Dead code odstraněný v této fázi

Bezpečně smazáno (žádný import z routes / live views):

1. `src/components/sections/Hero.tsx`
2. `src/components/sections/HomeHub.tsx`
3. `src/components/sections/MortgageSections.tsx`
4. `src/components/sections/InvestmentGoals.tsx`
5. `src/components/sections/CountryDetailView.tsx`
6. `src/components/sections/OnboardingWizard.tsx`
7. `src/components/sections/FindMyPathView.tsx`
8. `src/components/sections/ArticlesView.tsx`
9. `src/components/sections/MortgageAcademyView.tsx`

Úpravy referencí:

- `src/lib/data/catalog.ts` — odstraněn `usedIn` odkaz na OnboardingWizard
- `src/lib/affordability.ts` — komentář bez odkazu na smazaný wizard

**Neodstraněno (živý obsah / vyžaduje produktové rozhodnutí):**

- `CountryInvestmentHub` + `CountryGuide` na country page (P0-1)
- Demo seedy (P0-2, P0-3) — změna chování, ne dead code
- EN cookie labely (P0-6) — vyžaduje update a11y-smoke testu; další fáze

---

## Staré marketingové claimy vs positioning

| Claim | Konflikt | Sev |
|-------|----------|-----|
| „Náš specialista se vám ozve do 24 hodin.“ (`/dekujeme`) | Platforma ≠ vlastní poradci | P0 |
| „kontaktujte naše poradce“ / „konzultaci od našich expertů“ | Bylo v orphan Hero / CountryDetailView | P2 (odstraněno se soubory) |
| Footer / FAQ / Trust — nejsme banka ani poradce | **Zdroj pravdy — držet** | — |

---

## Doporučené pořadí další fáze (ne teď)

1. Country page → jeden Premium Dossier surface  
2. Zastavit demo auto-seed (Portfolio, Refinance)  
3. Legal / productId / cookie CZ  
4. Czechize tool labels (yield, rentgen, academy)  
5. `/zdroje` human-readable sources  
6. Design tokens pass napříč tool suite  

---

## Checklist této fáze

- [x] Audit veřejných routes  
- [x] `docs/CONSOLIDATION_AUDIT.md`  
- [x] Smazání orphan legacy komponent  
- [x] typecheck — OK  
- [x] tests — OK (aktualizován očekávaný počet analytics eventů 15→17)  
- [x] production build — OK (`/proverka-nemovitosti` včetně)  
- [ ] lint — **21 pre-existing errors** (`react-hooks/set-state-in-effect`, `prefer-const`); žádné nové z této změny  

### Poznámka k lintu

Chyby `set-state-in-effect` jsou rozšířený pattern napříč tool views (Alert Center, B2B, Academy…). Oprava patří do samostatné P1/P2 vlny (useSyncExternalStore / lazy init), ne do dead-code cleanup.
