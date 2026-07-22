import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";
import {
  getHistoricalChartData,
  HISTORICAL_END_YEAR,
} from "@/lib/historical-data";
import { SUPPORTED_PULSE_MARKETS, getMarketProfile } from "@/lib/market-pulse/countries";
import { computeGrossYield } from "@/lib/market-pulse/trends";
import type {
  OpportunityRadarAlert,
  OpportunityRadarCriteria,
} from "@/lib/market-pulse/types";

const RADAR_DISCLAIMER =
  "Radar příležitostí pouze upozorňuje na shodu s vašimi kritérii nad modelovými daty. Nejedná se o investiční doporučení ani garantovanou příležitost. Vždy ověřte konkrétní nemovitost a právní rámec.";

function priceDropPercent(countryId: CountryId): number | null {
  const series = getHistoricalChartData(countryId);
  const end = series.find((p) => p.year === HISTORICAL_END_YEAR);
  const start = series.find((p) => p.year === HISTORICAL_END_YEAR - 1);
  if (!end || !start) return null;
  return Math.round(((end.apt70m - start.apt70m) / start.apt70m) * 1000) / 10;
}

function grossYieldPercent(countryId: CountryId): number | null {
  const series = getHistoricalChartData(countryId);
  const latest = series.find((p) => p.year === HISTORICAL_END_YEAR);
  if (!latest) return null;
  return computeGrossYield(latest.apt70m, latest.rent);
}

/** Vyšší skóre = rizikovější trh (inverze operational_complexity z profilu) */
function marketRiskScore(countryId: CountryId): number | null {
  const profile = getMarketProfile(countryId);
  if (!profile) return null;
  return 100 - profile.attributes.operational_complexity;
}

function entryCapitalCzk(countryId: CountryId): number | null {
  const profile = getMarketProfile(countryId);
  return profile?.typicalEntryCapitalCzk ?? null;
}

export function scanOpportunityRadar(
  criteria: OpportunityRadarCriteria
): OpportunityRadarAlert[] {
  const alerts: OpportunityRadarAlert[] = [];
  const priceDropActive = criteria.minPriceDropPercent > 0;

  for (const countryId of SUPPORTED_PULSE_MARKETS) {
    const yieldPct = grossYieldPercent(countryId);
    const dropPct = priceDropPercent(countryId);
    const risk = marketRiskScore(countryId);
    const capital = entryCapitalCzk(countryId);
    const profile = getMarketProfile(countryId);
    const name = countryConfigs[countryId].label;

    const checks: { label: string; pass: boolean }[] = [
      {
        label: `hrubý yield ≥ ${criteria.minYieldPercent} %`,
        pass: yieldPct != null && yieldPct >= criteria.minYieldPercent,
      },
      {
        label: `riziko trhu ≤ ${criteria.maxMarketRiskScore}`,
        pass: risk != null && risk <= criteria.maxMarketRiskScore,
      },
      {
        label: `vstupní kapitál ≤ ${new Intl.NumberFormat("cs-CZ").format(criteria.maxCashRequiredCzk)} Kč`,
        pass: capital != null && capital <= criteria.maxCashRequiredCzk,
      },
    ];

    if (priceDropActive) {
      checks.push({
        label: `pokles ceny ≥ ${criteria.minPriceDropPercent} % (1Y model)`,
        pass: dropPct != null && dropPct <= -criteria.minPriceDropPercent,
      });
    }

    const allPass = checks.every((c) => c.pass);
    if (!allPass) continue;

    const matched = checks.map((c) => {
      if (c.label.includes("yield") && yieldPct != null) {
        return `${c.label} (model: ${yieldPct.toFixed(1)} %)`;
      }
      if (c.label.includes("pokles") && dropPct != null) {
        return `${c.label} (model: ${dropPct.toFixed(1)} %)`;
      }
      if (c.label.includes("riziko") && risk != null) {
        return `${c.label} (model: ${risk})`;
      }
      if (c.label.includes("kapitál") && capital != null) {
        return `${c.label} (orientačně ${new Intl.NumberFormat("cs-CZ").format(capital)} Kč)`;
      }
      return c.label;
    });

    alerts.push({
      id: `radar.${countryId}`,
      countryId,
      marketName: name,
      matchedCriteria: matched,
      headline: `${name} — shoda se všemi aktivními kritérii`,
      body: `Modelová data pro ${name} splňují vaše filtry. ${profile?.notes ?? ""}`.trim(),
      claimKind: "MODEL",
      disclaimer: RADAR_DISCLAIMER,
    });
  }

  return alerts;
}

export { RADAR_DISCLAIMER };
