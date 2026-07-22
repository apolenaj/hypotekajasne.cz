/**
 * Investiční pas — formulář + wrapper nad transparentním market-matching enginem.
 */

import {
  matchMarkets,
  matchMarketsWhatIf,
  applyWhatIfToForm,
  whatIfFromForm,
  type FinancingChoice,
  type HorizonChoice,
  type PassportFormData,
  type PurposeChoice,
  type RegionChoice,
  type WhatIfParams,
} from "@/lib/market-matching/score";
import type {
  MarketMatchResult,
  MatchingResult,
} from "@/lib/market-matching/types";

export type {
  FinancingChoice,
  HorizonChoice,
  PassportFormData,
  PurposeChoice,
  RegionChoice,
  WhatIfParams,
};

export type { MarketMatchResult, MatchingResult };

export {
  matchMarketsWhatIf,
  applyWhatIfToForm,
  whatIfFromForm,
};

export const initialPassportForm: PassportFormData = {
  capital: "",
  financing: "",
  purpose: "",
  horizon: "",
  region: "",
  name: "",
  email: "",
  phone: "",
};

export const FINANCING_OPTIONS: {
  value: FinancingChoice;
  title: string;
  description: string;
}[] = [
  {
    value: "max_leverage",
    title: "Chci využít hypotéku / splátkový kalendář na maximum",
    description: "Preferuje trhy s dostupnějším financováním.",
  },
  {
    value: "partial",
    title: "Mám dost hotovosti, možná využiji jen menší úvěr",
    description: "Kombinace vlastního kapitálu a menší páky.",
  },
  {
    value: "cash",
    title: "Platím 100 % v hotovosti",
    description: "Financování váží méně — důraz na kapitál a riziko.",
  },
];

export const PURPOSE_OPTIONS: {
  value: PurposeChoice;
  title: string;
  description: string;
}[] = [
  {
    value: "yield_max",
    title: "Čistě investice: Maximalizace cash-flow a výnosu",
    description: "Zvyšuje ideál target yield a intended use.",
  },
  {
    value: "partial_use",
    title: "Mix: Občas užívat, zbytek roku pronajímat",
    description: "Silně váží intended use (lifestyle + yield).",
  },
  {
    value: "conservative",
    title: "Ochrana před inflací",
    description: "Preferuje bezpečnost vlastnictví, regulaci a nízké FX riziko.",
  },
  {
    value: "flipping",
    title: "Rychlý zisk: Flipping",
    description: "Preferuje likviditu a kratší horizont.",
  },
];

export const REGION_OPTIONS: {
  value: RegionChoice;
  title: string;
  description: string;
}[] = [
  {
    value: "exotic_high_yield",
    title: "Exotika a jiná měna je OK",
    description: "Nižší ideál currency/regulation, vyšší yield.",
  },
  {
    value: "eu_stability",
    title: "Evropský právní rámec a blízkost",
    description: "Preferuje regulaci a ownership security v EU.",
  },
  {
    value: "czech_slovak",
    title: "Preferuji domácí trh",
    description: "Maximální ideál CZK / domácí právo a financování.",
  },
];

export const HORIZON_OPTIONS: {
  value: HorizonChoice;
  title: string;
}[] = [
  { value: "3_months", title: "Do 3 měsíců" },
  { value: "6_months", title: "Do 6 měsíců" },
  { value: "1_year", title: "Do roka" },
  { value: "just_looking", title: "Jen se rozhlížím" },
];

/** @deprecated Use MarketMatchResult — kept for gradual migration */
export type ScoredMarket = MarketMatchResult;

export type PassportResult = MatchingResult & {
  /** Alias Top 3 */
  markets: MarketMatchResult[];
  financingLabel: string;
  horizonLabel: string;
};

export function calculateTopMarkets(data: PassportFormData): MarketMatchResult[] {
  return matchMarkets(data).topMarkets;
}

export function evaluateInvestmentPassport(
  data: PassportFormData
): PassportResult {
  const matched = matchMarkets(data);
  const financingLabel =
    FINANCING_OPTIONS.find((o) => o.value === data.financing)?.title ?? "—";
  const horizonLabel =
    HORIZON_OPTIONS.find((o) => o.value === data.horizon)?.title ?? "—";

  return {
    ...matched,
    markets: matched.topMarkets,
    financingLabel,
    horizonLabel,
  };
}
