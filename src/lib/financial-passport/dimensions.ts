import type { IncomeTypeId } from "@/lib/mortgage-readiness/types";
import {
  SCORE_DIMENSION_LABELS,
  SCORE_DIMENSION_WEIGHTS,
  SCORE_DIMENSIONS,
  type DimensionScore,
  type FinancialProfileAnswers,
  type ScoreDimensionId,
} from "@/lib/financial-passport/types";
import { maxLoanFromPayment } from "@/lib/mortgage-readiness/score";

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function incomeStabilityRaw(type: IncomeTypeId | null): number {
  switch (type) {
    case "employee":
      return 92;
    case "osvc_evidence":
      return 72;
    case "osvc_pausal":
      return 62;
    case "sro":
      return 58;
    case "rental":
      return 52;
    case "other":
      return 40;
    default:
      return 15;
  }
}

function totalMonthlyLiabilities(p: FinancialProfileAnswers): number {
  return (
    Math.max(0, p.otherLiabilities) +
    Math.max(0, p.consumerLoanPayments) +
    Math.max(0, p.leasePayments) +
    Math.max(0, p.mortgagePayment) +
    Math.max(0, p.creditLimitPayments)
  );
}

function totalIncome(p: FinancialProfileAnswers): number {
  return Math.max(0, p.netIncome) + Math.max(0, p.secondaryIncome);
}

function ownFundsModel(p: FinancialProfileAnswers): number {
  return (
    Math.max(0, p.ownFunds) +
    Math.max(0, p.investmentAssets) +
    Math.max(0, p.existingPropertyEquity) +
    (p.hasCzCollateral ? Math.max(0, p.czCollateralEquity) : 0)
  );
}

/**
 * Dimenzionální skóre 0–100 per osa — žádné „černé číslo“ bez vysvětlení.
 */
export function computeDimensionScores(
  profile: FinancialProfileAnswers,
  modelRatePercent: number | null = 5
): DimensionScore[] {
  const rate =
    modelRatePercent != null && modelRatePercent > 0 ? modelRatePercent : 5;
  const age = profile.age ?? 40;
  const termYears = Math.min(30, Math.max(5, 65 - age));
  const income = totalIncome(profile);
  const liabilities = totalMonthlyLiabilities(profile);
  const funds = ownFundsModel(profile);

  const dstiCap =
    profile.intent === "investment" || profile.intent === "foreign_purchase"
      ? 0.35
      : 0.45;
  const maxPayment = Math.max(0, income * dstiCap - liabilities);
  const maxByIncome = Math.round(
    maxLoanFromPayment(maxPayment, rate, termYears)
  );
  const maxByEquity = Math.round(funds * 4);
  const high = Math.max(0, Math.min(maxByIncome, maxByEquity || maxByIncome));

  // --- income_stability ---
  let incomeStab = incomeStabilityRaw(profile.incomeType);
  if (profile.employmentMonths != null && profile.employmentMonths >= 24) {
    incomeStab = Math.min(100, incomeStab + 6);
  } else if (
    profile.employmentMonths != null &&
    profile.employmentMonths >= 12
  ) {
    incomeStab = Math.min(100, incomeStab + 3);
  }
  if (profile.secondaryIncome > 0 && income > 0) {
    const conc = profile.netIncome / income;
    if (conc < 0.7) incomeStab = Math.min(100, incomeStab + 4);
  }
  const incomeExpl =
    incomeStab >= 80
      ? "Typ příjmu a historie působí v modelu jako relativně stabilní."
      : incomeStab >= 55
        ? "Příjem je použitelný, ale dokumentace / historie může být náročnější."
        : "Stabilita příjmu je slabší stránka modelu — připravte delší historii.";

  // --- liquidity ---
  const monthlyBurn = Math.max(liabilities + income * 0.3, 1);
  const reserveMonths = funds > 0 ? funds / monthlyBurn : 0;
  const liquidity = clamp(
    reserveMonths >= 12
      ? 95
      : reserveMonths >= 6
        ? 78
        : reserveMonths >= 3
          ? 58
          : reserveMonths >= 1
            ? 38
            : funds > 0
              ? 22
              : 8
  );
  const liquidityExpl =
    reserveMonths >= 6
      ? `Modelová likvidní rezerva ~${reserveMonths.toFixed(1)} měsíce nákladů.`
      : "Likvidní rezerva je krátká — zvyšte cash / rezervu před větší transakcí.";

  // --- debt_load (higher score = better = lower burden) ---
  const burden = income > 0 ? liabilities / income : liabilities > 0 ? 1 : 0;
  const debtLoad = clamp((1 - Math.min(1, burden / 0.45)) * 100);
  const debtExpl =
    debtLoad >= 75
      ? "Stávající měsíční zátěž je v modelu zvládnutelná."
      : "Dluhová zátěž ukrajuje kapacitu pro novou hypotéku.";

  // --- equity ---
  const price =
    profile.targetPrice ?? (high > 0 ? Math.round(high / 0.8) : 0);
  const loanNeeded = price > 0 ? Math.max(0, price - funds) : 0;
  const ltv = price > 0 ? loanNeeded / price : 0.8;
  const equity = clamp(
    price > 0
      ? (1 - Math.min(1, Math.max(0, ltv - 0.5) / 0.4)) * 100
      : funds >= 1_000_000
        ? 82
        : funds >= 500_000
          ? 68
          : funds >= 200_000
            ? 48
            : funds > 0
              ? 28
              : 5
  );
  const equityExpl =
    equity >= 70
      ? "Vlastní kapitál / zajištění podporuje nižší modelové LTV."
      : "Doplňte akontaci nebo dozajištění — LTV rámec je napjatý.";

  // --- affordability ---
  const capacityRatio =
    income > 0 ? Math.min(1, maxPayment / (income * dstiCap || 1)) : 0;
  let affordability = clamp(capacityRatio * 100);
  if (profile.targetPrice != null && high > 0) {
    const fit = (high + funds) / profile.targetPrice;
    affordability = clamp(affordability * 0.55 + Math.min(1.2, fit) * 45);
  }
  const affordExpl =
    affordability >= 70
      ? "Modelová dostupnost vůči příjmu a cíli vypadá relativně komfortně."
      : "Cílová cena / kapacita splátky je napjatá — zvažte levnější cíl nebo vyšší příjem.";

  // --- resilience (rate + defaults + foreign FX) ---
  let resilience = 70;
  if (profile.noRecentDefaults === false) resilience -= 35;
  else if (profile.noRecentDefaults === true) resilience += 8;
  if (age > 55) resilience -= 10;
  if (profile.intent === "foreign_purchase") {
    resilience -= profile.hasCzCollateral ? 8 : 22;
  }
  if (profile.intent === "investment") resilience -= 6;
  if (burden > 0.25) resilience -= 8;
  // rate sensitivity proxy: payment jump capacity
  const stressRoom =
    income > 0 ? Math.max(0, 1 - (liabilities + maxPayment * 1.15) / income) : 0;
  resilience = clamp(resilience * 0.7 + stressRoom * 100 * 0.3);
  const resilienceExpl =
    resilience >= 70
      ? "Model naznačuje slušný polštář vůči výkyvům sazby / výpadku."
      : "Odolnost je slabší — stress test sazby a rezervy stojí za pozornost.";

  // --- documentation_readiness ---
  let docs = 40;
  if (profile.incomeType === "employee") docs += 25;
  else if (profile.incomeType) docs += 12;
  if (profile.employmentMonths != null && profile.employmentMonths >= 12)
    docs += 12;
  if (profile.noRecentDefaults === true) docs += 10;
  if (profile.intent) docs += 8;
  if (profile.ownFunds > 0 || funds > 0) docs += 5;
  if (profile.intent === "refinance" && profile.currentBalance)
    docs += 5;
  if (profile.intent === "foreign_purchase" && profile.targetCountry)
    docs += 5;
  docs = clamp(docs);
  const docsExpl =
    docs >= 70
      ? "Základ dokumentace je v modelu připravený k doplnění složky."
      : "Doplňte chybějící údaje a doklady — skóre dokumentace poroste nejrychleji.";

  const raw: Record<ScoreDimensionId, { score: number; explanation: string }> =
    {
      income_stability: { score: clamp(incomeStab), explanation: incomeExpl },
      liquidity: { score: liquidity, explanation: liquidityExpl },
      debt_load: { score: debtLoad, explanation: debtExpl },
      equity: { score: equity, explanation: equityExpl },
      affordability: { score: affordability, explanation: affordExpl },
      resilience: { score: resilience, explanation: resilienceExpl },
      documentation_readiness: { score: docs, explanation: docsExpl },
    };

  return SCORE_DIMENSIONS.map((id) => {
    const weight = SCORE_DIMENSION_WEIGHTS[id];
    const score = raw[id].score;
    return {
      id,
      label: SCORE_DIMENSION_LABELS[id],
      score,
      weight,
      weighted: Math.round(score * weight * 10) / 10,
      explanation: raw[id].explanation,
      claimKind: "MODEL" as const,
    };
  });
}

export function overallFromDimensions(dimensions: DimensionScore[]): number {
  const sum = dimensions.reduce((acc, d) => acc + d.score * d.weight, 0);
  return clamp(sum);
}
