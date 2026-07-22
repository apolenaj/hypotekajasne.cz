/**
 * Sdílené claimy — ČNB a obecná disclaimery (jedno místo pravdy).
 * Regulatorní / daňové / katastrální fakty: FactClaim katalog (PROMPT 3).
 */

import { makeClaim } from "@/lib/country-dossier/types";
import { requireFactClaim } from "@/lib/sources/fact-claims";
import { factClaimToLegalClaim } from "@/lib/sources/fact-claims-display";

import { editorialLegalSourcesReviewText } from "@/lib/trust/number-pipeline";

export const LEGAL_REVIEW_AS_OF = "2026-07-01";

/** Redakční kontrola právních zdrojů (bez evidovaného právního experta). */
export function dossierEditorialLegalReviewText(scope: string): string {
  return editorialLegalSourcesReviewText(scope, LEGAL_REVIEW_AS_OF);
}
export const CNB_OWNER_OCCUPIED_CLAIM = (() => {
  const ltv = requireFactClaim("cz.cnb.ltv.owner_standard");
  const young = requireFactClaim("cz.cnb.ltv.owner_young");
  const dti = requireFactClaim("cz.cnb.dti_dsti.owner_deactivated");
  return factClaimToLegalClaim({
    ...ltv,
    id: "cz.cnb.owner_occupied.summary",
    claim: `${ltv.claim} ${young.claim} ${dti.claim}`,
    value: `LTV ${ltv.value}/${young.value} %`,
    notes: dti.notes,
  });
})();

export const CNB_INVESTMENT_CLAIM = (() => {
  const ltv = requireFactClaim("cz.cnb.ltv.investment");
  const dti = requireFactClaim("cz.cnb.dti.investment");
  return factClaimToLegalClaim({
    ...ltv,
    id: "cz.cnb.investment.summary",
    claim: `${ltv.claim} ${dti.claim}`,
    value: `LTV ${ltv.value} % / DTI ${dti.value}`,
    notes: ltv.notes,
  });
})();

export const NOT_LEGAL_ADVICE = makeClaim(
  "Obsah je orientační přehled, nikoli individuální právní, daňová ani investiční rada.",
  {
    source: "HypotekaJasne.cz — redakční upozornění",
    asOf: LEGAL_REVIEW_AS_OF,
    status: "MODEL",
  }
);

export const TITLE_TRANSFER_CZ_CLAIM = factClaimToLegalClaim(
  requireFactClaim("cz.cadastre.title_transfer")
);

export const CZ_ACQUISITION_TAX_CLAIM = factClaimToLegalClaim(
  requireFactClaim("cz.tax.acquisition.abolished_2020")
);

export const CZ_CADASTRE_VKLAD_FEE_CLAIM = factClaimToLegalClaim(
  requireFactClaim("cz.cadastre.vklad_fee")
);

export const CZ_PROPERTY_TAX_CLAIM = factClaimToLegalClaim(
  requireFactClaim("cz.tax.property_annual")
);

export const CZ_LEGAL_ESCROW_COST_CLAIM = factClaimToLegalClaim(
  requireFactClaim("cz.fees.legal_escrow_band")
);
