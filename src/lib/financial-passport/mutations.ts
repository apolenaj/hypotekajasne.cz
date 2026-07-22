import type {
  FinancialProfileAnswers,
  SimulationId,
} from "@/lib/financial-passport/types";

/**
 * Aplikuje simulaci na profil (immutable). Bez závislosti na build.
 */
export function applySimulation(
  profile: FinancialProfileAnswers,
  id: SimulationId,
  amount = 0
): FinancialProfileAnswers {
  const next: FinancialProfileAnswers = { ...profile };

  switch (id) {
    case "pay_off_loan":
      next.consumerLoanPayments = 0;
      next.leasePayments = 0;
      next.otherLiabilities = 0;
      break;
    case "increase_equity":
      next.ownFunds =
        Math.max(0, profile.ownFunds) + Math.max(0, amount || 300_000);
      break;
    case "increase_income":
      next.netIncome =
        Math.max(0, profile.netIncome) + Math.max(0, amount || 5_000);
      break;
    case "cut_credit_limit": {
      const cut = Math.max(0, amount || profile.creditLimitPayments);
      next.creditLimitPayments = Math.max(
        0,
        profile.creditLimitPayments - cut
      );
      break;
    }
    case "cheaper_property": {
      if (profile.targetPrice != null && profile.targetPrice > 0) {
        const cut = Math.max(0, amount || 500_000);
        next.targetPrice = Math.max(500_000, profile.targetPrice - cut);
      }
      break;
    }
    case "change_rate":
      // Rate is applied at build time, not on profile
      break;
  }

  return next;
}
