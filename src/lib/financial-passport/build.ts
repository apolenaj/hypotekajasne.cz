import { calculateAnnuityPayment } from "@/lib/calculators";
import { calculateReadiness } from "@/lib/mortgage-readiness/score";
import {
  computeDimensionScores,
  overallFromDimensions,
} from "@/lib/financial-passport/dimensions";
import { buildNextActions } from "@/lib/financial-passport/next-actions";
import {
  ageToRange,
  fromReadinessAnswers,
  householdFromAnswers,
  incomeTypeLabel,
  purposeLabel,
  toReadinessAnswers,
} from "@/lib/financial-passport/profile";
import { rankScoreLevers } from "@/lib/financial-passport/levers";
import type {
  FinancialPassportDocument,
  FinancialProfileAnswers,
  PassportFinancing,
  PassportRisk,
} from "@/lib/financial-passport/types";
import {
  FINANCING_STATUS_LABELS,
  PASSPORT_CLAIM_NOTE,
  READINESS_BAND_LABELS,
} from "@/lib/financial-passport/types";
import type { ReadinessAnswers } from "@/lib/mortgage-readiness/types";

function totalIncome(p: FinancialProfileAnswers): number {
  return Math.max(0, p.netIncome) + Math.max(0, p.secondaryIncome);
}

function profileBand(score: number): string {
  if (score >= 80) return "high_readiness";
  if (score >= 60) return "moderate_readiness";
  if (score >= 40) return "building_readiness";
  return "early_exploration";
}

function financingStatusFromScore(
  score: number
): FinancialPassportDocument["readiness"]["financingStatus"] {
  if (score >= 75) return "ready_to_apply_prep";
  if (score >= 55) return "ready_to_explore";
  if (score >= 35) return "needs_work";
  if (score > 0) return "exploratory";
  return "unknown";
}

function stabilityLabel(score: number): string {
  if (score >= 80) return "Vysoká (model)";
  if (score >= 60) return "Střední (model)";
  if (score >= 40) return "Nižší (model)";
  return "Neověřeno / slabá";
}

function buildFinancing(
  profile: FinancialProfileAnswers,
  modelRate: number,
  readinessHigh: number | null,
  readinessLow: number | null,
  safeMonthly: number | null
): PassportFinancing {
  const estimated = readinessHigh;
  const recommended =
    readinessHigh != null ? Math.round(readinessHigh * 0.85) : null;
  const conservative = readinessLow;
  const funds =
    Math.max(0, profile.ownFunds) +
    Math.max(0, profile.investmentAssets) +
    Math.max(0, profile.existingPropertyEquity) +
    (profile.hasCzCollateral ? Math.max(0, profile.czCollateralEquity) : 0);

  let ownFundsReq: number | null = null;
  if (profile.targetPrice != null && profile.targetPrice > 0) {
    // Orientační 20 % + rezerva 5 %
    ownFundsReq = Math.round(profile.targetPrice * 0.25);
  } else if (estimated != null && estimated > 0) {
    ownFundsReq = Math.round((estimated / 0.8) * 0.25);
  }

  return {
    estimatedMaximum: estimated,
    recommendedMaximum: recommended,
    conservativeMaximum: conservative,
    safeMonthlyPayment: safeMonthly,
    ownFundsRequirement: ownFundsReq,
    modelRatePercent: modelRate,
    claimKind: "MODEL",
    disclaimer: PASSPORT_CLAIM_NOTE,
  };
}

function buildRisk(
  profile: FinancialProfileAnswers,
  modelRate: number,
  safeMonthly: number | null,
  funds: number
): PassportRisk {
  const income = totalIncome(profile);
  const liabilities =
    Math.max(0, profile.otherLiabilities) +
    Math.max(0, profile.consumerLoanPayments) +
    Math.max(0, profile.leasePayments) +
    Math.max(0, profile.mortgagePayment) +
    Math.max(0, profile.creditLimitPayments);

  const burn = Math.max(liabilities + income * 0.3, 1);
  const reserveMonths = funds > 0 ? Math.round((funds / burn) * 10) / 10 : null;
  const debtBurden = income > 0 ? Math.round((liabilities / income) * 1000) / 1000 : null;

  let rateSensitivityDelta: number | null = null;
  if (safeMonthly != null && safeMonthly > 0) {
    const age = profile.age ?? 40;
    const term = Math.min(30, Math.max(5, 65 - age));
    // Approximate loan from payment at current rate, then +2 pp
    const r = modelRate / 100 / 12;
    const n = term * 12;
    const loan =
      r > 0
        ? safeMonthly * ((1 - Math.pow(1 + r, -n)) / r)
        : safeMonthly * n;
    const stressed = calculateAnnuityPayment(loan, modelRate + 2, term);
    rateSensitivityDelta = Math.round(stressed - safeMonthly);
  }

  const primaryShare =
    income > 0 ? profile.netIncome / income : 1;
  const incomeConcentration =
    income <= 0
      ? "unknown"
      : primaryShare >= 0.9
        ? "high"
        : primaryShare >= 0.7
          ? "medium"
          : "low";

  const currencyRisk =
    profile.intent === "foreign_purchase"
      ? profile.hasCzCollateral
        ? "medium"
        : "high"
      : "n/a";

  const flags: string[] = [];
  if (profile.noRecentDefaults === false) {
    flags.push("Vámi uvedené problémy se splácením — ověřte se specialistou.");
  }
  if (debtBurden != null && debtBurden > 0.35) {
    flags.push("Vysoká modelová dluhová zátěž vůči příjmu.");
  }
  if (reserveMonths != null && reserveMonths < 3) {
    flags.push("Krátká likvidní rezerva (< 3 měsíce modelových nákladů).");
  }
  if (profile.intent === "foreign_purchase") {
    flags.push("Měnové a jurisdikční riziko u zahraniční koupě.");
  }
  if (rateSensitivityDelta != null && rateSensitivityDelta > 5_000) {
    flags.push(
      `Při +2 p.b. sazby modelová splátka stoupá o cca ${rateSensitivityDelta.toLocaleString("cs-CZ")} Kč.`
    );
  }

  return {
    liquidityReserveMonths: reserveMonths,
    debtBurdenRatio: debtBurden,
    rateSensitivityDelta,
    incomeConcentration,
    currencyRisk,
    flags,
    claimKind: "MODEL",
  };
}

/**
 * Sestaví kompletní Financial Passport Document (v2) z profilu.
 */
export function buildFinancialPassportDocument(
  profile: FinancialProfileAnswers,
  modelRatePercent: number | null = 5,
  updatedAt: string = new Date().toISOString()
): FinancialPassportDocument {
  const rate =
    modelRatePercent != null && modelRatePercent > 0 ? modelRatePercent : 5;
  const readinessAnswers = toReadinessAnswers(profile);
  const result = calculateReadiness(readinessAnswers, rate);
  const dimensions = computeDimensionScores(profile, rate);
  const overall = overallFromDimensions(dimensions);

  const income = totalIncome(profile);
  const funds =
    Math.max(0, profile.ownFunds) +
    Math.max(0, profile.investmentAssets) +
    Math.max(0, profile.existingPropertyEquity) +
    (profile.hasCzCollateral ? Math.max(0, profile.czCollateralEquity) : 0);

  const dstiCap =
    profile.intent === "investment" || profile.intent === "foreign_purchase"
      ? 0.35
      : 0.45;
  const liabilities =
    Math.max(0, profile.otherLiabilities) +
    Math.max(0, profile.consumerLoanPayments) +
    Math.max(0, profile.leasePayments) +
    Math.max(0, profile.mortgagePayment) +
    Math.max(0, profile.creditLimitPayments);
  const safeMonthly =
    income > 0
      ? Math.max(0, Math.round(income * dstiCap - liabilities))
      : null;

  const incomeStabDim = dimensions.find((d) => d.id === "income_stability");
  const band = profileBand(overall);
  const financingStatus = financingStatusFromScore(overall);

  const goals: string[] = [];
  if (profile.intent) goals.push(purposeLabel(profile.intent));
  if (profile.targetCountry) goals.push(`Cíl: ${profile.targetCountry}`);
  if (profile.targetPrice)
    goals.push(
      `Cílová cena ~${profile.targetPrice.toLocaleString("cs-CZ")} Kč`
    );

  const residency =
    profile.residency !== "unknown"
      ? profile.residency
      : profile.intent === "foreign_purchase"
        ? "cz_resident"
        : profile.intent
          ? "cz_resident"
          : "unknown";

  const country =
    profile.intent === "foreign_purchase"
      ? profile.targetCountry
      : profile.intent
        ? "Česká republika"
        : null;

  const doc: FinancialPassportDocument = {
    version: 2,
    updatedAt,
    identity: {
      householdType: householdFromAnswers(profile),
      ageRange: ageToRange(profile.age),
      age: profile.age,
      residency,
      country,
      goals,
      coApplicant: profile.coApplicant,
      dependents: profile.dependents,
    },
    income: {
      primaryType: incomeTypeLabel(profile.incomeType),
      netIncome: Math.max(0, profile.netIncome),
      secondaryIncome: Math.max(0, profile.secondaryIncome),
      totalNetIncome: income,
      stabilityLabel: stabilityLabel(incomeStabDim?.score ?? 0),
      stabilityScore: incomeStabDim?.score ?? 0,
      employmentMonths: profile.employmentMonths,
      claimKind: "DATA",
    },
    liabilities: {
      mortgagePayment: Math.max(0, profile.mortgagePayment),
      consumerLoans: Math.max(0, profile.consumerLoanPayments),
      creditCardLimits: Math.max(0, profile.creditLimitPayments),
      leases: Math.max(0, profile.leasePayments),
      other: Math.max(0, profile.otherLiabilities),
      totalMonthly: liabilities,
      claimKind: "DATA",
    },
    assets: {
      cash: Math.max(0, profile.ownFunds),
      investments: Math.max(0, profile.investmentAssets),
      existingPropertyEquity: Math.max(0, profile.existingPropertyEquity),
      availableCollateral: profile.hasCzCollateral
        ? Math.max(0, profile.czCollateralEquity)
        : 0,
      totalLiquidish:
        Math.max(0, profile.ownFunds) + Math.max(0, profile.investmentAssets),
      totalOwnFundsModel: funds,
      claimKind: "DATA",
    },
    propertyGoals: {
      purpose: profile.intent ?? "unknown",
      purposeLabel: purposeLabel(profile.intent),
      targetPrice: profile.targetPrice,
      targetCountry: profile.targetCountry,
    },
    financing: buildFinancing(
      profile,
      rate,
      result.financingRange?.high ?? null,
      result.financingRange?.low ?? null,
      safeMonthly && safeMonthly > 0 ? safeMonthly : null
    ),
    risk: buildRisk(
      profile,
      rate,
      safeMonthly && safeMonthly > 0 ? safeMonthly : null,
      funds
    ),
    readiness: {
      overall,
      dimensions,
      band,
      bandLabel: READINESS_BAND_LABELS[band] ?? band,
      financingStatus,
      financingStatusLabel: FINANCING_STATUS_LABELS[financingStatus],
      topLevers: [],
      nextActions: buildNextActions(profile, rate, overall),
      claimKind: "MODEL",
    },
    strengths: result.strengths,
    obstacles: result.obstacles,
    improvements: result.improvements,
    claimNote: PASSPORT_CLAIM_NOTE,
  };

  doc.readiness.topLevers = rankScoreLevers(profile, rate, overall);

  return doc;
}

export function buildDocumentFromReadiness(
  answers: ReadinessAnswers,
  modelRatePercent: number | null = 5,
  updatedAt?: string
): FinancialPassportDocument {
  return buildFinancialPassportDocument(
    fromReadinessAnswers(answers),
    modelRatePercent,
    updatedAt ?? new Date().toISOString()
  );
}
