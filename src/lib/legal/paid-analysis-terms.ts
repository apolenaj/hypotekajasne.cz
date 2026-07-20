/**
 * Obchodní podmínky digitální služby — placená analýza.
 * Do spuštění platební brány a doplnění provozovatele nejde o nabídku koupě.
 * Nevymýšlíme právní detaily odstoupení / reklamace — ty doplní právník.
 */

import {
  formatAnalysisPrice,
  PROPERTY_ANALYSIS_PRICING,
} from "@/lib/property-rentgen/pricing";
import { PAID_ANALYSIS_TERMS_VERSION } from "@/lib/legal/consent-versions";
import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal/operator";

export type PaidAnalysisTerms = {
  version: string;
  productId: string;
  productName: string;
  priceLabel: string;
  amountCzk: number;
  currency: "CZK";
  commerciallyAvailable: boolean;
  scope: string[];
  outOfScope: string[];
  delivery: string[];
  complaint: string[];
  cancellationWithdrawal: string[];
  digitalServiceNotes: string[];
};

export function getPaidAnalysisTerms(): PaidAnalysisTerms {
  const p = PROPERTY_ANALYSIS_PRICING;
  const commerciallyAvailable = isPaidAnalysisCommerciallyAvailable();
  return {
    version: PAID_ANALYSIS_TERMS_VERSION,
    productId: p.productId,
    productName: p.productName,
    priceLabel: formatAnalysisPrice(p),
    amountCzk: p.amountCzk,
    currency: "CZK",
    commerciallyAvailable,
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
    delivery: commerciallyAvailable
      ? [
          "Dodání elektronicky na e-mail uvedený při objednávce.",
          "Cílový termín dodání upřesníme při spuštění plateb.",
        ]
      : [
          "Služba zatím není spuštěná ke koupi.",
          "Formulář zájmu není objednávkou ani uzavřením smlouvy.",
        ],
    complaint: commerciallyAvailable
      ? [
          "Reklamace vady digitálního obsahu: e-mail provozovatele do 14 dnů od dodání.",
          "Uveďte číslo objednávky a popis vady.",
        ]
      : [
          "Dokud služba není spuštěná, reklamace kupní smlouvy nevzniká — jde jen o evidenci zájmu.",
        ],
    cancellationWithdrawal: commerciallyAvailable
      ? [
          "Pravidla odstoupení u digitálního obsahu upřesníme před spuštěním platební brány.",
        ]
      : [
          "Do spuštění plateb nevzniká smlouva o koupi digitálního obsahu.",
        ],
    digitalServiceNotes: [
      "Hypotéka Jasně zůstává informační platformou — placená analýza není hypotečním zprostředkováním.",
      commerciallyAvailable
        ? `Verze podmínek: ${PAID_ANALYSIS_TERMS_VERSION}.`
        : "Připravujeme — podrobné spotřebitelské podmínky zveřejníme před spuštěním prodeje.",
    ],
  };
}
