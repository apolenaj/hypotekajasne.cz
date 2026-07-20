/**
 * Obchodní podmínky digitální služby — placená analýza (budoucí / Premium).
 * Cena z PROPERTY_ANALYSIS_PRICING; texty = legal-readiness draft.
 */

import {
  formatAnalysisPrice,
  PROPERTY_ANALYSIS_PRICING,
} from "@/lib/property-rentgen/pricing";
import { PAID_ANALYSIS_TERMS_VERSION } from "@/lib/legal/consent-versions";
import { LAWYER_REVIEW_NOTICE } from "@/lib/legal/roles";

export type PaidAnalysisTerms = {
  version: string;
  productId: string;
  productName: string;
  priceLabel: string;
  amountCzk: number;
  currency: "CZK";
  scope: string[];
  outOfScope: string[];
  delivery: string[];
  complaint: string[];
  cancellationWithdrawal: string[];
  digitalServiceNotes: string[];
  lawyerReviewNotice: string;
};

export function getPaidAnalysisTerms(): PaidAnalysisTerms {
  const p = PROPERTY_ANALYSIS_PRICING;
  return {
    version: PAID_ANALYSIS_TERMS_VERSION,
    productId: p.productId,
    productName: p.productName,
    priceLabel: formatAnalysisPrice(p),
    amountCzk: p.amountCzk,
    currency: "CZK",
    scope: [
      ...p.includes,
      "Digitální dokument / report dodaný elektronicky.",
      "Orientační model — není závazné ocenění ani znalecký posudek.",
    ],
    outOfScope: [
      ...p.excludes,
      "Účast na jednání s bankou nebo developerem.",
      "Právní zastoupení nebo daňové poradenství.",
    ],
    delivery: [
      "Dodání elektronicky na e-mail uvedený při objednávce.",
      "Cílový termín: do 5 pracovních dnů od potvrzení platby (draft — potvrdí provozovatel).",
      "Stav služby: COMING SOON / po spuštění platební brány — do té doby nejde o závaznou nabídku koupě.",
    ],
    complaint: [
      "Reklamace vady digitálního obsahu: e-mail provozovatele do 14 dnů od dodání.",
      "Uveďte číslo objednávky / productId a popis vady.",
      "Vyřízení: oprava reportu, doplnění v scope, nebo jiné řešení dle spotřebitelských pravidel (po legal review).",
    ],
    cancellationWithdrawal: [
      "U digitálního obsahu dodaného před uplynutím lhůty odstoupení může být právo odstoupit omezeno, pokud spotřebitel výslovně souhlasil se zahájením plnění a byl poučen — text vyžaduje legal review.",
      "Do spuštění plateb: objednávka přes formulář není automaticky uzavřením smlouvy o koupi digitálního obsahu.",
      "Odvolání marketingového souhlasu ≠ reklamace placené analýzy.",
    ],
    digitalServiceNotes: [
      "Služba je digitálním obsahem / digitální službou ve smyslu spotřebitelského práva (po kvalifikaci právníkem).",
      "Hypotéka Jasně zůstává informační platformou — placená analýza není hypotečním zprostředkováním.",
      `Verze podmínek: ${PAID_ANALYSIS_TERMS_VERSION}.`,
    ],
    lawyerReviewNotice: LAWYER_REVIEW_NOTICE,
  };
}
