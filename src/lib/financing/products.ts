/**
 * Katalog financování podle země — jen produkty s reálným základem v datech/editorial.
 * Nevymýšlíme lokální sazby ani univerzální 80 % LTV.
 */

import type { CountryId } from "@/lib/calculators";
import type {
  DeveloperPlanPhase,
  FinancingProductDefinition,
} from "@/lib/financing/types";

/** Typický off-plan schedule (model fází, ne bankovní hypotéka). */
export const DUBAI_DEVELOPER_SCHEDULE: DeveloperPlanPhase[] = [
  {
    id: "booking",
    label: "Rezervace",
    percentOfPrice: 10,
    durationMonths: 1,
  },
  {
    id: "during_construction",
    label: "Během výstavby",
    percentOfPrice: 50,
    durationMonths: 36,
  },
  {
    id: "handover",
    label: "Předání nemovitosti",
    percentOfPrice: 20,
    durationMonths: 1,
  },
  {
    id: "post_handover",
    label: "Po předání",
    percentOfPrice: 20,
    durationMonths: 24,
  },
];

/** Fázované platby u developera na Bali — bez bankovní hypotéky pro cizince. */
export const BALI_DEVELOPER_SCHEDULE: DeveloperPlanPhase[] = [
  {
    id: "booking",
    label: "Rezervace",
    percentOfPrice: 20,
    durationMonths: 1,
  },
  {
    id: "during_construction",
    label: "Během výstavby",
    percentOfPrice: 50,
    durationMonths: 12,
  },
  {
    id: "handover",
    label: "Předání nemovitosti",
    percentOfPrice: 30,
    durationMonths: 1,
  },
  {
    id: "post_handover",
    label: "Po předání",
    percentOfPrice: 0,
    durationMonths: 1,
  },
];

const czechEquity = (
  currency: FinancingProductDefinition["currency"] = "CZK"
): FinancingProductDefinition => ({
  option: "CZECH_EQUITY_LOAN",
  label: "České zajištěné financování (americká hypotéka)",
  description:
    "Úvěr v CZK od české banky se zástavou na nemovitost v ČR. Sazba jen ze živých dat bank.",
  currency,
  maxLtvPercent: null,
  ratePercentPa: null,
  rateAvailability: "LIVE",
  calculable: true,
  source: "Veřejné sazby sledovaných bank (americká hypotéka)",
});

const cash = (
  currency: FinancingProductDefinition["currency"]
): FinancingProductDefinition => ({
  option: "CASH",
  label: "Hotovost",
  description: "Nákup bez úvěru — 100 % vlastních zdrojů.",
  currency,
  maxLtvPercent: 0,
  ratePercentPa: null,
  rateAvailability: "UNAVAILABLE",
  calculable: true,
  source: null,
});

/**
 * Produkty dostupné v modelu pro každou zemi.
 * LOCAL_MORTGAGE jen tam, kde máme alespoň dokumentovaný LTV rámec —
 * bez ověřené sazby (ratePercentPa = null, calculable = false).
 */
export const COUNTRY_FINANCING_PRODUCTS: Record<
  CountryId,
  FinancingProductDefinition[]
> = {
  cz: [
    {
      option: "LOCAL_MORTGAGE",
      label: "Česká bankovní hypotéka",
      description: "Klasická hypotéka u CZ bank — sazby z veřejných bankovních zdrojů.",
      currency: "CZK",
      maxLtvPercent: 80,
      ratePercentPa: null,
      rateAvailability: "LIVE",
      calculable: true,
      source: "Veřejné sazby sledovaných bank",
    },
    czechEquity("CZK"),
    cash("CZK"),
  ],
  dubai: [
    {
      option: "DEVELOPER_PAYMENT_PLAN",
      label: "Platební plán developera (ve výstavbě)",
      description:
        "Splátkový plán developera (rezervace → výstavba → předání → po předání). Nejde o bankovní hypotéku — LTV se nepoužívá.",
      currency: "AED",
      maxLtvPercent: null,
      ratePercentPa: null,
      rateAvailability: "UNAVAILABLE",
      calculable: true,
      source: "Model fází off-plan (ne sazba banky)",
      developerSchedule: DUBAI_DEVELOPER_SCHEDULE,
    },
    {
      option: "LOCAL_MORTGAGE",
      label: "Hypotéka pro nerezidenty (SAE)",
      description:
        "Lokální bankovní hypotéka pro nerezidenta — oddělená od platebního plánu developera. Orientační LTV strop 50 %; sazbu individuálně ověřujeme.",
      currency: "AED",
      maxLtvPercent: 50,
      ratePercentPa: null,
      rateAvailability: "UNAVAILABLE",
      calculable: false,
      source: "Tržní rámec nerezident (bez live sazby v datech)",
    },
    czechEquity("CZK"),
    cash("AED"),
  ],
  spain: [
    {
      option: "LOCAL_MORTGAGE",
      label: "Lokální hypotéka (nerezident)",
      description:
        "Španělské banky pro nerezidenty — typicky LTV do 70 %, ne 80 %. Sazbu individuálně ověřujeme.",
      currency: "EUR",
      maxLtvPercent: 70,
      ratePercentPa: null,
      rateAvailability: "UNAVAILABLE",
      calculable: false,
      source: "Tržní rámec nerezident ES (bez live sazby)",
    },
    czechEquity("CZK"),
    cash("EUR"),
  ],
  italy: [
    czechEquity("CZK"),
    cash("EUR"),
  ],
  croatia: [
    czechEquity("CZK"),
    cash("EUR"),
  ],
  bali: [
    {
      option: "DEVELOPER_PAYMENT_PLAN",
      label: "Fázované platby u developera",
      description:
        "Na Bali není standardní bankovní hypotéka pro cizince. Modeluje se harmonogram plateb developera, ne anuita. LTV se nepoužívá.",
      currency: "USD",
      maxLtvPercent: null,
      ratePercentPa: null,
      rateAvailability: "UNAVAILABLE",
      calculable: true,
      source: "Model fází developera (Bali)",
      developerSchedule: BALI_DEVELOPER_SCHEDULE,
    },
    czechEquity("CZK"),
    cash("USD"),
  ],
  saudi: [
    czechEquity("CZK"),
    cash("SAR"),
  ],
  slovakia: [
    czechEquity("CZK"),
    cash("EUR"),
  ],
};

export function getFinancingProducts(
  country: CountryId
): FinancingProductDefinition[] {
  return COUNTRY_FINANCING_PRODUCTS[country] ?? [];
}

export function getFinancingProduct(
  country: CountryId,
  option: FinancingProductDefinition["option"]
): FinancingProductDefinition | null {
  return (
    getFinancingProducts(country).find((p) => p.option === option) ?? null
  );
}

export function hasLocalMortgageProduct(country: CountryId): boolean {
  return getFinancingProducts(country).some(
    (p) => p.option === "LOCAL_MORTGAGE"
  );
}

export function defaultFinancingOption(
  country: CountryId
): FinancingProductDefinition["option"] {
  const products = getFinancingProducts(country);
  const preferred =
    products.find((p) => p.option === "DEVELOPER_PAYMENT_PLAN") ??
    products.find((p) => p.option === "CZECH_EQUITY_LOAN") ??
    products.find((p) => p.option === "CASH") ??
    products[0];
  return preferred?.option ?? "UNAVAILABLE";
}

/** Výchozí vlastní zdroje — respektuje max LTV produktu, ne generických 80 %. */
export function defaultOwnFundsForCountry(
  country: CountryId,
  propertyPrice: number
): number {
  const products = getFinancingProducts(country);
  const local = products.find((p) => p.option === "LOCAL_MORTGAGE");
  if (local?.maxLtvPercent != null && local.maxLtvPercent > 0) {
    const minEquityPct = 100 - local.maxLtvPercent;
    return Math.round((propertyPrice * minEquityPct) / 100);
  }
  if (products.some((p) => p.option === "DEVELOPER_PAYMENT_PLAN")) {
    // U developer plánu typicky vyšší vstup (booking + část výstavby)
    return Math.round(propertyPrice * 0.3);
  }
  // Bez lokální hypotéky v datech — defaultně spíš cash-heavy
  return Math.round(propertyPrice * 0.4);
}
