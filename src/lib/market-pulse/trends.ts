import type { CurrentRates } from "@/lib/rates";
import {
  getHistoricalChartData,
  HISTORICAL_END_YEAR,
  type HistoricalDataPoint,
} from "@/lib/historical-data";
import type { CountryId } from "@/lib/calculators";
import type { ClaimKind } from "@/lib/property-rentgen/types";
import type { DataStatus } from "@/lib/data/types";
import type { PulseTimeframe, PulseTrend, PulseTrendDirection } from "@/lib/market-pulse/types";

const MONTHLY_TIMEFRAMES: PulseTimeframe[] = ["1M", "3M"];

function pctChange(from: number, to: number): number {
  if (from === 0) return 0;
  return Math.round(((to - from) / from) * 1000) / 10;
}

function direction(from: number, to: number, threshold = 0.05): PulseTrendDirection {
  const delta = to - from;
  if (Math.abs(delta) <= threshold) return "flat";
  return delta > 0 ? "up" : "down";
}

function pointAtYear(
  series: HistoricalDataPoint[],
  year: number
): HistoricalDataPoint | null {
  return series.find((p) => p.year === year) ?? null;
}

function yearsBack(endYear: number, tf: PulseTimeframe): number {
  switch (tf) {
    case "1Y":
      return 1;
    case "3Y":
      return 3;
    default:
      return 0;
  }
}

type TrendBuildInput = {
  countryId: CountryId;
  timeframe: PulseTimeframe;
  getValue: (p: HistoricalDataPoint) => number;
  unit: string;
  claimKind: ClaimKind;
  status: DataStatus;
  liveEndValue?: number | null;
  liveStatus?: DataStatus;
  liveClaimKind?: ClaimKind;
};

export function buildHistoricalTrend(input: TrendBuildInput): PulseTrend {
  const { countryId, timeframe, getValue, unit, claimKind, status } = input;

  if (MONTHLY_TIMEFRAMES.includes(timeframe)) {
    return {
      timeframe,
      available: false,
      direction: null,
      changePercent: null,
      changeAbsolute: null,
      startValue: null,
      endValue: null,
      unit,
      claimKind: "NEOVERENO",
      status: "STALE",
      unavailableReason:
        "Měsíční časová řada není k dispozici — použijte 1Y nebo 3Y (roční snapshoty).",
    };
  }

  const series = getHistoricalChartData(countryId);
  const endYear = HISTORICAL_END_YEAR;
  const startYear = endYear - yearsBack(endYear, timeframe);
  const startPoint = pointAtYear(series, startYear);
  const endPoint = pointAtYear(series, endYear);

  if (!startPoint || !endPoint) {
    return {
      timeframe,
      available: false,
      direction: null,
      changePercent: null,
      changeAbsolute: null,
      startValue: null,
      endValue: null,
      unit,
      claimKind: "NEOVERENO",
      status: "STALE",
      unavailableReason: "Chybí historické body pro zvolené období.",
    };
  }

  const startValue = getValue(startPoint);
  const endValue = input.liveEndValue ?? getValue(endPoint);
  const effectiveClaim = input.liveEndValue != null ? (input.liveClaimKind ?? claimKind) : claimKind;
  const effectiveStatus = input.liveEndValue != null ? (input.liveStatus ?? status) : status;

  return {
    timeframe,
    available: true,
    direction: direction(startValue, endValue),
    changePercent: pctChange(startValue, endValue),
    changeAbsolute: Math.round((endValue - startValue) * 100) / 100,
    startValue,
    endValue,
    unit,
    claimKind: effectiveClaim,
    status: effectiveStatus,
    unavailableReason: null,
  };
}

export function buildMortgageRateTrends(
  countryId: CountryId,
  rates: CurrentRates | null
): PulseTrend[] {
  const liveRate =
    countryId === "cz" ? rates?.rateWithInsurance ?? null : null;

  return (["1M", "3M", "1Y", "3Y"] as PulseTimeframe[]).map((tf) => {
    if (MONTHLY_TIMEFRAMES.includes(tf)) {
      if (countryId === "cz" && liveRate != null) {
        return {
          timeframe: tf,
          available: false,
          direction: null,
          changePercent: null,
          changeAbsolute: null,
          startValue: null,
          endValue: liveRate,
          unit: "percent_pa",
          claimKind: "DATA",
          status: "LIVE",
          unavailableReason:
            "Měsíční historie sazeb není k dispozici — aktuální sazba je LIVE, trend jen pro 1Y/3Y.",
        };
      }
      return buildHistoricalTrend({
        countryId,
        timeframe: tf,
        getValue: (p) => p.rate,
        unit: "percent_pa",
        claimKind: "NEOVERENO",
        status: "STALE",
      });
    }

    return buildHistoricalTrend({
      countryId,
      timeframe: tf,
      getValue: (p) => p.rate,
      unit: "percent_pa",
      claimKind: countryId === "cz" && liveRate != null ? "DATA" : "MODEL",
      status: countryId === "cz" && liveRate != null ? "LIVE" : "MODELLED",
      liveEndValue: countryId === "cz" ? liveRate : null,
      liveStatus: "LIVE",
      liveClaimKind: "DATA",
    });
  });
}

export function computeGrossYield(price: number, rentMonthly: number): number {
  if (price <= 0) return 0;
  return Math.round(((rentMonthly * 12) / price) * 1000) / 10;
}

export function buildYieldTrends(countryId: CountryId): PulseTrend[] {
  return (["1M", "3M", "1Y", "3Y"] as PulseTimeframe[]).map((tf) =>
    buildHistoricalTrend({
      countryId,
      timeframe: tf,
      getValue: (p) => computeGrossYield(p.apt70m, p.rent),
      unit: "percent_gross",
      claimKind: "MODEL",
      status: "MODELLED",
    })
  );
}
