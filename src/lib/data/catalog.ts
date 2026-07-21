import type { DataCatalogEntry } from "@/lib/data/types";

/**
 * Katalog všech známých datových domén v HypotékaJasně.cz.
 * Toto je mapa Source of Truth — hodnoty žijí v uvedených modulech / Supabase,
 * katalog drží metadata a zabraňuje tichému vzniku duplicit.
 */
export const DATA_CATALOG: DataCatalogEntry[] = [
  // ─── Rates (LIVE / PARTNER) ─────────────────────────────────────────
  {
    id: "rate.cz.bank.*.with_insurance",
    domain: "rates",
    label: "Klasická sazba s pojištěním (per banka)",
    usedIn: [
      "src/lib/bank-rates.ts",
      "src/components/calculators/MortgageCalculator.tsx",
      "src/lib/banking.ts",
    ],
    canonicalModule: "supabase:bank_rates + src/lib/scrape/bank-scrapers.ts",
    legacyOrigin: "Scraper bank / agregátorů → bank_rates",
    defaultStatus: "LIVE",
    unit: "percent_pa",
    country: "cz",
  },
  {
    id: "rate.cz.bank.*.without_insurance",
    domain: "rates",
    label: "Klasická sazba bez pojištění (per banka)",
    usedIn: [
      "src/lib/bank-rates.ts",
      "src/lib/scrape/bank-scrapers.ts",
      "src/components/calculators/InsuranceRateCards.tsx",
    ],
    canonicalModule: "supabase:bank_rates (+ ORIENTATIONAL_WITHOUT_SURCHARGE)",
    legacyOrigin:
      "LIVE u UniCredit PCE / KB insider; jinak MODEL +0.3 p.b.",
    defaultStatus: "MODEL",
    unit: "percent_pa",
    country: "cz",
  },
  {
    id: "rate.cz.kb.insider",
    domain: "rates",
    label: "KB insider 4.74 % / 4.94 %",
    usedIn: ["src/lib/scrape/bank-scrapers.ts"],
    canonicalModule: "src/lib/scrape/rate-policy.ts#KB_INSIDER_RATES",
    legacyOrigin: "Manuální tržní údaj od provozovatele",
    defaultStatus: "PARTNER_QUOTE",
    unit: "percent_pa",
    country: "cz",
  },
  {
    id: "rate.cz.market.aggregate",
    domain: "rates",
    label: "Agregovaná sazba current_rates (kalkulačka)",
    usedIn: [
      "src/lib/rates.ts",
      "src/components/calculators/MortgageCalculator.tsx",
      "src/components/calculators/AdvancedCalculator.tsx",
      "src/components/mortgage-readiness/MortgageReadinessWizard.tsx",
    ],
    canonicalModule: "supabase:current_rates (+ fallback bank_rates)",
    legacyOrigin: "Upsert z /api/scrape-rates (prefer UniCredit → KB → first)",
    defaultStatus: "LIVE",
    unit: "percent_pa",
    country: "cz",
  },
  {
    id: "rate.cz.american.*",
    domain: "rates",
    label: "Americká hypotéka (per banka)",
    usedIn: ["src/lib/bank-rates.ts", "src/lib/banking.ts"],
    canonicalModule: "supabase:bank_rates.american_*",
    legacyOrigin: "Scraper bank / Peníze.cz",
    defaultStatus: "LIVE",
    unit: "percent_pa",
    country: "cz",
  },
  {
    id: "rate.foreign.default.*",
    domain: "rates",
    label: "Výchozí sazba zahraničního trhu (countryConfigs)",
    usedIn: [
      "src/lib/calculators.ts",
      "src/components/calculators/MortgageCalculator.tsx",
    ],
    canonicalModule: "src/lib/data/static-market.ts → countryConfigs",
    legacyOrigin: "Odstraněno — foreign defaultRate je null bez ověřeného zdroje",
    defaultStatus: "MODEL",
    unit: "percent_pa",
    country: "multi",
  },

  // ─── RPSN ───────────────────────────────────────────────────────────
  {
    id: "rpsn.cz.bank.*",
    domain: "rpsn",
    label: "RPSN klasická / americká",
    usedIn: [
      "src/components/calculators/RpsnDisplay.tsx",
      "src/lib/bank-rates.ts",
    ],
    canonicalModule: "supabase:bank_rates",
    legacyOrigin: "Scraper; BANK_RPSN_OFFSET 0.25 je dead code",
    defaultStatus: "LIVE",
    unit: "percent_pa",
    country: "cz",
  },

  // ─── LTV / DTI ──────────────────────────────────────────────────────
  {
    id: "ltv.cnb.owner_occupied",
    domain: "ltv",
    label: "ČNB LTV vlastní bydlení 80 % / 90 %",
    usedIn: [
      "src/lib/cnb-limits.ts",
      "src/components/calculators/MortgageCalculator.tsx",
    ],
    canonicalModule: "src/lib/data/static-regulatory.ts",
    legacyOrigin: "src/lib/cnb-limits.ts",
    defaultStatus: "VERIFIED",
    unit: "ltv_percent",
    country: "cz",
  },
  {
    id: "ltv.cnb.investment",
    domain: "ltv",
    label: "ČNB LTV investiční max 70 %",
    usedIn: ["src/lib/cnb-limits.ts"],
    canonicalModule: "src/lib/data/static-regulatory.ts",
    legacyOrigin: "src/lib/cnb-limits.ts",
    defaultStatus: "VERIFIED",
    unit: "ltv_percent",
    country: "cz",
  },
  {
    id: "dti.cnb.investment",
    domain: "dti_dsti",
    label: "ČNB DTI investiční 7",
    usedIn: ["src/lib/cnb-limits.ts"],
    canonicalModule: "src/lib/data/static-regulatory.ts",
    legacyOrigin: "src/lib/cnb-limits.ts",
    defaultStatus: "VERIFIED",
    unit: "ratio",
    country: "cz",
  },
  {
    id: "dsti.ui.warning_thresholds",
    domain: "dti_dsti",
    label: "UI DTI warning 40 % / danger 45 %",
    usedIn: ["src/lib/banking.ts#checkDTI"],
    canonicalModule: "src/lib/data/static-regulatory.ts",
    legacyOrigin: "Hardcoded bank practice thresholds",
    defaultStatus: "MODEL",
    unit: "ratio",
    country: "cz",
  },

  // ─── Yields / prices / defaults ─────────────────────────────────────
  {
    id: "yield.default.*",
    domain: "yields",
    label: "Výchozí hrubý výnos (countryConfigs)",
    usedIn: ["src/lib/calculators.ts", "AdvancedCalculator"],
    canonicalModule: "src/lib/data/static-market.ts",
    legacyOrigin: "defaultRentalYield",
    defaultStatus: "MODEL",
    unit: "ratio",
    country: "multi",
  },
  {
    id: "price.default.*",
    domain: "prices",
    label: "Výchozí cena nemovitosti kalkulačky",
    usedIn: ["src/lib/calculators.ts"],
    canonicalModule: "src/lib/data/static-market.ts",
    legacyOrigin: "defaultPrice / defaultSavings",
    defaultStatus: "MODEL",
    unit: "other",
    country: "multi",
  },
  {
    id: "yield.city.market_metrics",
    domain: "yields",
    label: "Výnosy měst (€/m²) — investment modeler",
    usedIn: ["src/lib/market-metrics.ts"],
    canonicalModule: "src/lib/market-metrics.ts",
    legacyOrigin: "Hardcoded city table",
    defaultStatus: "MODEL",
    unit: "percent",
    country: "multi",
  },

  // ─── Historical ─────────────────────────────────────────────────────
  {
    id: "historical.cz.series",
    domain: "historical",
    label: "Historické indexy ČR 1996–2026",
    usedIn: [
      "src/lib/historical-data.ts",
      "src/components/sections/HistoricalTrendsView.tsx",
    ],
    canonicalModule: "src/lib/historical-data.ts",
    legacyOrigin: "Hardcoded snapshots",
    defaultStatus: "MODEL",
    unit: "index",
    country: "cz",
  },
  {
    id: "historical.foreign.scaled",
    domain: "historical",
    label: "Zahraniční historie škálovaná z ČR",
    usedIn: ["src/lib/historical-data.ts"],
    canonicalModule: "src/lib/historical-data.ts",
    legacyOrigin: "Synthetic scale + rateOffsets",
    defaultStatus: "MODEL",
    unit: "index",
    country: "multi",
  },

  // ─── Tax / legal / investment content ───────────────────────────────
  {
    id: "tax.country_info.*",
    domain: "tax",
    label: "Daňové tabulky zemí",
    usedIn: ["src/lib/country-info-data.ts"],
    canonicalModule: "src/lib/country-info-data.ts",
    legacyOrigin: "Editorial hardcoded",
    defaultStatus: "VERIFIED",
    unit: "percent",
    country: "multi",
  },
  {
    id: "legal.disclaimers",
    domain: "legal",
    label: "Právní disclaimer kalkulaček",
    usedIn: [
      "src/components/calculators/CalculatorDisclaimer.tsx",
      "src/components/sections/LegalView.tsx",
    ],
    canonicalModule: "src/components/calculators/CalculatorDisclaimer.tsx",
    legacyOrigin: "Editorial",
    defaultStatus: "VERIFIED",
    unit: "text",
    country: "cz",
  },
  {
    id: "investment.scenarios.*",
    domain: "investment",
    label: "Scénáře růstu / buy-vs-rent / passport",
    usedIn: [
      "src/lib/prediction-configs.ts",
      "src/lib/buy-vs-rent-data.ts",
      "src/lib/investment-modeler.ts",
      "src/lib/investment-passport.ts",
      "src/lib/market-matching/score.ts",
      "src/lib/market-matching/market-profiles.ts",
    ],
    canonicalModule: "příslušné src/lib/* (zatím legacy)",
    legacyOrigin: "Hardcoded model parameters",
    defaultStatus: "MODEL",
    unit: "percent",
    country: "multi",
  },

  // ─── Banks ──────────────────────────────────────────────────────────
  {
    id: "banks.cz.domestic_list",
    domain: "banks",
    label: "Seznam 6 českých bank v nabídkách",
    usedIn: ["src/lib/banking.ts", "src/lib/scrape/bank-ids.ts"],
    canonicalModule: "src/lib/banking.ts + bank-ids.ts",
    legacyOrigin: "Hardcoded product list; rates LIVE",
    defaultStatus: "VERIFIED",
    unit: "text",
    country: "cz",
  },
  {
    id: "banks.foreign.local_lists",
    domain: "banks",
    label: "Lokální / expat banky (bez live sazeb)",
    usedIn: ["src/lib/banking.ts"],
    canonicalModule: "src/lib/banking.ts",
    legacyOrigin: "Names only — sazby chybí → Na vyžádání",
    defaultStatus: "STALE",
    unit: "text",
    country: "multi",
  },
];

export function getCatalogEntry(id: string): DataCatalogEntry | undefined {
  return DATA_CATALOG.find((e) => e.id === id);
}

export function getCatalogByDomain(
  domain: DataCatalogEntry["domain"]
): DataCatalogEntry[] {
  return DATA_CATALOG.filter((e) => e.domain === domain);
}
