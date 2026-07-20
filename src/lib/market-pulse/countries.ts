import type { CountryId } from "@/lib/calculators";
import { countryConfigs, countryOrder } from "@/lib/calculators";
import type { MarketId } from "@/lib/market-matching/types";
import { MARKET_PROFILES } from "@/lib/market-matching/market-profiles";
import type { MarketProfile } from "@/lib/market-matching/types";

export const SUPPORTED_PULSE_MARKETS: CountryId[] = [...countryOrder];

const COUNTRY_TO_MARKET: Record<CountryId, MarketId> = {
  cz: "cz",
  slovakia: "sk",
  dubai: "ae",
  spain: "es",
  italy: "it",
  croatia: "hr",
  bali: "id",
  saudi: "sa",
};

export function countryIdToMarketId(countryId: CountryId): MarketId {
  return COUNTRY_TO_MARKET[countryId];
}

export function getMarketProfile(countryId: CountryId): MarketProfile | null {
  const marketId = countryIdToMarketId(countryId);
  return MARKET_PROFILES.find((p) => p.id === marketId) ?? null;
}

export function getMarketDisplayName(countryId: CountryId): string {
  return countryConfigs[countryId].label;
}
