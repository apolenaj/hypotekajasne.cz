/**
 * Odhad versus kupní cena — kompaktní model potřeby vlastních peněz.
 * LTV strop ≠ schválená hypotéka. Vyšší odhad nevytváří nárok na hotovost navíc.
 */

import { roundMoney } from "@/lib/finance-math/core";

export type AppraisalVsPriceInput = {
  purchasePriceCzk: number;
  /** Bankou uznatelná / odhadní hodnota hlavní nemovitosti. */
  bankRecognizedValueCzk: number;
  ownCashCzk: number;
  sideCostsCzk: number;
  /** Modelový LTV limit 0–1 (např. 0.8). */
  modelLtvLimit: number;
  /**
   * Volitelná další zástava — model předpokládá nezatíženou,
   * bankou akceptovanou nemovitost.
   */
  additionalCollateralValueCzk: number;
  additionalCollateralUnencumberedAccepted: boolean;
};

export type AppraisalVsPriceResult = {
  financingNeedCzk: number;
  ltvCapCzk: number;
  ownFundsNeededCzk: number;
  missingCapitalCzk: number;
  gapFromLowerAppraisalCzk: number;
  effectiveCollateralBaseCzk: number;
  assumptions: string[];
  warnings: string[];
};

export function calculateAppraisalVsPrice(
  input: AppraisalVsPriceInput
): AppraisalVsPriceResult {
  const purchase = Math.max(0, input.purchasePriceCzk);
  const appraisal = Math.max(0, input.bankRecognizedValueCzk);
  const cash = Math.max(0, input.ownCashCzk);
  const side = Math.max(0, input.sideCostsCzk);
  const ltv = Math.min(1, Math.max(0, input.modelLtvLimit));
  const extra =
    input.additionalCollateralUnencumberedAccepted &&
    input.additionalCollateralValueCzk > 0
      ? Math.max(0, input.additionalCollateralValueCzk)
      : 0;

  const assumptions = [
    "LTV strop je modelový limit podle zadaného procenta — nejde o schválenou hypotéku.",
    "Vyšší odhad než kupní cena nezakládá automatický nárok na výplatu hotovosti nad schválený účel.",
    "Potřeba financování = max(0, kupní cena − vlastní hotovost) + vedlejší náklady (zjednodušený model).",
  ];
  const warnings: string[] = [];

  if (
    input.additionalCollateralValueCzk > 0 &&
    !input.additionalCollateralUnencumberedAccepted
  ) {
    warnings.push(
      "Další zástava není zahrnuta: u již zatížené zástavy nelze sčítat hodnoty bez dalšího posouzení banky."
    );
  }
  if (extra > 0) {
    assumptions.push(
      "Další zástava je modelována jako nezatížená a bankou akceptovaná — ověřte skutečný stav."
    );
  }

  const financingNeedCzk = roundMoney(
    Math.max(0, purchase - cash) + side
  );
  const effectiveCollateralBaseCzk = roundMoney(appraisal + extra);
  const ltvCapCzk = roundMoney(effectiveCollateralBaseCzk * ltv);

  // Own funds needed to close: purchase + side − max loanable under LTV on recognized value.
  // Cap loan by financing need and by LTV cap.
  const maxLoan = Math.min(financingNeedCzk, ltvCapCzk);
  const ownFundsNeededCzk = roundMoney(
    Math.max(0, purchase + side - maxLoan)
  );
  const missingCapitalCzk = roundMoney(Math.max(0, ownFundsNeededCzk - cash));

  // Impact of lower appraisal vs purchase as collateral base.
  const ltvCapIfPurchase = roundMoney(purchase * ltv);
  const ltvCapOnAppraisalOnly = roundMoney(appraisal * ltv);
  const gapFromLowerAppraisalCzk = roundMoney(
    Math.max(0, Math.min(purchase, ltvCapIfPurchase) - ltvCapOnAppraisalOnly)
  );

  if (appraisal < purchase) {
    warnings.push(
      "Odhad je nižší než kupní cena — rozdíl typicky doplácíte z vlastních zdrojů (ověřte u banky)."
    );
  }
  if (appraisal > purchase) {
    warnings.push(
      "Odhad vyšší než kupní cena nezvyšuje automaticky dostupnou hotovost nad účel úvěru."
    );
  }

  return {
    financingNeedCzk,
    ltvCapCzk,
    ownFundsNeededCzk,
    missingCapitalCzk,
    gapFromLowerAppraisalCzk,
    effectiveCollateralBaseCzk,
    assumptions,
    warnings,
  };
}
