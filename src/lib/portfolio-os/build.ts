import type { PropertyDigitalTwin } from "@/lib/digital-twin/types";
import { analyzeConcentration } from "@/lib/portfolio-os/concentration";
import { buildPortfolioRecommendations } from "@/lib/portfolio-os/recommendations";
import { buildPortfolioPropertyRows } from "@/lib/portfolio-os/rows";
import { runStressTests } from "@/lib/portfolio-os/stress";
import type {
  ExposureSlice,
  PortfolioOsResult,
  PortfolioSummary,
} from "@/lib/portfolio-os/types";
import { summaryMetric } from "@/lib/portfolio-os/types";

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function buildExposure(
  rows: { key: string; label: string; valueCzk: number }[],
  total: number,
  claimKind: "DATA" | "MODEL"
): ExposureSlice[] {
  return rows
    .filter((r) => r.valueCzk > 0)
    .map((r) => ({
      key: r.key,
      label: r.label,
      valueCzk: Math.round(r.valueCzk),
      sharePct: pct(r.valueCzk, total),
      claimKind,
    }))
    .sort((a, b) => b.sharePct - a.sharePct);
}

function buildSummary(
  rows: ReturnType<typeof buildPortfolioPropertyRows>,
  twins: PropertyDigitalTwin[],
  liquidityReserveCzk: number | null
): PortfolioSummary {
  const withValue = rows.filter((r) => r.valueCzk != null);
  const totalValue = withValue.reduce((s, r) => s + (r.valueCzk ?? 0), 0);
  const totalEquity = rows.reduce((s, r) => s + (r.equityCzk ?? 0), 0);
  const totalDebt = rows.reduce((s, r) => s + (r.debtCzk ?? 0), 0);
  const totalRent = rows.reduce((s, r) => s + (r.monthlyGrossRentCzk ?? 0), 0);
  const totalCf = rows.reduce((s, r) => s + (r.monthlyNetCashFlowCzk ?? 0), 0);
  const totalDebtService = rows.reduce(
    (s, r) => s + (r.monthlyDebtServiceCzk ?? 0),
    0
  );

  const blockers: string[] = [];
  if (withValue.length < rows.length) {
    blockers.push(
      `${rows.length - withValue.length} nemovitostí bez platné value observation — nejsou v součtu hodnoty.`
    );
  }

  const weightedYield =
    totalValue > 0
      ? rows.reduce((s, r) => {
          if (r.grossYieldPct == null || r.valueCzk == null) return s;
          return s + r.grossYieldPct * (r.valueCzk / totalValue);
        }, 0)
      : null;

  const twinCurrency = new Map(
    twins.map((t) => [t.id, t.location.currencyCode ?? "CZK"])
  );
  const currencyMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  const typeMap = new Map<string, number>();

  for (const r of withValue) {
    const cur = twinCurrency.get(r.twinId) ?? "CZK";
    currencyMap.set(cur, (currencyMap.get(cur) ?? 0) + (r.valueCzk ?? 0));
    const country = r.country ?? "Neuvedeno";
    countryMap.set(country, (countryMap.get(country) ?? 0) + (r.valueCzk ?? 0));
    const type = r.propertyType ?? "Neuvedeno";
    typeMap.set(type, (typeMap.get(type) ?? 0) + (r.valueCzk ?? 0));
  }

  const ltv = totalValue > 0 ? totalDebt / totalValue : null;

  return {
    propertyCount: rows.length,
    propertiesWithValidValue: withValue.length,
    totalPropertyValue: summaryMetric(
      "Hodnota nemovitostí",
      totalValue > 0 ? totalValue : null,
      withValue.length === rows.length ? "DATA" : "MODEL",
      blockers,
      { unit: "CZK", formula: "Σ posledních pozorování hodnoty" }
    ),
    totalEquity: summaryMetric(
      "Vlastní kapitál",
      rows.every((r) => r.equityCzk != null) ? totalEquity : null,
      "MODEL",
      rows.some((r) => r.equityCzk == null)
        ? ["U některých twinů chybí vlastní kapitál — chybí hodnota nebo zůstatek úvěru."]
        : [],
      { unit: "CZK" }
    ),
    totalDebt: summaryMetric(
      "Celkový dluh",
      totalDebt > 0 ? totalDebt : null,
      "DATA",
      [],
      { unit: "CZK" }
    ),
    portfolioLtv: summaryMetric(
      "Portfolio LTV",
      ltv != null ? Math.round(ltv * 1000) / 1000 : null,
      "MODEL",
      totalValue <= 0 ? ["LTV vyžaduje součet hodnot."] : [],
      { formula: "celkový dluh / hodnota nemovitostí" }
    ),
    monthlyGrossRent: summaryMetric(
      "Hrubé nájemné / měs.",
      totalRent > 0 ? totalRent : null,
      "DATA",
      [],
      { unit: "CZK" }
    ),
    monthlyNetCashFlow: summaryMetric(
      "Čistý cash flow / měs.",
      rows.length > 0 ? Math.round(totalCf) : null,
      "MODEL",
      [],
      { unit: "CZK", formula: "Σ (nájem − opex − splátka) / měsíc" }
    ),
    weightedYield: summaryMetric(
      "Vážený výnos",
      weightedYield != null ? Math.round(weightedYield * 1000) / 1000 : null,
      "MODEL",
      [],
      { formula: "Σ (výnos × váha hodnoty)" }
    ),
    debtService: summaryMetric(
      "Dluhová služba",
      totalDebtService > 0 ? totalDebtService : null,
      "DATA",
      [],
      { unit: "CZK/měs." }
    ),
    liquidityReserve: summaryMetric(
      "Likvidní rezerva",
      liquidityReserveCzk,
      liquidityReserveCzk != null ? "DATA" : "NEOVERENO",
      liquidityReserveCzk == null
        ? ["Doplňte vlastní zdroje ve Finančním pasu."]
        : [],
      { unit: "CZK" }
    ),
    currencyExposure: buildExposure(
      [...currencyMap.entries()].map(([key, valueCzk]) => ({
        key,
        label: key,
        valueCzk,
      })),
      totalValue,
      "MODEL"
    ),
    countryExposure: buildExposure(
      [...countryMap.entries()].map(([key, valueCzk]) => ({
        key,
        label: key,
        valueCzk,
      })),
      totalValue,
      "MODEL"
    ),
    propertyTypeExposure: buildExposure(
      [...typeMap.entries()].map(([key, valueCzk]) => ({
        key,
        label: key,
        valueCzk,
      })),
      totalValue,
      "MODEL"
    ),
    blockers,
  };
}

export function buildPortfolioOs(input: {
  twins: PropertyDigitalTwin[];
  currentMarketRatePercent: number | null;
  liquidityReserveCzk?: number | null;
  now?: Date;
}): PortfolioOsResult {
  const owned = input.twins.filter((t) => t.relationship === "owned");
  const rows = buildPortfolioPropertyRows(owned, input.currentMarketRatePercent);
  const summary = buildSummary(rows, owned, input.liquidityReserveCzk ?? null);

  const rentCurrencyByTwinId: Record<string, string> = {};
  for (const t of owned) {
    const rent = [...t.rentHistory].sort(
      (a, b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom)
    )[0];
    rentCurrencyByTwinId[t.id] = rent?.currencyCode ?? t.location.currencyCode ?? "CZK";
  }

  const concentrationAlerts = analyzeConcentration({
    rows,
    rentCurrencyByTwinId,
    now: input.now,
  });
  const stressTests = runStressTests(rows, owned);
  const recommendations = buildPortfolioRecommendations({
    rows,
    concentrationAlerts,
    stressTests,
  });

  return {
    generatedAt: new Date().toISOString(),
    summary,
    properties: rows,
    concentrationAlerts,
    stressTests,
    recommendations,
    methodology: [
      "Moje portfolio agreguje digitální karty nemovitostí — hodnoty jen z pozorování ceny.",
      "LTV, vážený výnos a peněžní tok jsou orientační model — ne bankovní schválení.",
      "Zátěžové testy jsou orientační šoky na stejném modelu.",
      "Doporučení jsou srozumitelné scénáře A/B/C — bez pokynu k prodeji.",
      "Export pro účetního obsahuje typ údaje a případné překážky.",
    ],
  };
}
