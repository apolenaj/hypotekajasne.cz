import type { CurrentRates } from "@/lib/rates";
import type { CountryId } from "@/lib/calculators";
import { SUPPORTED_PULSE_MARKETS } from "@/lib/market-pulse/countries";
import {
  buildMarketMetrics,
  pickTopInsights,
} from "@/lib/market-pulse/metrics";
import {
  RADAR_DISCLAIMER,
  scanOpportunityRadar,
} from "@/lib/market-pulse/opportunity-radar";
import { getRegulatoryChangelog } from "@/lib/market-pulse/regulatory-changelog";
import type {
  MarketPulseDashboard,
  MarketPulseMarket,
  OpportunityRadarCriteria,
} from "@/lib/market-pulse/types";
import { defaultOpportunityCriteria } from "@/lib/market-pulse/types";
import { countryConfigs } from "@/lib/calculators";
import type { DataStatus } from "@/lib/data/types";
import { DESTINATION_METRICS } from "@/lib/destination-metrics";

function marketDataStatus(countryId: CountryId): DataStatus {
  const dest = DESTINATION_METRICS.find((d) => d.countryId === countryId);
  return dest?.dataStatus ?? "MODELLED";
}

export function buildMarketPulseMarket(
  countryId: CountryId,
  rates: CurrentRates | null
): MarketPulseMarket {
  const metrics = buildMarketMetrics(countryId, rates);
  return {
    countryId,
    name: countryConfigs[countryId].label,
    dataStatus: marketDataStatus(countryId),
    metrics,
    topInsights: pickTopInsights(metrics, 4),
  };
}

export function buildMarketPulseDashboard(input: {
  selectedMarket?: CountryId;
  rates?: CurrentRates | null;
  opportunityCriteria?: OpportunityRadarCriteria;
  now?: Date;
}): MarketPulseDashboard {
  const rates = input.rates ?? null;
  const selected = input.selectedMarket ?? "cz";
  const criteria = input.opportunityCriteria ?? defaultOpportunityCriteria();

  const markets = SUPPORTED_PULSE_MARKETS.map((id) =>
    buildMarketPulseMarket(id, rates)
  );

  return {
    generatedAt: (input.now ?? new Date()).toISOString(),
    selectedMarket: selected,
    markets,
    regulatoryChangelog: getRegulatoryChangelog(),
    opportunityRadar: {
      criteria,
      alerts: scanOpportunityRadar(criteria),
      disclaimer: RADAR_DISCLAIMER,
    },
    methodology: [
      "Každý insight vychází z konkrétního datového zdroje — DATA / MODEL / NEOVERENO.",
      "Neuvádíme „nejlepší čas koupit“ ani investiční doporučení.",
      "CZ hypoteční sazby LIVE; ceny/nájmy/yield z ročních modelových snapshotů.",
      "Supply, DOM a měsíční trendy zobrazíme až s ověřeným feedem.",
      "Opportunity Radar = filtr nad modelovými daty, ne garance příležitosti.",
      "Regulační changelog = kurátorský editorial + VERIFIED ČNB záznamy.",
    ],
  };
}

export function getSelectedMarket(
  dashboard: MarketPulseDashboard
): MarketPulseMarket {
  return (
    dashboard.markets.find((m) => m.countryId === dashboard.selectedMarket) ??
    dashboard.markets[0]
  );
}
