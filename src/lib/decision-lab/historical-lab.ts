import {
  getHistoricalSnapshots,
  HISTORICAL_END_YEAR,
} from "@/lib/historical-data";
import type { CountryId } from "@/lib/calculators";
import type { ChartMeta, HistoricalAssetId } from "@/lib/decision-lab/types";
import { HISTORICAL_ASSET_DEFAULT_RETURNS } from "@/lib/decision-lab/types";

export type HistoricalLabInput = {
  countryId: CountryId;
  startYear: number;
  initialCash: number;
  /** LTV pro property_leveraged (0–1) */
  leverageLtv: number;
  /** Volitelné přepsání modelových výnosů */
  savingsReturn?: number;
  termDepositReturn?: number;
  equityBenchmarkReturn?: number;
  enabledAssets: HistoricalAssetId[];
};

export type HistoricalLabSeriesPoint = {
  year: number;
  /** Nominální hodnoty dle asset id */
  nominal: Partial<Record<HistoricalAssetId, number>>;
  /** Reálné (děleno CPI růstem od startu) */
  real: Partial<Record<HistoricalAssetId, number>>;
};

export type HistoricalLabResult = {
  series: HistoricalLabSeriesPoint[];
  endNominal: Partial<Record<HistoricalAssetId, number>>;
  endReal: Partial<Record<HistoricalAssetId, number>>;
  cpiMultiple: number;
  chartMeta: ChartMeta;
  assumptions: string[];
};

export function simulateHistoricalLab(
  input: HistoricalLabInput
): HistoricalLabResult | null {
  const snapshots = getHistoricalSnapshots(input.countryId);
  const start = snapshots.find((d) => d.year === input.startYear);
  const end = snapshots.find((d) => d.year === HISTORICAL_END_YEAR);
  if (!start || !end || input.initialCash <= 0) return null;

  const years = snapshots.filter(
    (d) => d.year >= input.startYear && d.year <= HISTORICAL_END_YEAR
  );
  if (years.length < 2) return null;

  const savingsR =
    input.savingsReturn ?? HISTORICAL_ASSET_DEFAULT_RETURNS.savings;
  const termR =
    input.termDepositReturn ?? HISTORICAL_ASSET_DEFAULT_RETURNS.term_deposit;
  const equityR =
    input.equityBenchmarkReturn ??
    HISTORICAL_ASSET_DEFAULT_RETURNS.equity_benchmark;

  const ltv = Math.min(0.9, Math.max(0, input.leverageLtv));
  const equityForLev = input.initialCash;
  const propertyBoughtLev = equityForLev / Math.max(0.1, 1 - ltv);
  const loan0 = propertyBoughtLev - equityForLev;

  const enabled = new Set(input.enabledAssets);
  const series: HistoricalLabSeriesPoint[] = [];

  for (const snap of years) {
    const t = snap.year - start.year;
    const cpiMul = snap.cpi / start.cpi;
    const propMul = snap.apt70m / start.apt70m;

    const nominal: Partial<Record<HistoricalAssetId, number>> = {};
    const real: Partial<Record<HistoricalAssetId, number>> = {};

    const set = (id: HistoricalAssetId, nom: number) => {
      if (!enabled.has(id)) return;
      nominal[id] = Math.round(nom);
      real[id] = Math.round(nom / cpiMul);
    };

    set("cash", input.initialCash);
    set("savings", input.initialCash * Math.pow(1 + savingsR, t));
    set("term_deposit", input.initialCash * Math.pow(1 + termR, t));
    set("equity_benchmark", input.initialCash * Math.pow(1 + equityR, t));
    set("property_cash", input.initialCash * propMul);

    // Leveraged: property value grows; debt nominal constant (simplified historical model)
    const propVal = propertyBoughtLev * propMul;
    const equityLev = Math.max(0, propVal - loan0);
    set("property_leveraged", equityLev);

    series.push({ year: snap.year, nominal, real });
  }

  const last = series[series.length - 1];
  return {
    series,
    endNominal: last.nominal,
    endReal: last.real,
    cpiMultiple: end.cpi / start.cpi,
    chartMeta: {
      title: "Historický stroj času — Laboratoř rozhodnutí",
      methodology:
        "Nominální hodnoty sledují modelové výnosy aktiv. Reálné = nominální / (CPI_t / CPI_start). U zahraničí jde o škálovaný model z CZ snapshotů (modelový výpočet), ne o oficiální časovou řadu dané země. Páka: konstantní nominální dluh, růst ceny dle indexu bytu.",
      source: "historické snapshoty + předpoklady Laboratoře rozhodnutí",
      sourceUrl: null,
      statusNote:
        "MODELOVÝ VÝPOČET — spoření/termín/akcie používají fixní modelové sazby, ne živé produkty.",
    },
    assumptions: [
      `Start ${input.startYear} → ${HISTORICAL_END_YEAR}, kapitál ${Math.round(input.initialCash)}.`,
      `Spoření ${(savingsR * 100).toFixed(1)} %, termín ${(termR * 100).toFixed(1)} %, akcie ${(equityR * 100).toFixed(1)} % p.a. (model).`,
      `Páka LTV ${(ltv * 100).toFixed(0)} % — zjednodušený model bez refinancování.`,
      `Hotovost nemá nominální úrok; reálně ztrácí kupní sílu dle CPI.`,
    ],
  };
}
