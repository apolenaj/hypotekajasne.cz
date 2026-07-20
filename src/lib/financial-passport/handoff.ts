import type {
  FinancialPassport,
} from "@/lib/majetio/types";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";

/**
 * Majetio handoff subset — v1 URL contract (bez PII, bez citlivých detailů).
 * fp_v zůstává 1 pro query kompatibilitu; dokument HJ je version 2.
 */
export function toMajetioHandoff(
  doc: FinancialPassportDocument
): FinancialPassport {
  return {
    version: 1,
    maxEstimatedBankBudget: doc.financing.estimatedMaximum,
    safePropertyBudget:
      doc.financing.conservativeMaximum != null
        ? Math.round(
            (doc.assets.totalOwnFundsModel || 0) +
              doc.financing.conservativeMaximum
          )
        : doc.assets.totalOwnFundsModel > 0
          ? doc.assets.totalOwnFundsModel
          : null,
    ownFunds: Math.round(doc.assets.totalOwnFundsModel),
    safeMonthlyPayment: doc.financing.safeMonthlyPayment,
    purpose: doc.propertyGoals.purpose,
    country: doc.identity.country,
    investmentProfile: doc.readiness.band,
    financingStatus: doc.readiness.financingStatus,
    claimNote: doc.claimNote,
  };
}
