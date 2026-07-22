import { calculateAnnuityPayment } from "@/lib/calculators";
import {
  SCORE_DIMENSION_LABELS,
  SCORE_DIMENSION_WEIGHTS,
  SCORE_DIMENSIONS,
  type DimensionScore,
  type FinancialProfileAnswers,
  type ScoreDimensionId,
} from "@/lib/financial-passport/types";
import type { IncomeTypeId } from "@/lib/mortgage-readiness/types";
import { evaluateCzMortgageRegulation } from "@/lib/mortgage-regulation/engine";
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

function regulationPurpose(
  intent: FinancialProfileAnswers["intent"]
): "owner_occupied" | "investment" | "additional_residential" {
  if (intent === "investment") return "investment";
  return "owner_occupied";
}

function computeRegulatoryFit(
  profile: FinancialProfileAnswers,
  funds: number,
  price: number
): { score: number; explanation: string } {
  if (profile.intent === "foreign_purchase") {
    const score = profile.hasCzCollateral ? 52 : 34;
    return {
      score,
      explanation: profile.hasCzCollateral
        ? "Zahraniční koupě — český regulační rámec se na cílový trh nevztahuje; model sleduje dostupnost českého zajištění."
        : "Zahraniční koupě bez českého zajištění — regulační fit v modelu je omezený; ověřte lokální pravidla cílové země.",
    };
  }

  if (!profile.intent) {
    return {
      score: 18,
      explanation:
        "Bez zvoleného účelu financování nelze vyhodnotit regulační fit — doplňte profil.",
    };
  }

  const reg = evaluateCzMortgageRegulation({
    purpose: regulationPurpose(profile.intent),
    age: profile.age,
    numberOfOwnedResidentialProperties: null,
    investmentPurpose: profile.intent === "investment" ? true : null,
    applicantType: profile.coApplicant ? "joint" : "individual",
  });

  if (price <= 0) {
    return {
      score: 58,
      explanation: `Bez cílové ceny model používá orientační LTV rámec ${reg.maxLtv} % (${reg.appliedBucket}). ${reg.explanation}`,
    };
  }

  const loanNeeded = Math.max(0, price - funds);
  const ltv = (loanNeeded / price) * 100;
  const headroom = reg.maxLtv - ltv;
  const score = clamp(50 + headroom * 2.5);

  const explanation =
    ltv <= reg.maxLtv
      ? `Modelové LTV ${ltv.toFixed(0)} % je v rámci orientačního stropu ${reg.maxLtv} % (${reg.appliedBucket}).`
      : `Modelové LTV ${ltv.toFixed(0)} % překračuje orientační strop ${reg.maxLtv} % — doplňte vlastní kapitál nebo snižte cíl.`;

  return { score, explanation };
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

  // --- liquidity (finanční rezerva) ---
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
      ? `Modelová finanční rezerva ~${reserveMonths.toFixed(1)} měsíce nákladů.`
      : "Finanční rezerva je krátká — zvyšte cash / rezervu před větší transakcí.";

  // --- debt_load (higher score = better = lower burden) ---
  const burden = income > 0 ? liabilities / income : liabilities > 0 ? 1 : 0;
  const debtLoad = clamp((1 - Math.min(1, burden / 0.45)) * 100);
  const debtExpl =
    debtLoad >= 75
      ? "Stávající měsíční zátěž je v modelu zvládnutelná."
      : "Dluhové zatížení ukrajuje kapacitu pro novou hypotéku.";

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

  // --- affordability_stress (DSTI + cíl + sazba) ---
  const capacityRatio =
    income > 0 ? Math.min(1, maxPayment / (income * dstiCap || 1)) : 0;
  let affordStress = clamp(capacityRatio * 100);
  if (profile.targetPrice != null && high > 0) {
    const fit = (high + funds) / profile.targetPrice;
    affordStress = clamp(affordStress * 0.55 + Math.min(1.2, fit) * 45);
  }

  let rateStressPenalty = 0;
  if (maxPayment > 0) {
    const r = rate / 100 / 12;
    const n = termYears * 12;
    const loan =
      r > 0 ? maxPayment * ((1 - Math.pow(1 + r, -n)) / r) : maxPayment * n;
    const stressed = calculateAnnuityPayment(loan, rate + 2, termYears);
    const delta = stressed - maxPayment;
    if (delta > 0 && income > 0) {
      rateStressPenalty = Math.min(35, (delta / income) * 200);
    }
  }

  if (profile.noRecentDefaults === false) affordStress -= 20;
  else if (profile.noRecentDefaults === true) affordStress += 4;
  if (age > 55) affordStress -= 8;
  if (profile.intent === "foreign_purchase") {
    affordStress -= profile.hasCzCollateral ? 6 : 14;
  }
  if (profile.intent === "investment") affordStress -= 5;
  if (burden > 0.25) affordStress -= 6;

  const stressRoom =
    income > 0
      ? Math.max(0, 1 - (liabilities + maxPayment * 1.15) / income)
      : 0;
  affordStress = clamp(
    affordStress * 0.65 +
      stressRoom * 100 * 0.2 -
      rateStressPenalty * 0.15
  );

  const affordExpl =
    affordStress >= 70
      ? `Stress test: modelová splátka a +2 p.b. sazby (${rate.toFixed(1)} → ${(rate + 2).toFixed(1)} %) vypadají zvládnutelně.`
      : "Affordability stress test je napjatý — zvažte nižší cíl, vyšší příjem nebo rezervu.";

  // --- documentation_readiness ---
  let docs = 40;
  if (profile.incomeType === "employee") docs += 25;
  else if (profile.incomeType) docs += 12;
  if (profile.employmentMonths != null && profile.employmentMonths >= 12)
    docs += 12;
  if (profile.noRecentDefaults === true) docs += 10;
  if (profile.intent) docs += 8;
  if (profile.ownFunds > 0 || funds > 0) docs += 5;
  if (profile.intent === "refinance" && profile.currentBalance) docs += 5;
  if (profile.intent === "foreign_purchase" && profile.targetCountry)
    docs += 5;
  docs = clamp(docs);
  const docsExpl =
    docs >= 70
      ? "Základ dokumentace je v modelu připravený k doplnění složky."
      : "Doplňte chybějící údaje a doklady — skóre dokumentace poroste nejrychleji.";

  const regulatory = computeRegulatoryFit(profile, funds, price);

  const raw: Record<ScoreDimensionId, { score: number; explanation: string }> =
    {
      income_stability: { score: clamp(incomeStab), explanation: incomeExpl },
      liquidity: { score: liquidity, explanation: liquidityExpl },
      debt_load: { score: debtLoad, explanation: debtExpl },
      equity: { score: equity, explanation: equityExpl },
      affordability_stress: {
        score: affordStress,
        explanation: affordExpl,
      },
      documentation_readiness: { score: docs, explanation: docsExpl },
      regulatory_fit: {
        score: regulatory.score,
        explanation: regulatory.explanation,
      },
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

/** Pomocné metriky pro akční návody a what-if. */
export function profileMetrics(
  profile: FinancialProfileAnswers,
  modelRatePercent: number | null = 5
) {
  const rate =
    modelRatePercent != null && modelRatePercent > 0 ? modelRatePercent : 5;
  const income = totalIncome(profile);
  const liabilities = totalMonthlyLiabilities(profile);
  const funds = ownFundsModel(profile);
  const monthlyBurn = Math.max(liabilities + income * 0.3, 1);
  const reserveMonths = funds > 0 ? funds / monthlyBurn : 0;
  const burden = income > 0 ? liabilities / income : 0;
  const age = profile.age ?? 40;
  const termYears = Math.min(30, Math.max(5, 65 - age));
  const dstiCap =
    profile.intent === "investment" || profile.intent === "foreign_purchase"
      ? 0.35
      : 0.45;
  const maxPayment = Math.max(0, income * dstiCap - liabilities);
  const price = profile.targetPrice ?? 0;

  let rateSensitivityDelta: number | null = null;
  if (maxPayment > 0) {
    const r = rate / 100 / 12;
    const n = termYears * 12;
    const loan =
      r > 0 ? maxPayment * ((1 - Math.pow(1 + r, -n)) / r) : maxPayment * n;
    rateSensitivityDelta = Math.round(
      calculateAnnuityPayment(loan, rate + 2, termYears) - maxPayment
    );
  }

  return {
    income,
    liabilities,
    funds,
    reserveMonths,
    monthlyBurn,
    burden,
    maxPayment,
    price,
    rate,
    rateSensitivityDelta,
  };
}
