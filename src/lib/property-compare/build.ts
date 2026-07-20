import { calculateInvestment } from "@/lib/investment-engine";
import type { InvestmentEngineInput } from "@/lib/investment-engine/types";
import { evaluateAffordability } from "@/lib/majetio/affordability";
import { toMajetioHandoff } from "@/lib/financial-passport/handoff";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import { getAdjustedMetrics } from "@/lib/market-metrics";
import {
  compositeRiskScore,
  dataCompletenessFromInput,
  liquidityScore,
  locationScore,
  renovationLabel,
  rentalDemandScore,
} from "@/lib/property-compare/scores";
import type {
  CategoryWinner,
  CompareCategoryId,
  ComparePropertyInput,
  ComparePropertyMetrics,
  ClaimedMetric,
  ExitScenarioRow,
  ProfileRecommendation,
  PropertyComparisonResult,
  PropertyTradeoff,
} from "@/lib/property-compare/types";

const MIN_PROPERTIES = 2;
const MAX_PROPERTIES = 5;

function purposeLabel(purpose: ComparePropertyInput["purpose"]): string {
  return purpose === "own_use" ? "Vlastní bydlení" : "Dlouhodobý nájem";
}

function estimateRentMonthly(price: number, yieldPct: number): number {
  return Math.round((price * (yieldPct / 100)) / 12);
}

function toEngineInput(
  prop: ComparePropertyInput,
  modelRatePercent: number
): { input: InvestmentEngineInput; rentKind: "DATA" | "MODEL"; equityKind: "DATA" | "MODEL" } {
  const market = getAdjustedMetrics(
    prop.city,
    prop.propertyType || "Byt",
    purposeLabel(prop.purpose)
  );
  const rentFromUser =
    prop.rentMonthlyCzk != null && prop.rentMonthlyCzk > 0
      ? prop.rentMonthlyCzk
      : estimateRentMonthly(prop.priceCzk, market.yield);
  const rentKind =
    prop.rentMonthlyCzk != null && prop.rentMonthlyCzk > 0 ? "DATA" : "MODEL";

  const equityFromUser =
    prop.equityCzk != null && prop.equityCzk >= 0
      ? prop.equityCzk
      : Math.round(prop.priceCzk * 0.2);
  const equityKind =
    prop.equityCzk != null && prop.equityCzk >= 0 ? "DATA" : "MODEL";

  const rate = prop.ratePercent ?? modelRatePercent;
  const opexPerM2 = prop.propertyType === "Komerce" ? 180 : 120;

  const input: InvestmentEngineInput = {
    purchasePrice: prop.priceCzk,
    downPayment: equityFromUser,
    loan: null,
    rate,
    termYears: prop.termYears,
    rentMonthly: rentFromUser,
    vacancyRate: prop.purpose === "own_use" ? 0 : 0.05,
    managementFeeRate: prop.purpose === "own_use" ? 0 : 0.08,
    serviceChargesAnnual: Math.round(prop.areaM2 * opexPerM2),
    insuranceAnnual: Math.round(prop.priceCzk * 0.002),
    propertyTaxAnnual: 0,
    incomeTaxRate: prop.purpose === "own_use" ? 0 : 0.15,
    maintenanceAnnual: Math.round(prop.areaM2 * 80),
    capexReserveAnnual: Math.round(prop.areaM2 * 40),
    furnishing: prop.purpose === "own_use" ? 0 : Math.round(rentFromUser * 2),
    acquisitionCosts: Math.round(prop.priceCzk * 0.03),
    sellingCostRate: 0.03,
    annualRentGrowth: 0.025,
    annualPropertyGrowth: 0.03,
    annualFxReturn: 0,
    holdingPeriodYears: 7,
  };

  return { input, rentKind, equityKind };
}

function fmtPct(n: number | null, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits).replace(".", ",")} %`;
}

function fmtCzk(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

function claimed<T>(value: T, kind: ClaimedMetric<T>["kind"], note?: string): ClaimedMetric<T> {
  return { value, kind, note };
}

function buildExitScenarios(
  baseInput: InvestmentEngineInput
): ExitScenarioRow[] {
  const scenarios: { id: "bear" | "base" | "bull"; label: string }[] = [
    { id: "bear", label: "Bear" },
    { id: "base", label: "Base" },
    { id: "bull", label: "Bull" },
  ];
  return scenarios.map(({ id, label }) => {
    const r = calculateInvestment(baseInput, id);
    return {
      scenario: id,
      label,
      irrPct: r.irr,
      exitProceedsCzk: Math.round(r.exitProceeds),
      claimKind: "MODEL" as const,
    };
  });
}

function normalizeRadar(values: {
  cashFlow: number;
  yield: number;
  appreciation: number;
  liquidity: number;
  location: number;
  lowRisk: number;
  affordability: number;
}): ComparePropertyMetrics["radar"] {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  return {
    cashFlow: clamp(values.cashFlow),
    yield: clamp(values.yield),
    appreciation: clamp(values.appreciation),
    liquidity: clamp(values.liquidity),
    location: clamp(values.location),
    lowRisk: clamp(values.lowRisk),
    affordability: clamp(values.affordability),
  };
}

function affordabilityScore(aff: ComparePropertyMetrics["affordability"]): number {
  if (!aff) return 50;
  switch (aff.verdict) {
    case "within_safe_budget":
      return 95;
    case "within_max_estimate":
      return 72;
    case "above_budget":
      return 35;
    default:
      return 50;
  }
}

function buildMetricsForProperty(
  prop: ComparePropertyInput,
  modelRatePercent: number,
  doc: FinancialPassportDocument | null,
  allCashFlows: number[]
): ComparePropertyMetrics {
  const { input, rentKind, equityKind } = toEngineInput(prop, modelRatePercent);
  const result = calculateInvestment(input, "base");
  const market = getAdjustedMetrics(
    prop.city,
    prop.propertyType || "Byt",
    purposeLabel(prop.purpose)
  );

  const fairValue =
    prop.areaM2 > 0
      ? Math.round(market.pricePerM2 * prop.areaM2)
      : null;
  const discountPremiumPct =
    fairValue != null && fairValue > 0
      ? (prop.priceCzk - fairValue) / fairValue
      : null;

  const pricePerM2 =
    prop.areaM2 > 0 ? Math.round(prop.priceCzk / prop.areaM2) : null;

  const dataCompleteness = dataCompletenessFromInput(prop);
  const loc = locationScore(prop.city);
  const liq = liquidityScore(prop.city, prop.propertyType || "Byt");
  const rental = rentalDemandScore(prop.city, prop.purpose);
  const ltv =
    prop.priceCzk > 0
      ? (prop.priceCzk - (prop.equityCzk ?? Math.round(prop.priceCzk * 0.2))) /
        prop.priceCzk
      : 0;

  const risk = compositeRiskScore({
    dscr: result.dscr,
    monthlyCashFlow: result.monthlyCashFlow,
    ltv,
    renovationNeed: prop.renovationNeed,
    dataCompleteness,
    discountPremiumPct,
  });

  const handoff = doc ? toMajetioHandoff(doc) : null;
  const affordability = handoff
    ? evaluateAffordability({
        propertyId: prop.id,
        priceCzk: prop.priceCzk,
        passport: handoff,
        country: prop.city,
      })
    : null;

  const exitScenarios = buildExitScenarios(input);
  const bullIrr =
    exitScenarios.find((e) => e.scenario === "bull")?.irrPct ?? result.irr;

  const maxCf = Math.max(...allCashFlows, 1);
  const minCf = Math.min(...allCashFlows, 0);
  const cfNorm =
    maxCf === minCf
      ? 50
      : ((result.monthlyCashFlow - minCf) / (maxCf - minCf)) * 100;

  const radar = normalizeRadar({
    cashFlow: cfNorm,
    yield: Math.min(100, (result.netYield ?? 0) * 1000),
    appreciation: bullIrr != null ? Math.min(100, bullIrr * 400) : 40,
    liquidity: liq,
    location: loc,
    lowRisk: 100 - risk,
    affordability: affordabilityScore(affordability),
  });

  return {
    id: prop.id,
    label: prop.label,
    purchasePrice: claimed(prop.priceCzk, "DATA"),
    pricePerM2: claimed(
      pricePerM2,
      pricePerM2 != null ? "DATA" : "NEOVERENO",
      pricePerM2 != null ? undefined : "Chybí plocha."
    ),
    estimatedFairValue: claimed(
      fairValue,
      "MODEL",
      `Referenční ${market.pricePerM2.toLocaleString("cs-CZ")} Kč/m² × ${prop.areaM2} m² — ne znalecký odhad.`
    ),
    discountPremiumPct: claimed(
      discountPremiumPct,
      "MODEL",
      discountPremiumPct != null
        ? "Premium (+) / sleva (−) vůči modelové fair value."
        : undefined
    ),
    grossYieldPct: claimed(
      result.grossYield,
      rentKind === "DATA" ? "DATA" : "MODEL"
    ),
    netYieldPct: claimed(result.netYield, "MODEL"),
    monthlyCashFlow: claimed(result.monthlyCashFlow, "MODEL"),
    irrPct: claimed(result.irr, "MODEL", "IRR z investment engine (base, 7 let)."),
    requiredCash: claimed(
      Math.round(result.initialEquity),
      equityKind === "DATA" ? "DATA" : "MODEL",
      "Akontace + pořizovací náklady + vybavení (engine)."
    ),
    mortgagePayment: claimed(
      result.monthlyDebtService,
      result.monthlyDebtService != null ? "MODEL" : "NEOVERENO"
    ),
    dscr: claimed(result.dscr, "MODEL"),
    liquidityScore: claimed(liq, "MODEL", "Model podle města a typu — ne dny prodeje."),
    rentalDemandScore: claimed(
      rental,
      "MODEL",
      "Orientační poptávka po nájmu — ne live obsazenost."
    ),
    locationScore: claimed(loc, "MODEL", "Syntetické skóre lokality platformy."),
    riskScore: claimed(risk, "MODEL", "Vyšší = rizikovější (DSCR, CF, LTV, data)."),
    dataCompleteness: claimed(
      dataCompleteness,
      dataCompleteness >= 80 ? "DATA" : "ODHAD",
      "Podíl vyplněných klíčových polí."
    ),
    renovationNeed: claimed(
      renovationLabel(prop.renovationNeed),
      prop.renovationNeed === "unknown" ? "NEOVERENO" : "DATA"
    ),
    exitScenarios,
    affordability,
    radar,
  };
}

const CATEGORY_META: Record<
  CompareCategoryId,
  { title: string; pick: (m: ComparePropertyMetrics) => number | null; higherIsBetter: boolean; format: (v: number) => string }
> = {
  best_cash_flow: {
    title: "Best cash flow",
    pick: (m) => m.monthlyCashFlow.value,
    higherIsBetter: true,
    format: (v) => fmtCzk(v),
  },
  best_appreciation: {
    title: "Best appreciation potential",
    pick: (m) =>
      m.exitScenarios.find((e) => e.scenario === "bull")?.irrPct ??
      m.irrPct.value,
    higherIsBetter: true,
    format: (v) => fmtPct(v),
  },
  lowest_risk: {
    title: "Lowest risk",
    pick: (m) => m.riskScore.value,
    higherIsBetter: false,
    format: (v) => `${Math.round(v)}/100`,
  },
  lowest_capital: {
    title: "Lowest required capital",
    pick: (m) => m.requiredCash.value,
    higherIsBetter: false,
    format: (v) => fmtCzk(v),
  },
  best_user_fit: {
    title: "Best fit for user",
    pick: (m) => affordabilityScore(m.affordability),
    higherIsBetter: true,
    format: (v) => `${Math.round(v)}/100`,
  },
};

function pickCategoryWinners(
  metrics: ComparePropertyMetrics[],
  hasPassport: boolean
): CategoryWinner[] {
  const out: CategoryWinner[] = [];
  for (const [category, meta] of Object.entries(CATEGORY_META) as [
    CompareCategoryId,
    (typeof CATEGORY_META)[CompareCategoryId],
  ][]) {
    if (category === "best_user_fit" && !hasPassport) continue;

    const ranked = metrics
      .map((m) => ({ m, v: meta.pick(m) }))
      .filter((x): x is { m: ComparePropertyMetrics; v: number } =>
        x.v != null && Number.isFinite(x.v)
      );
    if (ranked.length === 0) continue;

    ranked.sort((a, b) =>
      meta.higherIsBetter ? b.v - a.v : a.v - b.v
    );
    const best = ranked[0]!;
    const runner = ranked[1];

    let reason = `Nejlepší hodnota v této kategorii (${meta.format(best.v)}).`;
    if (runner) {
      reason += ` Před ${runner.m.label} (${meta.format(runner.v)}).`;
    }
    reason += " Není absolutní vítěz ve všech dimenzích.";

    out.push({
      category,
      title: meta.title,
      propertyId: best.m.id,
      propertyLabel: best.m.label,
      valueDisplay: meta.format(best.v),
      reason,
    });
  }
  return out;
}

function buildTradeoffs(metrics: ComparePropertyMetrics[]): PropertyTradeoff[] {
  return metrics.map((m) => {
    const pros: string[] = [];
    const cons: string[] = [];

    const cf = m.monthlyCashFlow.value ?? 0;
    const loc = m.locationScore.value;
    const liq = m.liquidityScore.value;
    const risk = m.riskScore.value;
    const irr = m.irrPct.value;

    if (cf >= 5_000) pros.push("vyšší měsíční cash flow");
    else if (cf < 0) cons.push("záporný cash flow (MODEL)");

    if (loc >= 82) pros.push("lepší lokalita (modelové skóre)");
    else if (loc < 72) cons.push("nižší skóre lokality");

    if (liq >= 80) pros.push("vyšší likvidita trhu");
    else if (liq < 68) cons.push("nižší likvidita");

    if (risk <= 40) pros.push("nižší modelové riziko");
    else if (risk >= 55) cons.push("vyšší modelové riziko");

    if (irr != null && irr >= 0.08) pros.push("vyšší růstový potenciál (IRR bull/base)");
    else if (irr != null && irr < 0.05) cons.push("nižší růstový potenciál");

    const prem = m.discountPremiumPct.value;
    if (prem != null && prem < -0.05) pros.push("pod modelovou fair value (sleva)");
    if (prem != null && prem > 0.1) cons.push("premium vůči modelové fair value");

    if (m.affordability?.verdict === "within_safe_budget") {
      pros.push("fit k safe rozpočtu z passportu");
    } else if (m.affordability?.verdict === "above_budget") {
      cons.push("nad modelem rozpočtu");
    }

    if (pros.length === 0) pros.push("vyvážený profil bez extrémní výhody");
    if (cons.length === 0) cons.push("žádný výrazný modelový handicap");

    return { propertyId: m.id, label: m.label, pros, cons };
  });
}

function profileFitScore(m: ComparePropertyMetrics, hasPassport: boolean): number {
  let score = 0;
  let weight = 0;
  if (hasPassport) {
    score += affordabilityScore(m.affordability) * 0.35;
    weight += 0.35;
  }
  const cf = m.monthlyCashFlow.value ?? 0;
  score += Math.min(100, Math.max(0, (cf / 15_000) * 100)) * 0.2;
  weight += 0.2;
  score += (100 - m.riskScore.value) * 0.2;
  weight += 0.2;
  score += m.liquidityScore.value * 0.15;
  weight += 0.15;
  const bull = m.exitScenarios.find((e) => e.scenario === "bull")?.irrPct ?? 0;
  score += Math.min(100, (bull ?? 0) * 400) * 0.1;
  weight += 0.1;
  return weight > 0 ? score / weight : 50;
}

function buildProfileRecommendation(
  metrics: ComparePropertyMetrics[],
  hasPassport: boolean
): ProfileRecommendation {
  const tradeoffs = buildTradeoffs(metrics);
  if (metrics.length === 0) {
    return {
      propertyId: null,
      propertyLabel: null,
      headline: "Přidejte 2–5 nemovitostí",
      explanation: "Porovnání vyžaduje alespoň dvě nemovitosti se srovnatelnými vstupy.",
      notAbsoluteBest:
        "Žádné absolutní pořadí — každá nemovitost má jiné trade-offs.",
      tradeoffs: [],
      weightsUsed: [],
    };
  }

  const ranked = [...metrics].sort(
    (a, b) => profileFitScore(b, hasPassport) - profileFitScore(a, hasPassport)
  );
  const top = ranked[0]!;
  const second = ranked[1];

  const weightsUsed = hasPassport
    ? [
        "35 % affordability (Financial Passport)",
        "20 % cash flow",
        "20 % nízké riziko",
        "15 % likvidita",
        "10 % růst (bull IRR)",
      ]
    : [
        "20 % cash flow",
        "20 % nízké riziko",
        "15 % likvidita",
        "10 % růst — bez passportu chybí váha affordability",
      ];

  let explanation = `${top.label} vychází nejlépe pro váš profil podle váženého modelu`;
  if (hasPassport && top.affordability) {
    explanation += ` (affordability: ${top.affordability.verdict.replace(/_/g, " ")})`;
  }
  explanation += ".";

  if (second) {
    const topTrade = tradeoffs.find((t) => t.propertyId === top.id);
    const secondTrade = tradeoffs.find((t) => t.propertyId === second.id);
    if (topTrade && secondTrade) {
      explanation += ` Oproti ${second.label}: ${top.label} — ${topTrade.pros.slice(0, 2).join(", ")}; ${second.label} může nabídnout ${secondTrade.pros.slice(0, 2).join(", ")}.`;
    }
  }

  return {
    propertyId: top.id,
    propertyLabel: top.label,
    headline: `Nejlepší pro váš profil: ${top.label}`,
    explanation,
    notAbsoluteBest:
      "Toto není absolutní „nejlepší nemovitost“ — v jiných kategoriích může vyhrát jiná položka (viz WINNER BY CATEGORY).",
    tradeoffs,
    weightsUsed,
  };
}

/**
 * Profesionální porovnání 2–5 nemovitostí — čísla first, radar secondary.
 */
export function buildPropertyComparison(input: {
  properties: ComparePropertyInput[];
  modelRatePercent: number;
  doc: FinancialPassportDocument | null;
}): PropertyComparisonResult {
  const props = input.properties.slice(0, MAX_PROPERTIES);
  if (props.length < MIN_PROPERTIES) {
    return {
      generatedAt: new Date().toISOString(),
      propertyCount: props.length,
      properties: [],
      categoryWinners: [],
      profileRecommendation: buildProfileRecommendation([], Boolean(input.doc)),
      methodology: [
        "Přidejte alespoň 2 nemovitosti pro smysluplné porovnání.",
      ],
    };
  }

  const preResults = props.map((p) =>
    calculateInvestment(toEngineInput(p, input.modelRatePercent).input, "base")
  );
  const allCashFlows = preResults.map((r) => r.monthlyCashFlow);

  const metrics = props.map((p) =>
    buildMetricsForProperty(
      p,
      input.modelRatePercent,
      input.doc,
      allCashFlows
    )
  );

  const hasPassport = input.doc != null;

  return {
    generatedAt: new Date().toISOString(),
    propertyCount: metrics.length,
    properties: metrics,
    categoryWinners: pickCategoryWinners(metrics, hasPassport),
    profileRecommendation: buildProfileRecommendation(metrics, hasPassport),
    methodology: [
      "Finanční metriky (yield, NOI, CF, DSCR, IRR) z investment engine — MODEL.",
      "Fair value = referenční Kč/m² lokality × plocha — ne znalecký posudek.",
      "Lokalita, likvidita a poptávka po nájmu = syntetická skóre platformy.",
      "Affordability fit jen s Financial Passport — jinak NEOVĚŘENO / vynecháno.",
      "Exit scénáře Bear / Base / Bull — stejný engine, odlišné delty.",
      "Žádné absolutní pořadí bez vysvětlení trade-offs.",
    ],
  };
}

export { fmtCzk, fmtPct, MIN_PROPERTIES, MAX_PROPERTIES };
