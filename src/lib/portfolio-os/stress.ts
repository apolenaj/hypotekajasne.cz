import type { PropertyDigitalTwin } from "@/lib/digital-twin/types";
import type {
  PortfolioPropertyRow,
  StressScenarioId,
  StressScenarioResult,
} from "@/lib/portfolio-os/types";
import { stressedDebtService } from "@/lib/portfolio-os/rows";

function baselineTotals(rows: PortfolioPropertyRow[]) {
  const totalValue = rows.reduce((s, r) => s + (r.valueCzk ?? 0), 0);
  const totalDebt = rows.reduce((s, r) => s + (r.debtCzk ?? 0), 0);
  const totalEquity = rows.reduce((s, r) => s + (r.equityCzk ?? 0), 0);
  const totalCf = rows.reduce((s, r) => s + (r.monthlyNetCashFlowCzk ?? 0), 0);
  const ltv = totalValue > 0 ? totalDebt / totalValue : null;
  return { totalValue, totalDebt, totalEquity, totalCf, ltv };
}

function applyStress(
  rows: PortfolioPropertyRow[],
  twins: PropertyDigitalTwin[],
  scenario: StressScenarioId
): { equity: number; ltv: number | null; netCf: number } {
  const twinMap = new Map(twins.map((t) => [t.id, t]));
  let totalValue = 0;
  let totalDebt = 0;
  let totalCf = 0;

  for (const r of rows) {
    const twin = twinMap.get(r.twinId);
    let value = r.valueCzk ?? 0;
    let rent = r.monthlyGrossRentCzk ?? 0;
    let debt = r.debtCzk ?? 0;
    let payment = r.monthlyDebtServiceCzk ?? 0;
    const currency = twin?.location.currencyCode ?? "CZK";

    switch (scenario) {
      case "rates_plus_2pp":
        if (twin) {
          payment = stressedDebtService(r, twin, 2) ?? payment;
        }
        break;
      case "values_minus_15pct":
        value *= 0.85;
        break;
      case "rent_minus_10pct":
        rent *= 0.9;
        break;
      case "vacancy_3_months":
        rent = (rent * 9) / 12;
        break;
      case "fx_minus_15pct":
        if (currency !== "CZK") {
          value *= 0.85;
          rent *= 0.85;
        }
        break;
      case "combined_recession":
        value *= 0.85;
        rent *= 0.9 * (9 / 12);
        if (twin) {
          payment = stressedDebtService(r, twin, 2) ?? payment;
        }
        if (currency !== "CZK") {
          value *= 0.85;
          rent *= 0.85;
        }
        break;
      default:
        break;
    }

    const expenses =
      r.monthlyGrossRentCzk != null && r.monthlyNetCashFlowCzk != null
        ? r.monthlyGrossRentCzk - r.monthlyNetCashFlowCzk - (r.monthlyDebtServiceCzk ?? 0)
        : 0;

    const net = rent - expenses - payment;
    totalValue += value;
    totalDebt += debt;
    totalCf += net;
  }

  const equity = totalValue - totalDebt;
  const ltv = totalValue > 0 ? totalDebt / totalValue : null;
  return { equity, ltv, netCf: totalCf };
}

const SCENARIO_META: Record<
  StressScenarioId,
  { label: string; description: string }
> = {
  rates_plus_2pp: {
    label: "Sazby +2 p.b.",
    description: "Modelový nárůst splátek při +2 p.b. na zůstatku úvěru.",
  },
  values_minus_15pct: {
    label: "Hodnoty −15 %",
    description: "Snížení value observations o 15 % — stress equity a LTV.",
  },
  rent_minus_10pct: {
    label: "Nájem −10 %",
    description: "Pokles hrubého nájmu o 10 %.",
  },
  vacancy_3_months: {
    label: "Neobsazenost 3 měsíce",
    description: "Ekvivalent 3 měsíců bez nájmu v roce (9/12 měsíců).",
  },
  fx_minus_15pct: {
    label: "FX −15 %",
    description: "Oslabení cizí měny u assetů/příjmů mimo CZK.",
  },
  combined_recession: {
    label: "Combined recession",
    description: "Kombinace: hodnoty −15 %, nájem −10 %, 3m vacancy, sazby +2 p.b., FX −15 %.",
  },
};

export function runStressTests(
  rows: PortfolioPropertyRow[],
  twins: PropertyDigitalTwin[]
): StressScenarioResult[] {
  const base = baselineTotals(rows);
  const ids = Object.keys(SCENARIO_META) as StressScenarioId[];

  return ids.map((id) => {
    const stressed = applyStress(rows, twins, id);
    const meta = SCENARIO_META[id];
    const deltaEquity =
      base.totalEquity > 0
        ? stressed.equity - base.totalEquity
        : stressed.equity;
    const deltaCf = stressed.netCf - base.totalCf;

    return {
      id,
      label: meta.label,
      description: meta.description,
      baseline: {
        equityCzk: Math.round(base.totalEquity),
        portfolioLtv: base.ltv != null ? Math.round(base.ltv * 1000) / 1000 : null,
        monthlyNetCashFlowCzk: Math.round(base.totalCf),
      },
      stressed: {
        equityCzk: Math.round(stressed.equity),
        portfolioLtv:
          stressed.ltv != null ? Math.round(stressed.ltv * 1000) / 1000 : null,
        monthlyNetCashFlowCzk: Math.round(stressed.netCf),
      },
      deltaSummary: `Equity ${deltaEquity >= 0 ? "+" : ""}${Math.round(deltaEquity).toLocaleString("cs-CZ")} Kč · CF ${deltaCf >= 0 ? "+" : ""}${Math.round(deltaCf).toLocaleString("cs-CZ")} Kč/měs.`,
      claimKind: "MODEL",
    };
  });
}
