import { calculateAnnuityPayment } from "@/lib/calculators";
import type { CurrentRates } from "@/lib/rates";
import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import type {
  MarketRateReference,
  PaymentScenario,
  RefinanceLoanProfile,
  StayVsRefinanceComparison,
} from "@/lib/refinance-radar/types";

export function monthsUntilFixation(
  fixationEnd: string,
  now: Date = new Date()
): number | null {
  const t = Date.parse(fixationEnd);
  if (!Number.isFinite(t)) return null;
  const diff = t - now.getTime();
  return Math.max(0, Math.ceil(diff / (30.44 * 86_400_000)));
}

export function buildMarketReference(rates: CurrentRates | null): MarketRateReference {
  const rate =
    rates?.rateWithInsurance ?? rates?.rateWithoutInsurance ?? null;
  if (rate == null || rates == null) {
    return {
      ratePercent: null,
      label: "Tržní reference nedostupná",
      claimKind: "NEOVERENO",
      note: "Bez dat z bank_rates nezobrazujeme orientační sazbu.",
      updatedAt: rates?.updatedAt ?? null,
    };
  }
  return {
    ratePercent: rate,
    label: rates.withoutInsuranceOrientational
      ? "Orientační tržní reference (nejnižší sazba s pojištěním v DB)"
      : "Referenční sazba z bank_rates",
    claimKind: rates.withoutInsuranceOrientational ? "ODHAD" : "DATA",
    note: "MODEL pro scénáře — ne individuální nabídka banky.",
    updatedAt: rates.updatedAt,
  };
}

export function buildPaymentScenarios(
  profile: RefinanceLoanProfile,
  market: MarketRateReference
): PaymentScenario[] {
  const balance = profile.loanBalanceCzk;
  const term = profile.newTermYears;
  const scenarios: PaymentScenario[] = [];

  if (balance > 0 && profile.ratePercent > 0) {
    scenarios.push({
      id: "current",
      label: "Současná sazba",
      ratePercent: profile.ratePercent,
      monthlyPaymentCzk: Math.round(
        calculateAnnuityPayment(balance, profile.ratePercent, term)
      ),
      claimKind: "DATA",
    });
  }

  if (market.ratePercent != null && balance > 0) {
    scenarios.push({
      id: "market",
      label: "Orientační tržní reference",
      ratePercent: market.ratePercent,
      monthlyPaymentCzk: Math.round(
        calculateAnnuityPayment(balance, market.ratePercent, term)
      ),
      claimKind: market.claimKind,
    });
    scenarios.push({
      id: "market_plus_1",
      label: "Tržní +1 p.b. (buffer)",
      ratePercent: market.ratePercent + 1,
      monthlyPaymentCzk: Math.round(
        calculateAnnuityPayment(balance, market.ratePercent + 1, term)
      ),
      claimKind: "MODEL",
    });
    scenarios.push({
      id: "market_minus_1",
      label: "Tržní −1 p.b. (optimistický MODEL)",
      ratePercent: Math.max(0.1, market.ratePercent - 1),
      monthlyPaymentCzk: Math.round(
        calculateAnnuityPayment(
          balance,
          Math.max(0.1, market.ratePercent - 1),
          term
        )
      ),
      claimKind: "MODEL",
    });
  }

  return scenarios;
}

export function totalInterestRemaining(
  balance: number,
  annualRatePercent: number,
  remainingMonths: number
): number {
  if (balance <= 0 || remainingMonths <= 0) return 0;
  const years = remainingMonths / 12;
  const payment = calculateAnnuityPayment(balance, annualRatePercent, years);
  return Math.max(0, payment * remainingMonths - balance);
}

export function compareStayVsRefinance(input: {
  profile: RefinanceLoanProfile;
  marketRatePercent: number | null;
  now?: Date;
}): StayVsRefinanceComparison {
  const { profile } = input;
  const now = input.now ?? new Date();
  const monthsToFix = monthsUntilFixation(profile.fixationEnd, now);
  const remainingMonths = Math.max(1, Math.round(profile.remainingTermYears * 12));
  const marketRate = input.marketRatePercent ?? profile.ratePercent;

  const stayPayment = profile.monthlyPaymentCzk;
  const refinancePayment = Math.round(
    calculateAnnuityPayment(
      profile.loanBalanceCzk,
      marketRate,
      profile.newTermYears
    )
  );

  const insuranceDelta = profile.insuranceMonthlyDeltaCzk;
  const refinancePaymentAllIn = refinancePayment + insuranceDelta;

  const monthsUntilFix = monthsToFix ?? 0;
  const stayInterestUntilFix = totalInterestRemaining(
    profile.loanBalanceCzk,
    profile.ratePercent,
    Math.min(remainingMonths, monthsUntilFix || remainingMonths)
  );

  const stayInterestAfterFix =
    monthsUntilFix > 0 && monthsUntilFix < remainingMonths
      ? totalInterestRemaining(
          profile.loanBalanceCzk * 0.98,
          marketRate,
          remainingMonths - monthsUntilFix
        )
      : 0;
  const stayTotalInterest = Math.round(stayInterestUntilFix + stayInterestAfterFix);

  const refinanceTotalInterest = Math.round(
    totalInterestRemaining(
      profile.loanBalanceCzk,
      marketRate,
      profile.newTermYears * 12
    )
  );

  const penalty =
    monthsUntilFix > 0 && profile.earlyRepaymentPenaltyCzk != null
      ? profile.earlyRepaymentPenaltyCzk
      : 0;
  const upfrontCosts = profile.refinancingFeesCzk + penalty;

  const stayTotalCost = Math.round(
    stayPayment * remainingMonths + stayTotalInterest
  );
  const refinanceTotalCost = Math.round(
    refinancePaymentAllIn * profile.newTermYears * 12 +
      refinanceTotalInterest +
      upfrontCosts
  );

  const monthlySaving = stayPayment - refinancePaymentAllIn;
  const breakEven =
    monthlySaving > 100
      ? Math.ceil(upfrontCosts / monthlySaving)
      : null;

  const rows = [
    {
      dimension: "Měsíční splátka",
      stay: `${stayPayment.toLocaleString("cs-CZ")} Kč`,
      refinance: `${refinancePaymentAllIn.toLocaleString("cs-CZ")} Kč (vč. pojištění Δ)`,
      claimKind: "MODEL" as const,
    },
    {
      dimension: "Zbývající fixace",
      stay:
        monthsUntilFix != null
          ? `${monthsUntilFix} měsíců (do ${profile.fixationEnd})`
          : "Neuvedeno",
      refinance:
        monthsUntilFix > 0
          ? `Předčasné ukončení — penalizace ${penalty.toLocaleString("cs-CZ")} Kč`
          : "Po fixaci — bez penalizace (MODEL)",
      claimKind: "MODEL" as const,
    },
    {
      dimension: "Poplatky refinancování",
      stay: "0 Kč (zůstat u banky)",
      refinance: `${profile.refinancingFeesCzk.toLocaleString("cs-CZ")} Kč`,
      claimKind: "ODHAD" as const,
    },
    {
      dimension: "Nová doba splácení",
      stay: `${profile.remainingTermYears} let (současná smlouva)`,
      refinance: `${profile.newTermYears} let`,
      claimKind: "DATA" as const,
    },
    {
      dimension: "Pojištění",
      stay: profile.hasInsuranceBundle ? "V balíku stávající banky" : "Mimo balíček",
      refinance: `Δ ${insuranceDelta >= 0 ? "+" : ""}${insuranceDelta.toLocaleString("cs-CZ")} Kč/měs.`,
      claimKind: "ODHAD" as const,
    },
    {
      dimension: "Celkový úrok (MODEL)",
      stay: `${stayTotalInterest.toLocaleString("cs-CZ")} Kč`,
      refinance: `${refinanceTotalInterest.toLocaleString("cs-CZ")} Kč`,
      claimKind: "MODEL" as const,
    },
    {
      dimension: "Celkové náklady (MODEL)",
      stay: `${stayTotalCost.toLocaleString("cs-CZ")} Kč`,
      refinance: `${refinanceTotalCost.toLocaleString("cs-CZ")} Kč`,
      claimKind: "MODEL" as const,
    },
  ];

  let summary =
    "Orientační porovnání — nezohledňuje bonitu, LTV ani individuální podmínky banky.";
  if (breakEven != null && monthlySaving > 0) {
    summary += ` Bod zvratu po poplatcích: cca ${breakEven} měsíců při úspoře ${Math.round(monthlySaving).toLocaleString("cs-CZ")} Kč/měs.`;
  }

  return {
    stayTotalInterestCzk: stayTotalInterest,
    refinanceTotalInterestCzk: refinanceTotalInterest,
    stayTotalCostCzk: stayTotalCost,
    refinanceTotalCostCzk: refinanceTotalCost,
    upfrontRefinanceCostsCzk: upfrontCosts,
    monthlyPaymentStayCzk: stayPayment,
    monthlyPaymentRefinanceCzk: refinancePaymentAllIn,
    breakEvenMonths: breakEven,
    potentialMonthlySavingCzk:
      monthlySaving > 0 ? Math.round(monthlySaving) : null,
    rows,
    summary,
    claimKind: "MODEL",
  };
}

export function importFromFinancialProfile(
  profile: FinancialProfileAnswers
): Partial<RefinanceLoanProfile> {
  const out: Partial<RefinanceLoanProfile> = {};
  if (profile.currentBalance != null && profile.currentBalance > 0) {
    out.loanBalanceCzk = profile.currentBalance;
  }
  if (profile.currentRate != null) {
    out.ratePercent = profile.currentRate;
  }
  if (profile.mortgagePayment != null && profile.mortgagePayment > 0) {
    out.monthlyPaymentCzk = profile.mortgagePayment;
  }
  if (profile.yearsLeft != null && profile.yearsLeft > 0) {
    out.remainingTermYears = Math.min(30, Math.round(profile.yearsLeft));
  }
  if (profile.intent === "refinance") {
    out.label = "Hypotéka z Finančního pasu";
  }
  return out;
}
