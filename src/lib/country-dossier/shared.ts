/**
 * Sdílené claimy — ČNB a obecná disclaimery (jedno místo pravdy).
 */

import { CNB_LIMITS } from "@/lib/cnb-limits";
import { makeClaim } from "@/lib/country-dossier/types";

export const LEGAL_REVIEW_AS_OF = "2026-07-01";

export const CNB_OWNER_OCCUPIED_CLAIM = makeClaim(CNB_LIMITS.ownerOccupied.note, {
  source: "ČNB — makroobezřetnostní doporučení",
  sourceUrl: "https://www.cnb.cz/",
  asOf: "2026-04-01",
  status: "VERIFIED",
  notes: "Doporučení, ne automatické zamítnutí žádosti bankou.",
});

export const CNB_INVESTMENT_CLAIM = makeClaim(CNB_LIMITS.investment.note, {
  source: "ČNB — makroobezřetnostní doporučení",
  sourceUrl: "https://www.cnb.cz/",
  asOf: "2026-04-01",
  status: "VERIFIED",
  notes: "Typicky investiční / další obytné nemovitosti.",
});

export const NOT_LEGAL_ADVICE = makeClaim(
  "Obsah je orientační přehled, nikoli individuální právní, daňová ani investiční rada.",
  {
    source: "HypotékaJasně.cz — editorial disclaimer",
    asOf: LEGAL_REVIEW_AS_OF,
    status: "VERIFIED",
  }
);

export const TITLE_TRANSFER_CZ_CLAIM = makeClaim(
  "Převod vlastnictví v ČR se zapisuje do katastru nemovitostí. Úschovu kupní ceny a přípravu smluv běžně zajišťuje advokát, notář nebo banka — notářské ověření není jedinou povinnou cestou převodu.",
  {
    source: "Katastrální zákon / běžná praxe převodu",
    sourceUrl: "https://www.cuzk.cz/",
    asOf: LEGAL_REVIEW_AS_OF,
    status: "VERIFIED",
    notes: "Konkrétní postup závisí na struktuře transakce a bance.",
  }
);
