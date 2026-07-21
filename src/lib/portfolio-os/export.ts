import type { PortfolioOsResult } from "@/lib/portfolio-os/types";

function fmt(n: number | string | null | undefined): string {
  if (n == null) return "";
  if (typeof n === "number") {
    return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 2 }).format(n);
  }
  return String(n);
}

/**
 * CSV export pro účetního / poradce — včetně claim kinds a metodiky.
 */
export function buildAdvisorExportRows(result: PortfolioOsResult): string[][] {
  const rows: string[][] = [
    ["Moje portfolio — export pro poradce/účetní"],
    ["Vygenerováno", result.generatedAt],
    [],
    ["SOUHRN", "Hodnota", "Claim", "Blockery"],
    [
      result.summary.totalPropertyValue.label,
      fmt(result.summary.totalPropertyValue.value),
      result.summary.totalPropertyValue.claimKind,
      result.summary.totalPropertyValue.blockers.join("; "),
    ],
    [
      result.summary.totalEquity.label,
      fmt(result.summary.totalEquity.value),
      result.summary.totalEquity.claimKind,
      result.summary.totalEquity.blockers.join("; "),
    ],
    [
      result.summary.totalDebt.label,
      fmt(result.summary.totalDebt.value),
      result.summary.totalDebt.claimKind,
      "",
    ],
    [
      result.summary.portfolioLtv.label,
      fmt(result.summary.portfolioLtv.value),
      result.summary.portfolioLtv.claimKind,
      "",
    ],
    [
      result.summary.monthlyGrossRent.label,
      fmt(result.summary.monthlyGrossRent.value),
      result.summary.monthlyGrossRent.claimKind,
      "",
    ],
    [
      result.summary.monthlyNetCashFlow.label,
      fmt(result.summary.monthlyNetCashFlow.value),
      result.summary.monthlyNetCashFlow.claimKind,
      "",
    ],
    [
      result.summary.weightedYield.label,
      fmt(result.summary.weightedYield.value),
      result.summary.weightedYield.claimKind,
      "",
    ],
    [
      result.summary.debtService.label,
      fmt(result.summary.debtService.value),
      result.summary.debtService.claimKind,
      "",
    ],
    [
      result.summary.liquidityReserve.label,
      fmt(result.summary.liquidityReserve.value),
      result.summary.liquidityReserve.claimKind,
      result.summary.liquidityReserve.blockers.join("; "),
    ],
    [],
    ["NEMOVITOSTI", "Město", "Hodnota", "Vlastní kapitál", "Dluh", "Nájem", "Peněžní tok", "Splátka", "Výnos"],
  ];

  for (const p of result.properties) {
    rows.push([
      p.label,
      p.city ?? "",
      fmt(p.valueCzk),
      fmt(p.equityCzk),
      fmt(p.debtCzk),
      fmt(p.monthlyGrossRentCzk),
      fmt(p.monthlyNetCashFlowCzk),
      fmt(p.monthlyDebtServiceCzk),
      p.grossYieldPct != null ? fmt(p.grossYieldPct) : "",
    ]);
  }

  rows.push([]);
  rows.push(["KONCENTRACE RIZIKA", "Headline", "Severity", "%"]);
  for (const a of result.concentrationAlerts) {
    rows.push([a.dimension, a.headline, a.severity, fmt(a.metricPct)]);
  }

  rows.push([]);
  rows.push(["ZÁTĚŽOVÉ TESTY", "Scénář", "Vlastní kapitál po zátěži", "LTV po zátěži", "Peněžní tok po zátěži", "Změna"]);
  for (const s of result.stressTests) {
    rows.push([
      s.label,
      s.description,
      fmt(s.stressed.equityCzk),
      fmt(s.stressed.portfolioLtv),
      fmt(s.stressed.monthlyNetCashFlowCzk),
      s.deltaSummary,
    ]);
  }

  rows.push([]);
  rows.push(["DOPORUČENÍ (scénáře, ne prodej)", "Headline", "Vysvětlení"]);
  for (const r of result.recommendations) {
    rows.push([r.id, r.headline, r.explanation]);
    for (const sc of r.scenarios) {
      rows.push(["", sc.label, sc.description]);
    }
  }

  rows.push([]);
  rows.push(["METODIKA"]);
  for (const m of result.methodology) {
    rows.push([m]);
  }

  return rows;
}

export function buildAdvisorExportCsv(result: PortfolioOsResult): string {
  return buildAdvisorExportRows(result)
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

export function downloadAdvisorExport(result: PortfolioOsResult, filename?: string) {
  if (typeof window === "undefined") return;
  const csv = buildAdvisorExportCsv(result);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `portfolio-os-export-${result.generatedAt.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
