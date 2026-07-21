import { countryConfigs, type CountryId } from "@/lib/calculators";

export interface HistoricalDataPoint {
  year: number;
  apt70m: number;
  villa: number;
  rent: number;
  rate: number;
  cpi: number;
}

export const HISTORICAL_END_YEAR = 2026;

export const historicalDataCZ: HistoricalDataPoint[] = [
  { year: 1996, apt70m: 900_000, villa: 1_800_000, rent: 4_500, rate: 12.5, cpi: 100 },
  { year: 2001, apt70m: 1_400_000, villa: 2_600_000, rent: 6_500, rate: 7.2, cpi: 132 },
  { year: 2006, apt70m: 2_500_000, villa: 4_200_000, rent: 9_500, rate: 4.1, cpi: 148 },
  { year: 2011, apt70m: 3_100_000, villa: 5_500_000, rent: 11_000, rate: 3.8, cpi: 172 },
  { year: 2016, apt70m: 4_200_000, villa: 7_500_000, rent: 14_000, rate: 1.8, cpi: 185 },
  { year: 2021, apt70m: 7_800_000, villa: 14_000_000, rent: 19_000, rate: 2.1, cpi: 215 },
  { year: 2026, apt70m: 9_500_000, villa: 18_500_000, rent: 26_000, rate: 4.5, cpi: 285 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolateHistoricalData(
  points: HistoricalDataPoint[]
): HistoricalDataPoint[] {
  const sorted = [...points].sort((a, b) => a.year - b.year);
  const result: HistoricalDataPoint[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];

    for (let year = start.year; year < end.year; year++) {
      const t = (year - start.year) / (end.year - start.year);
      result.push({
        year,
        apt70m: Math.round(lerp(start.apt70m, end.apt70m, t)),
        villa: Math.round(lerp(start.villa, end.villa, t)),
        rent: Math.round(lerp(start.rent, end.rent, t)),
        rate: Math.round(lerp(start.rate, end.rate, t) * 10) / 10,
        cpi: Math.round(lerp(start.cpi, end.cpi, t)),
      });
    }
  }

  result.push(sorted[sorted.length - 1]);
  return result;
}

function scaleHistoricalSnapshots(
  snapshots: HistoricalDataPoint[],
  priceScale: number,
  rentScale: number,
  rateOffset = 0
): HistoricalDataPoint[] {
  return snapshots.map((point) => ({
    year: point.year,
    apt70m: Math.round(point.apt70m * priceScale),
    villa: Math.round(point.villa * priceScale),
    rent: Math.round(point.rent * rentScale),
    rate: Math.round((point.rate + rateOffset) * 10) / 10,
    cpi: point.cpi,
  }));
}

const cz2026Apt = historicalDataCZ.find((d) => d.year === 2026)!.apt70m;

function buildCountrySnapshots(countryId: CountryId): HistoricalDataPoint[] {
  if (countryId === "cz") {
    return historicalDataCZ;
  }

  const config = countryConfigs[countryId];
  const priceScale = config.defaultPrice / cz2026Apt;
  const rentScale =
    (config.defaultPrice * config.defaultRentalYield) /
    12 /
    (cz2026Apt * (countryConfigs.cz.defaultRentalYield / 12));

  const rateOffsets: Partial<Record<CountryId, number>> = {
    dubai: -1.5,
    spain: -0.8,
    italy: -0.5,
    croatia: -0.3,
    bali: 0.8,
    saudi: -1.0,
    slovakia: -0.2,
  };

  return scaleHistoricalSnapshots(
    historicalDataCZ,
    priceScale,
    rentScale,
    rateOffsets[countryId] ?? 0
  );
}

const snapshotsByCountry: Record<CountryId, HistoricalDataPoint[]> =
  Object.fromEntries(
    (Object.keys(countryConfigs) as CountryId[]).map((id) => [
      id,
      buildCountrySnapshots(id),
    ])
  ) as Record<CountryId, HistoricalDataPoint[]>;

const chartDataByCountry: Record<CountryId, HistoricalDataPoint[]> =
  Object.fromEntries(
    (Object.keys(countryConfigs) as CountryId[]).map((id) => [
      id,
      interpolateHistoricalData(snapshotsByCountry[id]),
    ])
  ) as Record<CountryId, HistoricalDataPoint[]>;

export function getHistoricalSnapshots(
  countryId: CountryId
): HistoricalDataPoint[] {
  return snapshotsByCountry[countryId];
}

export function getHistoricalChartData(
  countryId: CountryId
): HistoricalDataPoint[] {
  return chartDataByCountry[countryId];
}

/** Zahraniční řady jsou škálované z CZ — UI musí označit jako modelový proxy. */
export function isHistoricalProxyFromCz(countryId: CountryId): boolean {
  return countryId !== "cz";
}

export function historicalProvenanceNote(countryId: CountryId): string {
  if (!isHistoricalProxyFromCz(countryId)) {
    return "Historická řada ČR — ilustrativní modelové body, ne oficiální ČSÚ časová řada.";
  }
  return "Historický přehled je modelově škálovaný z české řady (ceny/nájmy/sazby) — nejde o lokální oficiální historii dané země. Údaje ověřujeme.";
}

export function getDefaultTimeMachineCash(countryId: CountryId): number {
  const snapshots = getHistoricalSnapshots(countryId);
  const year2006 = snapshots.find((d) => d.year === 2006);
  return year2006?.apt70m ?? countryConfigs[countryId].defaultPrice / 2;
}

export interface TimeMachineResult {
  startYear: number;
  initialCash: number;
  propertyValueEnd: number;
  cashRealValueEnd: number;
  growthMultiplier: number;
  inflationMultiplier: number;
  propertyGain: number;
}

export function calculateTimeMachine(
  countryId: CountryId,
  startYear: number,
  initialCash: number
): TimeMachineResult | null {
  const snapshots = getHistoricalSnapshots(countryId);
  const startData = snapshots.find((d) => d.year === startYear);
  const endData = snapshots.find((d) => d.year === HISTORICAL_END_YEAR);

  if (!startData || !endData || initialCash <= 0) {
    return null;
  }

  const growthMultiplier = endData.apt70m / startData.apt70m;
  const inflationMultiplier = endData.cpi / startData.cpi;
  const propertyValueEnd = initialCash * growthMultiplier;
  const cashRealValueEnd = initialCash / inflationMultiplier;

  return {
    startYear,
    initialCash,
    propertyValueEnd,
    cashRealValueEnd,
    growthMultiplier,
    inflationMultiplier,
    propertyGain: propertyValueEnd - initialCash,
  };
}

export function getPurchasableYears(countryId: CountryId): number[] {
  return getHistoricalSnapshots(countryId)
    .filter((d) => d.year < HISTORICAL_END_YEAR)
    .map((d) => d.year);
}
