# Data Audit — HypotékaJasně.cz

Jednotný Source of Truth (SoT) pro dynamická data. Cíl: žádná tiše konfliktná duplicita hodnot; chybějící údaj = `null` + UI „Na vyžádání“ / „Data ověřujeme“.

## Architektura

| Vrstva | Cesta | Role |
|--------|--------|------|
| Schema | `src/lib/data/types.ts` | `DataRecord` (value, unit, country, source, sourceUrl, sourceType, validFrom, lastFetchedAt, lastVerifiedAt, status, confidence, notes) |
| Katalog | `src/lib/data/catalog.ts` | Mapa domén → kanonický modul + `usedIn` |
| Factory | `src/lib/data/records.ts` | `makeDataRecord` / `missingDataRecord` |
| Display | `src/lib/data/display.ts` | `missingDataLabel`, `formatDataValue` |
| Live rates | `src/lib/data/live-rates.ts` | Supabase řádky → `DataRecord` |
| Regulatory | `src/lib/data/static-regulatory.ts` | ČNB LTV/DTI + UX DSTI prahy |
| Market defaults | `src/lib/data/static-market.ts` | Obal `countryConfigs` jako MODELLED |
| Rate policy | `src/lib/scrape/rate-policy.ts` | KB insider + orientační +0.3 (bez cheerio) |
| Public API | `src/lib/data/index.ts` | Re-exporty |

**Status hodnoty:** `LIVE` \| `VERIFIED` \| `MODELLED` \| `PARTNER_QUOTE` \| `STALE`

**Pravidlo:** Nikdy nedoplňovat fiktivní RPSN/sazbu do UI. `estimateBankRpsn` je deprecated a není v produkční cestě nabídek.

---

## 1. Úrokové sazby (CZ)

| Údaj | Původ | Status | Kde se ukládá | Kde se používá | Manuální ověření |
|------|--------|--------|---------------|----------------|------------------|
| Klasická s pojištěním (6 bank) | Scraper oficiálních webů / agregátorů | LIVE | Supabase `bank_rates` | `bank-rates.ts`, `MortgageCalculator`, `banking.ts` nabídek | Cron `/api/scrape-rates`; spot-check banky |
| Klasická bez pojištění | UniCredit PCE reálná; KB insider; ostatní `+0.3` | LIVE / PARTNER_QUOTE / MODELLED | `bank_rates.rate_without_*` | `InsuranceRateCards`, srovnání | KB insider v `rate-policy.ts`; UniCredit CPI=No |
| KB insider 4.74 / 4.94 | Provozovatel | PARTNER_QUOTE | Hardcoded `KB_INSIDER_RATES` | Scraper KB override | Aktualizovat při změně nabídky KB |
| Agregát kalkulačky | Prefer UniCredit → KB → first z scrape | LIVE | `current_rates` (+ fallback min `bank_rates`) | `rates.ts`, kalkulačky, onboarding | Po scrape zkontrolovat `current_rates` |
| Americká s pojištěním | Scraper / Peníze.cz | LIVE (nullable) | `bank_rates.american_*` | Americká nabídka | Null → „Na vyžádání“ |
| Americká bez pojištění | Typicky `+0.3` | MODELLED | `bank_rates` | UI `*orientačně` | — |
| Zahraniční default sazby | `countryConfigs.defaultRate` | MODELLED | `calculators.ts` | Foreign kalkulačky | Nejsou live bankovní sazby |

**Kanonické konstanty politiky:** `src/lib/scrape/rate-policy.ts` (ne v UI komponentách).

---

## 2. RPSN

| Údaj | Původ | Status | Použití | Poznámka |
|------|--------|--------|---------|----------|
| RPSN s/bez pojištění | Scraper | LIVE (nullable) | `RpsnDisplay`, nabídky | Null → „Na vyžádání“ — **nesmí** se inventovat |
| `BANK_RPSN_OFFSET` +0.25 | Legacy | — | **Nepoužívat** | Deprecated v `banking.ts` |

---

## 3. LTV / DTI / DSTI

| Údaj | Původ | Status | SoT | Použití |
|------|--------|--------|-----|---------|
| LTV vlastní 80 % / mladí 90 % | ČNB doporučení od 4/2026 | VERIFIED | `cnb-limits.ts` → `REGULATORY_RECORDS` | Kalkulačka účelu, notifikace |
| LTV investiční 70 %, DTI 7 | ČNB | VERIFIED | stejné | Investiční účel |
| DSTI warning 40 % / danger 45 % | Interní UX (bankovní praxe) | MODELLED | `REGULATORY_RECORDS.dsti*` → `checkDTI` | Warning v UI — **není** limit ČNB |

---

## 4. Výnosy a ceny nemovitostí

| Údaj | Modul | Status | Použití |
|------|--------|--------|---------|
| Default ceny / výnosy zemí | `calculators.ts` `countryConfigs` | MODELLED | Defaulty kalkulaček, buy-vs-rent |
| Ceny €/m² a výnosy měst | `market-metrics.ts` | MODELLED | Investment modeler |
| Predikční scénáře | `prediction-configs.ts` | MODELLED | Predikce |
| Buy vs rent parametry | `buy-vs-rent-data.ts` | MODELLED | Sekce buy-vs-rent |

Obal metadat: `static-market.ts` (`getDefaultRateRecord` / `Price` / `Yield`).

---

## 5. Historická data

| Údaj | Modul | Status | Poznámka |
|------|--------|--------|----------|
| ČR 1996–2026 snapshoty | `historical-data.ts` | MODELLED | Editorial / ilustrativní indexy |
| Zahraniční historie | škálování z ČR + `rateOffsets` | MODELLED | Syntetické — ne oficiální statistika |

UI: `HistoricalTrendsView.tsx`.

---

## 6. Daňové údaje a právní tvrzení

| Údaj | Modul | Status | Poznámka |
|------|--------|--------|----------|
| Daňové tabulky zemí | `country-info-data.ts` | VERIFIED (editorial) | Manuálně revidovat při změně legislativy |
| Detail země / obsah | `country-detail-data.ts` | VERIFIED / editorial | Může odkazovat na MODELLED defaulty |
| Disclaimer kalkulaček | `CalculatorDisclaimer.tsx` | VERIFIED | Text musí zůstat konzistentní s Legal |
| Legal stránka | `LegalView.tsx` | VERIFIED | — |

---

## 7. Investiční scénáře a bankovní produkty

| Údaj | Modul | Status |
|------|--------|--------|
| Investment modeler | `investment-modeler.ts` + `market-metrics` | MODELLED |
| Investment passport | `investment-passport.ts` | MODELLED |
| Domácí banky (6) | `banking.ts` + `bank-ids.ts` | VERIFIED seznam; sazby LIVE |
| Zahraniční seznamy bank | `LOCAL_BANKS_BY_COUNTRY` | STALE sazby (jména jen) → „Na vyžádání“ |

---

## 8. Live vs model vs manuální ověření

```
LIVE ────────── CZ sazby/RPSN ze scrapu → Supabase
PARTNER_QUOTE ─ KB insider (rate-policy)
MODELLED ────── +0.3 bez pojištění, countryConfigs, historie, výnosy měst, DSTI UI prahy
VERIFIED ────── ČNB limity, editorial tax/legal (po kontrole člověkem)
STALE ───────── Null/chybějící live → UI „Data ověřujeme“
```

### Co ověřovat manuálně (checklist)

1. Po každém cron scrape: 6 řádků `bank_rates`, RPSN null jen pokud zdroj opravdu nemá.
2. KB insider vs aktuální nabídka KB (aktualizace `rate-policy.ts`).
3. UniCredit PCE `CPI=B` / `CPI=No` stále vrací reálné páry.
4. ČNB LTV/DTI texty v `cnb-limits.ts` po změně makroobezřetnostních doporučení.
5. Daňové a právní texty při změně legislativy.
6. Zahraniční defaulty — označovat jako orientační, ne jako bankovní nabídku.

---

## 9. API a datové toky

```
Cron / Vercel → GET/POST /api/scrape-rates (Bearer CRON_SECRET)
  → bank-scrapers (+ rate-policy KB / +0.3)
  → upsert bank_rates (per-row)
  → upsert current_rates (agregát)

Frontend:
  rates.ts ← current_rates (fallback bank_rates)
  bank-rates.ts ← bank_rates
  live-rates.ts ← mapování na DataRecord (volitelné pro nové UI)
  format-rate.ts ← missingDataLabel („Na vyžádání“)
```

SQL: `supabase/bank_rates.sql`, `supabase/bank_rates_nullable_rpsn_migration.sql`.

---

## 10. Migrace a anti-duplicita

- **Nová čísla** (sazby, limity, výnosy) nepřidávat do komponent — jen do kanonického modulu + záznam v `DATA_CATALOG`.
- Číselné konstanty v legacy modulech (`cnb-limits`, `countryConfigs`) zůstávají kvůli kompatibilitě; metadata statusu žijí v `src/lib/data/*`.
- Conflict check: jedna doména = jeden `canonicalModule` v katalogu.
- Verify skript: `npm run check:data` (kontrola uniqueness ID katalogu + exportů).

---

## 11. UI copy při chybějících datech

| Situace | Text |
|---------|------|
| Chybí ověřená hodnota | **Na vyžádání** |
| Data stará / fetch selhal (STALE) | **Data ověřujeme** |
| Splátka bez sazby (legacy) | Individuálně (platba) |
| MODELLED bez pojištění | číslo + `*orientačně` |

---

*Poslední audit: 2026-07-18. Katalog: `DATA_CATALOG` v `src/lib/data/catalog.ts`.*
