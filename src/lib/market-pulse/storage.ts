import type { CountryId } from "@/lib/calculators";
import {
  MARKET_PULSE_STORAGE_KEY,
  defaultOpportunityCriteria,
  type OpportunityRadarCriteria,
} from "@/lib/market-pulse/types";

export type MarketPulseStore = {
  version: 1;
  selectedMarket: CountryId;
  opportunityCriteria: OpportunityRadarCriteria;
  preferredTimeframe: "1M" | "3M" | "1Y" | "3Y";
};

export function defaultMarketPulseStore(): MarketPulseStore {
  return {
    version: 1,
    selectedMarket: "cz",
    opportunityCriteria: defaultOpportunityCriteria(),
    preferredTimeframe: "1Y",
  };
}

export function loadMarketPulseStore(): MarketPulseStore {
  if (typeof window === "undefined") return defaultMarketPulseStore();
  try {
    const raw = localStorage.getItem(MARKET_PULSE_STORAGE_KEY);
    if (!raw) return defaultMarketPulseStore();
    const parsed = JSON.parse(raw) as Partial<MarketPulseStore>;
    return {
      ...defaultMarketPulseStore(),
      ...parsed,
      opportunityCriteria: {
        ...defaultOpportunityCriteria(),
        ...parsed.opportunityCriteria,
      },
    };
  } catch {
    return defaultMarketPulseStore();
  }
}

export function saveMarketPulseStore(store: MarketPulseStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MARKET_PULSE_STORAGE_KEY, JSON.stringify(store));
}
