import { destinationCards } from "@/lib/mock-data";
import type { CountryId, CurrencyCode } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";

export type ScenarioKey = "conservative" | "moderate" | "optimistic";

export interface ScenarioParams {
  name: string;
  propGrowth: number;
  rentGrowth: number;
  inflation: number;
}

export interface CountryPredictionConfig {
  currency: CurrencyCode;
  yield: number;
  scenarios: Record<ScenarioKey, ScenarioParams>;
}

export const PROJECTION_YEARS = 20;

export const predictionConfigs: Record<string, CountryPredictionConfig> = {
  "Česká republika": {
    currency: "CZK",
    yield: 0.036,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.02,
        rentGrowth: 0.02,
        inflation: 0.035,
      },
      moderate: {
        name: "Střední (Očekávaný)",
        propGrowth: 0.045,
        rentGrowth: 0.035,
        inflation: 0.025,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.07,
        rentGrowth: 0.05,
        inflation: 0.02,
      },
    },
  },
  "SAE (Dubaj)": {
    currency: "AED",
    yield: 0.065,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.01,
        rentGrowth: 0.01,
        inflation: 0.03,
      },
      moderate: {
        name: "Střední",
        propGrowth: 0.04,
        rentGrowth: 0.03,
        inflation: 0.02,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.08,
        rentGrowth: 0.06,
        inflation: 0.02,
      },
    },
  },
  "Španělsko": {
    currency: "EUR",
    yield: 0.05,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.015,
        rentGrowth: 0.02,
        inflation: 0.025,
      },
      moderate: {
        name: "Střední (Očekávaný)",
        propGrowth: 0.035,
        rentGrowth: 0.03,
        inflation: 0.02,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.06,
        rentGrowth: 0.045,
        inflation: 0.015,
      },
    },
  },
  "Itálie": {
    currency: "EUR",
    yield: 0.0525,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.01,
        rentGrowth: 0.015,
        inflation: 0.025,
      },
      moderate: {
        name: "Střední (Očekávaný)",
        propGrowth: 0.03,
        rentGrowth: 0.025,
        inflation: 0.02,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.055,
        rentGrowth: 0.04,
        inflation: 0.015,
      },
    },
  },
  "Chorvatsko": {
    currency: "EUR",
    yield: 0.0575,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.02,
        rentGrowth: 0.025,
        inflation: 0.025,
      },
      moderate: {
        name: "Střední (Očekávaný)",
        propGrowth: 0.04,
        rentGrowth: 0.035,
        inflation: 0.02,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.065,
        rentGrowth: 0.05,
        inflation: 0.015,
      },
    },
  },
  "Bali (Indonésie)": {
    currency: "USD",
    yield: 0.125,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.03,
        rentGrowth: 0.03,
        inflation: 0.04,
      },
      moderate: {
        name: "Střední (Očekávaný)",
        propGrowth: 0.06,
        rentGrowth: 0.05,
        inflation: 0.03,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.1,
        rentGrowth: 0.07,
        inflation: 0.025,
      },
    },
  },
  "Saúdská Arábie": {
    currency: "SAR",
    yield: 0.075,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.02,
        rentGrowth: 0.02,
        inflation: 0.03,
      },
      moderate: {
        name: "Střední (Očekávaný)",
        propGrowth: 0.05,
        rentGrowth: 0.035,
        inflation: 0.025,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.09,
        rentGrowth: 0.055,
        inflation: 0.02,
      },
    },
  },
  "Slovensko": {
    currency: "EUR",
    yield: 0.0475,
    scenarios: {
      conservative: {
        name: "Konzervativní",
        propGrowth: 0.02,
        rentGrowth: 0.02,
        inflation: 0.03,
      },
      moderate: {
        name: "Střední (Očekávaný)",
        propGrowth: 0.04,
        rentGrowth: 0.03,
        inflation: 0.022,
      },
      optimistic: {
        name: "Optimistický",
        propGrowth: 0.065,
        rentGrowth: 0.045,
        inflation: 0.018,
      },
    },
  },
};

const countryNameById = Object.fromEntries(
  destinationCards.map((card) => [card.id, card.name])
) as Record<CountryId, string>;

export function getPredictionConfig(
  countryId: CountryId
): CountryPredictionConfig {
  const name = countryNameById[countryId];
  const config = name ? predictionConfigs[name] : undefined;
  if (!config) {
    throw new Error(
      `Missing prediction config for countryId=${countryId} (name=${name ?? "unknown"}). Cross-country fallback is forbidden.`
    );
  }
  return config;
}

export function getDefaultProjectionPrice(countryId: CountryId): number {
  return countryConfigs[countryId].defaultPrice;
}

export interface ProjectionDataPoint {
  rok: string;
  hodnotaNemovitosti: number;
  rocniNajem: number;
  kumulativniNajem: number;
  realnaKupniSilaHodnoty: number;
}

export interface ProjectionSummary {
  finalYear: ProjectionDataPoint;
  totalNominalWealth: number;
  totalRealWealth: number;
  inflationLoss: number;
  inflationCompound: number;
}

export function calculateProjection(
  price: number,
  config: CountryPredictionConfig,
  scenario: ScenarioParams,
  years: number = PROJECTION_YEARS
): { data: ProjectionDataPoint[]; summary: ProjectionSummary } {
  const data: ProjectionDataPoint[] = [];
  let currentPropValue = price;
  let currentYearlyRent = price * config.yield;
  let cumulativeRent = 0;
  let inflationCompound = 1;

  for (let year = 1; year <= years; year++) {
    currentPropValue *= 1 + scenario.propGrowth;
    currentYearlyRent *= 1 + scenario.rentGrowth;
    cumulativeRent += currentYearlyRent;
    inflationCompound *= 1 + scenario.inflation;

    data.push({
      rok: `Rok ${year}`,
      hodnotaNemovitosti: Math.round(currentPropValue),
      rocniNajem: Math.round(currentYearlyRent),
      kumulativniNajem: Math.round(cumulativeRent),
      realnaKupniSilaHodnoty: Math.round(currentPropValue / inflationCompound),
    });
  }

  const finalYear = data[data.length - 1];
  const totalNominalWealth =
    finalYear.hodnotaNemovitosti + finalYear.kumulativniNajem;
  const totalRealWealth = totalNominalWealth / inflationCompound;
  const inflationLoss = totalNominalWealth - totalRealWealth;

  return {
    data,
    summary: {
      finalYear,
      totalNominalWealth,
      totalRealWealth,
      inflationLoss,
      inflationCompound,
    },
  };
}

export const scenarioKeys: ScenarioKey[] = [
  "conservative",
  "moderate",
  "optimistic",
];
