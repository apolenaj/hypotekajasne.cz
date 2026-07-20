# Audit kalkulaček — HypotékaJasně.cz

Datum: 2026-07-20  
Cíl: čeština, jednotný design, responsive bez page overflow, správné měny, srozumitelné výsledky, unit testy enginů.

## Centralizovaný money formatter

| Soubor | Role |
|--------|------|
| `src/lib/money.ts` | **Zdroj pravdy:** `formatMoney`, `formatRate`, `formatMoneyCompact`, `CALCULATOR_FIELD_LABELS_CS` |
| `src/lib/calculators.ts` → `formatCurrency` | Wrapper na `formatMoney` (CZK → Kč, AED/EUR/USD/SAR kód) |
| `src/lib/investment-modeler.ts` → `formatCzk` | Wrapper na `formatMoney(..., "CZK")` (dříve suffix `" CZK"`) |
| `src/lib/i18n/format.ts` | Oddělený Intl helper pro obecné i18n — **P2:** sjednotit s `money.ts` |

**Pravidlo:** změna symbolu/kódu měny ≠ konverze kurzu. Formátovač nikdy nepřepočítává částku.

Testy: `src/lib/money.test.ts` (`npm run test:money`).

---

## Inventář nástrojů

### 1. Hypotéka / financování (CZ + zahraničí)

| Položka | Detail |
|---------|--------|
| Route | `/kalkulacky` |
| UI | `KalkulackyView` → `CalculatorSection` → `MortgageCalculator` / `CzMortgageDecisionTool` / `ForeignFinancingTool` / `AdvancedCalculator` / `InvestmentEnginePanel` |
| Engine | `src/lib/financing/*`, `src/lib/calculators.ts`, `src/lib/mortgage-decision*` |
| Čeština | **PASS** (ForeignFinancing: „Financování · …“, harmonogram bez EN „schedule“) |
| Responsive | **PASS** — max 2–3 sloupce formulářů |
| Měny | **PASS** přes `formatCurrency` → `formatMoney` |
| Výsledky | **PASS** u CZ tool (splátka, LTV, celkem, úroky nahoře); Foreign: splátka + LTV nahoře |
| Testy | `financing.test.ts`, `mortgage-decision.test.ts` |

### 2. Dostupnost (affordability)

| Položka | Detail |
|---------|--------|
| UI | `AffordabilityWidget` (homepage), logika i v mortgage readiness / Majetio bridge |
| Engine | `src/lib/affordability.ts` (`estimateAffordability`) |
| Čeština | **PASS** (widget CS) |
| Responsive | **PASS** |
| Měny | CZK / Kč |
| Výsledky | Max. úvěr / cena / splátka |
| Testy | **`src/lib/affordability.test.ts`** (nové) |

### 3. LTV

| Položka | Detail |
|---------|--------|
| UI | Součást `CzMortgageDecisionTool`, portfolio OS, financing výsledků |
| Čeština | **PASS** |
| Testy | Pokryto mortgage-decision / financing / portfolio-os |

### 4. Koupě vs nájem

| Položka | Detail |
|---------|--------|
| Route | `/kalkulacky/koupe-vs-najem` (+ Decision Lab panel) |
| UI | `DecisionLabBuyVsRent`, `BuyVsRentSection` |
| Engine | `src/lib/decision-lab/*`, `src/lib/buy-vs-rent-deep-analysis.ts` |
| Čeština | **PASS** — labely Kupní cena, Vlastní prostředky, …; Exportovat CSV |
| Responsive | **PASS** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (dříve `lg:grid-cols-5`) |
| Grafy | ResponsiveContainer, české legendy |
| Testy | `decision-lab.test.ts` |

### 5. Historický vývoj / potenciální vývoj

| Položka | Detail |
|---------|--------|
| Routes | `/kalkulacky/historicky-vyvoj`, `/kalkulacky/potencialni-vyvoj` |
| UI | Decision Lab chart frames |
| Čeština | **PASS** (Exportovat CSV) |
| Responsive | Chart frame + minWidth 0 |
| Testy | `decision-lab.test.ts` |

### 6. Investiční engine

| Položka | Detail |
|---------|--------|
| UI | `InvestmentEnginePanel` (v kalkulačkách / country hub) |
| Engine | `src/lib/investment-engine/*` |
| Čeština | **PASS** — Kupní cena, Vlastní prostředky, Neobsazenost, Údržba… |
| Responsive | **PASS** — 1→2→3 sloupce; custom scénář max 2 sloupce |
| Výsledky | **PASS** — primární KPI nahoře; **Pokročilé výsledky** v `<details>` |
| Testy | `investment-engine.test.ts` |

### 7. Investiční modelář (historie / projekce)

| Položka | Detail |
|---------|--------|
| Route | `/investicni-rentgen/modelar` |
| UI | `InvestmentModelerView` |
| Engine | `src/lib/investment-modeler.ts` |
| Čeština | **PASS** |
| Měny | `formatCzk` → Kč |
| Responsive | Summary grid max 3 sloupce (dříve 5) |
| Testy | Částečně přes rentgen / modelář flows — **P1:** dedikované unit testy modeláře |

### 8. Zahraniční / globální financování

| Položka | Detail |
|---------|--------|
| Routes | Country calculators + `/globalni-financovani` |
| UI | `ForeignFinancingTool`, `GlobalFinancingRouterView`, `FinancingMap` |
| Engine | `src/lib/financing/*`, `src/lib/global-financing/*` |
| Čeština | **PASS** — „Trasa A“, „Mapa financování“ (dříve Route / Financing Map) |
| Developer payment plan | Harmonogram fází v ForeignFinancingTool (CS) |
| Testy | `financing.test.ts`, `global-financing.test.ts` |

### 9. Refinancování

| Položka | Detail |
|---------|--------|
| Route | `/refinancovani-radar` |
| UI | `RefinanceRadarView` |
| Engine | `src/lib/refinance-radar/*` |
| Čeština | **PASS** (produkt v CS) |
| Testy | `refinance-radar.test.ts` |

### 10. Portfolio / scénáře

| Položka | Detail |
|---------|--------|
| Route | `/portfolio` |
| UI | `PortfolioOsView` |
| Engine | `src/lib/portfolio-os/*` |
| Čeština | **PASS** — souhrnné metriky a sekce CS (dříve EN „Total property value“ atd.) |
| Responsive | Tabulky: `overflow-x-auto` **uvnitř** komponenty (`min-w-[640px]`), ne page scroll |
| Testy | `portfolio-os.test.ts` |

### 11. Další nástroje s výpočty

| Nástroj | Route / UI | Testy | Stav CS |
|---------|------------|-------|---------|
| Smart / Advanced calculator | `SmartCalculator`, `AdvancedCalculator` | financing | PASS |
| Academy mini | `AcademyMiniCalculator` | academy | PASS |
| Property compare / rentgen | `/investicni-rentgen/*` | rentgen, property-compare | PASS |
| Financial passport | `/financni-pas` | financial-passport | PASS |
| Offer strategy | `/strategie-nabidky` | offer-strategy | PASS |
| Majetio affordability API | `/api/bridge/majetio/affordability` | majetio | PASS |

---

## Checklist akceptace (cíl uživatele)

| Požadavek | Stav |
|-----------|------|
| Kompletně v češtině (labels, placeholdery, validace) | **Většina PASS** — zbývají izolované EN stringy mimo core kalkulačky (viz P2) |
| Jednotný design | **PARTIAL** — stejná paleta (deep-teal / gold), různé „generace“ layoutů |
| Perfektně responsive | **Vylepšeno** — odstraněny 5sloupcové gridy v Buy vs Rent / modelář / custom scénář |
| Správné měny a jednotky | **PASS** přes `money.ts`; žádná fake konverze |
| Srozumitelný výsledek (KPI nahoře) | **PASS** Investment Engine + CZ mortgage; ostatní OK |
| Žádný horizontal overflow stránky | **Vylepšeno** — scroll jen uvnitř tabulek/grafů |
| Advanced pod „Pokročilé výsledky“ | **PASS** Investment Engine |
| Unit testy enginů | **PASS** hlavní enginy + nové money/affordability |

---

## Backlog

### P0 (hotovo v tomto auditu)
- [x] Portfolio OS EN labely → CS  
- [x] `formatCzk` CZK → Kč  
- [x] Foreign / Global Financing EN → CS  
- [x] Investment Engine: KPI nahoře + Pokročilé výsledky  
- [x] Buy vs Rent `lg:grid-cols-5` → max 3  
- [x] AmortizationChart osa `Nk` → `formatMoneyCompact`  
- [x] Central `src/lib/money.ts` + testy  
- [x] Affordability unit testy  

### P1
- [ ] Dedikované unit testy `investment-modeler.ts`  
- [ ] CzMortgageDecisionTool: collapsible „Pokročilé výsledky“ pro metriky 6–9  
- [ ] Sjednotit vizuální „shell“ všech kalkulaček (společný `CalculatorShell`)  
- [ ] Validace: explicitní české hlášky u všech HTML5 `required` / custom validators  

### P2
- [ ] Sjednotit `src/lib/i18n/format.ts` s `money.ts`  
- [ ] Country hub / dossier: zbývající „CZK“ v copy → „Kč“ kde jde o zobrazení částky  
- [ ] Portfolio stress tabulka → card layout na `<sm` místo jen inner scroll  

---

## Jak ověřit

```bash
npm run test:money
npm run test:financing
npm run test:investment
npm run test:decision-lab
npm run test:portfolio-os
npm run typecheck
```
