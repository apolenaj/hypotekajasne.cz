import { calculateReadiness } from "@/lib/mortgage-readiness/score";
import { fromReadinessAnswers } from "@/lib/financial-passport/profile";
import { buildFinancialPassportDocument } from "@/lib/financial-passport/build";
import { buildPropertyComparison } from "@/lib/property-compare/build";
import { DEMO_COMPARE_PROPERTIES } from "@/lib/property-compare/demo";
import { buildFreePreview, EMPTY_MANUAL_INPUT } from "@/lib/property-rentgen/preview";
import { buildPortfolioOs } from "@/lib/portfolio-os/build";
import { DEMO_PORTFOLIO_TWINS } from "@/lib/portfolio-os/demo";
import { buildRefinanceRadarDashboard } from "@/lib/refinance-radar/build";
import { DEMO_REFINANCE_PROFILE } from "@/lib/refinance-radar/demo";
import {
  block,
  fmtCzk,
  fmtPct,
  kv,
  PLATFORM_DISCLAIMERS,
  PLATFORM_METHODOLOGY,
  standardFreshness,
  standardNextSteps,
  standardSources,
} from "@/lib/report-engine/sections";
import type { ReportDocument, ReportType, WhiteLabelConfig } from "@/lib/report-engine/types";
import { REPORT_TYPE_LABELS } from "@/lib/report-engine/types";

function reportId(type: ReportType): string {
  return `rpt_${type}_${Date.now().toString(36)}`;
}

export function buildMortgageReadinessReport(
  ratePercent: number | null = 4.89,
  whiteLabel: WhiteLabelConfig | null = null
): ReportDocument {
  const now = new Date().toISOString();
  const profile = fromReadinessAnswers({
    intent: "owner_occupied",
    age: 34,
    coApplicant: false,
    dependents: 0,
    incomeType: "employee",
    netIncome: 52_000,
    otherLiabilities: 3_500,
    creditLimitPayments: 500,
    ownFunds: 900_000,
    targetPrice: 4_800_000,
    targetCountry: "cz",
    currentBalance: 0,
    currentRate: 0,
    yearsLeft: 0,
    hasCzCollateral: false,
    czCollateralEquity: 0,
    employmentMonths: 36,
    noRecentDefaults: true,
  });
  const result = calculateReadiness(profile, ratePercent);

  return {
    id: reportId("mortgage_readiness"),
    type: "mortgage_readiness",
    title: REPORT_TYPE_LABELS.mortgage_readiness,
    generatedAt: now,
    version: "2026.07.1",
    sensitivity: "private",
    whiteLabel,
    highlights: [
      { label: "Readiness skóre", value: `${result.score}/100`, claimKind: "MODEL" },
      {
        label: "Modelový úvěr (horní odhad)",
        value: result.financingRange ? fmtCzk(result.financingRange.high) : "—",
        claimKind: "MODEL",
      },
      { label: "DSTI práh (model)", value: "45 %", claimKind: "MODEL" },
    ],
    inputs: block("inputs", "Vstupy", [
      kv("Záměr", "Vlastní bydlení", "DATA"),
      kv("Čistý příjem", fmtCzk(52_000) + " / měs.", "DATA"),
      kv("Vlastní zdroje", fmtCzk(900_000), "DATA"),
      kv("Cílová cena", fmtCzk(4_800_000), "DATA"),
      kv("Modelová sazba", ratePercent != null ? fmtPct(ratePercent) : "5 % default", "MODEL"),
    ]),
    outputs: block("outputs", "Výstupy", [
      kv("Skóre připravenosti", `${result.score}/100`, "MODEL"),
      kv(
        "Odhad úvěru (pásmo)",
        result.financingRange
          ? `${fmtCzk(result.financingRange.low)} – ${fmtCzk(result.financingRange.high)}`
          : "—",
        "MODEL"
      ),
      kv("Silné stránky", result.strengths.join("; ") || "—", "MODEL"),
      kv("Překážky", result.obstacles.join("; ") || "—", "MODEL"),
    ], { prose: result.improvements.slice(0, 3) }),
    assumptions: block("assumptions", "Předpoklady", [
      kv("Sazba", "Agregát / model — ne individuální nabídka", "MODEL"),
      kv("LTV rámec", "Orientační ~80 % pro výpočet max úvěru", "MODEL"),
      kv("Schválení bankou", "Neimplikováno", "NEOVERENO"),
    ]),
    sources: standardSources([
      kv("Readiness engine", "src/lib/mortgage-readiness/score.ts", "MODEL"),
    ]),
    dataFreshness: block("dataFreshness", "Aktuálnost dat", standardFreshness(now)),
    methodology: block("methodology", "Metodika", PLATFORM_METHODOLOGY.map((m, i) => kv(String(i + 1), m))),
    disclaimers: block("disclaimers", "Disclaimer", PLATFORM_DISCLAIMERS.map((d, i) => kv(String(i + 1), d))),
    nextSteps: standardNextSteps([
      "Doplňte Financial Passport pro personalizaci.",
      "Ověřte DSTI/LTV u konkrétní banky.",
      "Document Vault — checklist dokumentů.",
    ]),
  };
}

export function buildPropertyAnalysisReport(
  whiteLabel: WhiteLabelConfig | null = null
): ReportDocument {
  const now = new Date().toISOString();
  const input = {
    ...EMPTY_MANUAL_INPUT,
    city: "Praha",
    areaM2: 55,
    priceCzk: 5_200_000,
    rentMonthlyCzk: 19_500,
    equityCzk: 1_100_000,
  };
  const preview = buildFreePreview(input, "manual");

  return {
    id: reportId("property_analysis"),
    type: "property_analysis",
    title: REPORT_TYPE_LABELS.property_analysis,
    generatedAt: now,
    version: "2026.07.1",
    sensitivity: "private",
    whiteLabel,
    highlights: [
      {
        label: "Cena / m²",
        value: preview.pricePerM2?.value != null ? fmtCzk(preview.pricePerM2.value) : "—",
        claimKind: preview.pricePerM2?.kind,
      },
      {
        label: "Orientační yield",
        value:
          preview.orientationalYieldPa?.value != null
            ? fmtPct(preview.orientationalYieldPa.value)
            : "—",
        claimKind: preview.orientationalYieldPa?.kind,
      },
    ],
    inputs: block("inputs", "Vstupy", [
      kv("Lokalita", `${input.city}, ${input.country}`, "DATA"),
      kv("Plocha", `${input.areaM2} m²`, "DATA"),
      kv("Cena", fmtCzk(input.priceCzk!), "DATA"),
      kv("Nájem", fmtCzk(input.rentMonthlyCzk!) + " / měs.", "DATA"),
    ]),
    outputs: block("outputs", "Výstupy", [
      kv(
        "Cena / m²",
        preview.pricePerM2?.value != null ? fmtCzk(preview.pricePerM2.value) : "—",
        preview.pricePerM2?.kind
      ),
      kv(
        "Orientační yield",
        preview.orientationalYieldPa?.value != null
          ? fmtPct(preview.orientationalYieldPa.value)
          : "—",
        preview.orientationalYieldPa?.kind
      ),
      kv("Financování fit", preview.financingFit.value, preview.financingFit.kind),
    ], { prose: preview.limitations }),
    assumptions: block("assumptions", "Předpoklady", [
      kv("Nájem", input.rentMonthlyCzk ? "Uživatelský vstup" : "Model lokality", "MODEL"),
      kv("Právní stav", "Neověřeno v free preview", "NEOVERENO"),
    ]),
    sources: standardSources([kv("Rentgen preview", "src/lib/property-rentgen/preview.ts", "MODEL")]),
    dataFreshness: block("dataFreshness", "Aktuálnost dat", standardFreshness(now)),
    methodology: block("methodology", "Metodika", PLATFORM_METHODOLOGY.map((m, i) => kv(String(i + 1), m))),
    disclaimers: block("disclaimers", "Disclaimer", PLATFORM_DISCLAIMERS.map((d, i) => kv(String(i + 1), d))),
    nextSteps: standardNextSteps([
      "Due Diligence Engine pro právní checklist.",
      "Investiční rentgen modelář pro hlubší scénáře.",
      "Deal Room po vážném zájmu.",
    ]),
  };
}

export function buildPropertyComparisonReport(
  ratePercent: number | null = 4.89,
  whiteLabel: WhiteLabelConfig | null = null
): ReportDocument {
  const now = new Date().toISOString();
  const comparison = buildPropertyComparison({
    properties: DEMO_COMPARE_PROPERTIES,
    modelRatePercent: ratePercent ?? 5,
    doc: null,
  });

  return {
    id: reportId("property_comparison"),
    type: "property_comparison",
    title: REPORT_TYPE_LABELS.property_comparison,
    generatedAt: now,
    version: "2026.07.1",
    sensitivity: "private",
    whiteLabel,
    highlights: comparison.categoryWinners.slice(0, 3).map((w) => ({
      label: w.title,
      value: w.propertyLabel,
      sub: w.valueDisplay,
      claimKind: "MODEL" as const,
    })),
    inputs: block("inputs", "Vstupy", DEMO_COMPARE_PROPERTIES.map((p) =>
      kv(p.label, `${fmtCzk(p.priceCzk)} · ${p.city}`, "DATA")
    )),
    outputs: block(
      "outputs",
      "Výstupy",
      comparison.properties.flatMap((p) => [
        kv(
          `${p.label} — yield`,
          p.grossYieldPct.value != null ? fmtPct(p.grossYieldPct.value) : "—",
          p.grossYieldPct.kind
        ),
        kv(
          `${p.label} — IRR`,
          p.irrPct.value != null ? fmtPct(p.irrPct.value) : "—",
          p.irrPct.kind
        ),
      ]),
      {
        tables: [
          {
            headers: ["Kategorie", "Vítěz", "Hodnota"],
            rows: comparison.categoryWinners.map((w) => [
              w.title,
              w.propertyLabel,
              w.valueDisplay,
            ]),
          },
        ],
        prose: comparison.profileRecommendation.tradeoffs
          .slice(0, 2)
          .flatMap((t) => [
            `${t.label}: ${t.pros.slice(0, 2).join("; ")}`,
            t.cons.length ? `Rizika: ${t.cons.slice(0, 2).join("; ")}` : "",
          ])
          .filter(Boolean),
      }
    ),
    assumptions: block("assumptions", "Předpoklady", [
      kv("Sazba", fmtPct(ratePercent ?? 5) + " (model)", "MODEL"),
      kv("Nájem", "Uživatelský nebo model města", "MODEL"),
    ]),
    sources: standardSources([kv("Compare engine", "src/lib/property-compare/build.ts", "MODEL")]),
    dataFreshness: block("dataFreshness", "Aktuálnost dat", standardFreshness(now)),
    methodology: block("methodology", "Metodika", PLATFORM_METHODOLOGY.map((m, i) => kv(String(i + 1), m))),
    disclaimers: block("disclaimers", "Disclaimer", PLATFORM_DISCLAIMERS.map((d, i) => kv(String(i + 1), d))),
    nextSteps: standardNextSteps([
      "Offer Strategy Assistant pro etickou nabídku.",
      "Sledování vybrané nemovitosti ve watchlistu.",
    ]),
  };
}

export function buildInvestmentPassportReport(
  ratePercent: number | null = 4.89,
  whiteLabel: WhiteLabelConfig | null = null
): ReportDocument {
  const now = new Date().toISOString();
  const profile = fromReadinessAnswers({
    intent: "investment",
    age: 38,
    coApplicant: false,
    dependents: 1,
    incomeType: "employee",
    netIncome: 68_000,
    otherLiabilities: 5_000,
    creditLimitPayments: 0,
    ownFunds: 1_400_000,
    targetPrice: 6_500_000,
    targetCountry: "cz",
    currentBalance: 0,
    currentRate: 0,
    yearsLeft: 0,
    hasCzCollateral: true,
    czCollateralEquity: 2_000_000,
    employmentMonths: 48,
    noRecentDefaults: true,
  });
  const doc = buildFinancialPassportDocument(profile, ratePercent);

  return {
    id: reportId("investment_passport"),
    type: "investment_passport",
    title: REPORT_TYPE_LABELS.investment_passport,
    generatedAt: now,
    version: "2026.07.1",
    sensitivity: "private",
    whiteLabel,
    highlights: [
      { label: "Readiness", value: `${doc.readiness.overall}/100`, claimKind: "MODEL" },
      { label: "Vlastní kapitál (model)", value: fmtCzk(doc.assets.totalOwnFundsModel), claimKind: "MODEL" },
      { label: "Max úvěr (model)", value: doc.financing.estimatedMaximum != null ? fmtCzk(doc.financing.estimatedMaximum) : "—", claimKind: "MODEL" },
    ],
    inputs: block("inputs", "Vstupy", [
      kv("Záměr", "Investice", "DATA"),
      kv("Příjem", fmtCzk(68_000) + " / měs.", "DATA"),
      kv("Vlastní zdroje", fmtCzk(1_400_000), "DATA"),
      kv("Cílová cena", fmtCzk(6_500_000), "DATA"),
    ]),
    outputs: block("outputs", "Výstupy", [
      kv("Dimenzionální skóre", doc.readiness.overall + "/100", "MODEL"),
      kv("Pásmo připravenosti", doc.readiness.band, "MODEL"),
      kv("Konzerativní max", doc.financing.conservativeMaximum != null ? fmtCzk(doc.financing.conservativeMaximum) : "—", "MODEL"),
      kv("Překážky", doc.obstacles.join("; ") || "—", "MODEL"),
    ], { prose: doc.improvements.slice(0, 3) }),
    assumptions: block("assumptions", "Předpoklady", [
      kv("Financial Passport", "Algoritmický model — ne schválení", "MODEL"),
      kv("Zajištění CZ", "Zahrnuto v modelu equity", "MODEL"),
    ]),
    sources: standardSources([kv("Financial Passport", "src/lib/financial-passport/build.ts", "MODEL")]),
    dataFreshness: block("dataFreshness", "Aktuálnost dat", standardFreshness(now)),
    methodology: block("methodology", "Metodika", PLATFORM_METHODOLOGY.map((m, i) => kv(String(i + 1), m))),
    disclaimers: block("disclaimers", "Disclaimer", PLATFORM_DISCLAIMERS.map((d, i) => kv(String(i + 1), d))),
    nextSteps: standardNextSteps([
      "Investiční rentgen pro konkrétní nemovitost.",
      "Portfolio OS při více investicích.",
    ]),
  };
}

export function buildPortfolioRiskReport(
  whiteLabel: WhiteLabelConfig | null = null
): ReportDocument {
  const now = new Date().toISOString();
  const result = buildPortfolioOs({
    twins: DEMO_PORTFOLIO_TWINS,
    currentMarketRatePercent: 4.89,
    liquidityReserveCzk: 400_000,
  });

  return {
    id: reportId("portfolio_risk"),
    type: "portfolio_risk",
    title: REPORT_TYPE_LABELS.portfolio_risk,
    generatedAt: now,
    version: "2026.07.1",
    sensitivity: "private",
    whiteLabel,
    highlights: [
      {
        label: "Nemovitostí",
        value: String(result.summary.propertyCount),
        claimKind: "MODEL",
      },
      {
        label: "Portfolio LTV",
        value: result.summary.portfolioLtv.value != null ? fmtPct(Number(result.summary.portfolioLtv.value)) : "—",
        claimKind: result.summary.portfolioLtv.claimKind,
      },
    ],
    inputs: block("inputs", "Vstupy", [
      kv("Počet twinů", String(result.summary.propertyCount), "MODEL"),
      kv("Rezerva likvidity", fmtCzk(400_000), "DATA"),
    ]),
    outputs: block(
      "outputs",
      "Výstupy",
      [
        kv("Celková hodnota", result.summary.totalPropertyValue.value != null ? fmtCzk(Number(result.summary.totalPropertyValue.value)) : "—", result.summary.totalPropertyValue.claimKind),
        kv("Měsíční CF", result.summary.monthlyNetCashFlow.value != null ? fmtCzk(Number(result.summary.monthlyNetCashFlow.value)) : "—", result.summary.monthlyNetCashFlow.claimKind),
        kv("Koncentrace alerty", String(result.concentrationAlerts.length), "MODEL"),
      ],
      {
        prose: result.concentrationAlerts.slice(0, 3).map((a) => a.headline),
      }
    ),
    assumptions: block("assumptions", "Předpoklady", [
      kv("Hodnoty nemovitostí", "Poslední user/twin observation", "MODEL"),
      kv("Stress testy", "Scénáře MODEL — ne predikce", "MODEL"),
    ]),
    sources: standardSources([kv("Portfolio OS", "src/lib/portfolio-os/build.ts", "MODEL")]),
    dataFreshness: block("dataFreshness", "Aktuálnost dat", standardFreshness(now)),
    methodology: block("methodology", "Metodika", PLATFORM_METHODOLOGY.map((m, i) => kv(String(i + 1), m))),
    disclaimers: block("disclaimers", "Disclaimer", PLATFORM_DISCLAIMERS.map((d, i) => kv(String(i + 1), d))),
    nextSteps: standardNextSteps([
      "Review koncentrace dle alertů.",
      "Refinance Radar u blížící se fixace.",
    ]),
  };
}

export function buildRefinanceReport(
  ratePercent: number | null = 4.89,
  whiteLabel: WhiteLabelConfig | null = null
): ReportDocument {
  const now = new Date().toISOString();
  const dash = buildRefinanceRadarDashboard({
    profile: DEMO_REFINANCE_PROFILE,
    rates: ratePercent != null
      ? {
          rateWithInsurance: ratePercent,
          rateWithoutInsurance: ratePercent + 0.3,
          rpsnWithInsurance: null,
          rpsnWithoutInsurance: null,
          withoutInsuranceOrientational: true,
          updatedAt: now,
        }
      : null,
  });

  return {
    id: reportId("refinance"),
    type: "refinance",
    title: REPORT_TYPE_LABELS.refinance,
    generatedAt: now,
    version: "2026.07.1",
    sensitivity: "private",
    whiteLabel,
    highlights: [
      { label: "Měsíční splátka (nyní)", value: fmtCzk(dash.profile.monthlyPaymentCzk), claimKind: "DATA" },
      {
        label: "Potenciální úspora / měs.",
        value: dash.comparison.potentialMonthlySavingCzk != null ? fmtCzk(dash.comparison.potentialMonthlySavingCzk) : "—",
        claimKind: "MODEL",
      },
      { label: "Měsíců do fixace", value: dash.monthsToFixation != null ? String(dash.monthsToFixation) : "—", claimKind: "DATA" },
    ],
    inputs: block("inputs", "Vstupy", [
      kv("Zůstatek úvěru", fmtCzk(dash.profile.loanBalanceCzk), "DATA"),
      kv("Sazba", fmtPct(dash.profile.ratePercent), "DATA"),
      kv("Fixace do", dash.profile.fixationEnd, "DATA"),
      kv("Tržní reference", dash.marketReference.ratePercent != null ? fmtPct(dash.marketReference.ratePercent) : "—", dash.marketReference.claimKind),
    ]),
    outputs: block("outputs", "Výstupy", [
      kv("Stay vs Refinance", dash.comparison.summary, "MODEL"),
      kv("Break-even", dash.comparison.breakEvenMonths != null ? `${dash.comparison.breakEvenMonths} měsíců` : "—", "MODEL"),
      kv("Poplatky refinancování", fmtCzk(dash.comparison.upfrontRefinanceCostsCzk), "MODEL"),
    ], { prose: [dash.comparison.summary] }),
    assumptions: block("assumptions", "Předpoklady", [
      kv("Anuita", "MODEL na zadaném zůstatku", "MODEL"),
      kv("Penále předčasného splacení", dash.profile.earlyRepaymentPenaltyCzk != null ? fmtCzk(dash.profile.earlyRepaymentPenaltyCzk) : "Neznámé", "ODHAD"),
    ]),
    sources: standardSources([kv("Refinance Radar", "src/lib/refinance-radar/build.ts", "MODEL")]),
    dataFreshness: block("dataFreshness", "Aktuálnost dat", standardFreshness(now)),
    methodology: block("methodology", "Metodika", PLATFORM_METHODOLOGY.map((m, i) => kv(String(i + 1), m))),
    disclaimers: block("disclaimers", "Disclaimer", PLATFORM_DISCLAIMERS.map((d, i) => kv(String(i + 1), d))),
    nextSteps: standardNextSteps([
      "Konzultace s hypotečním specialistou před výpovědí fixace.",
      "Document Vault — smlouvy a výpovědi.",
    ]),
  };
}

export function buildReportByType(
  type: ReportType,
  opts?: { ratePercent?: number | null; whiteLabel?: WhiteLabelConfig | null }
): ReportDocument {
  const wl = opts?.whiteLabel ?? null;
  const rate = opts?.ratePercent ?? 4.89;
  switch (type) {
    case "mortgage_readiness":
      return buildMortgageReadinessReport(rate, wl);
    case "property_analysis":
      return buildPropertyAnalysisReport(wl);
    case "property_comparison":
      return buildPropertyComparisonReport(rate, wl);
    case "investment_passport":
      return buildInvestmentPassportReport(rate, wl);
    case "portfolio_risk":
      return buildPortfolioRiskReport(wl);
    case "refinance":
      return buildRefinanceReport(rate, wl);
  }
}
