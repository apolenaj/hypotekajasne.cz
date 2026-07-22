/**
 * FactClaim katalog — zahraniční jurisdikce (PROMPT 12).
 *
 * Pravidla:
 * - Nevymýšlíme deep-link URL.
 * - Homepage autority z AUTHORITY_REGISTRY smíme uvést jako orientační vstupní bod.
 * - Konkrétní sazby / limity bez ověřené citace = NEEDS_UPDATE nebo UNVERIFIED.
 */

import type { FactClaim } from "@/lib/sources/types";
import { MANUAL_VERIFICATION_NOTE } from "@/lib/sources/types";

const AUDIT_AT = "2026-07-21";

/** Homepage autorit už v registru — ne deep-link na sazbu. */
const URL = {
  dld: "https://dubailand.gov.ae/",
  cbuae: "https://www.centralbank.ae/",
  bde: "https://www.bde.es/",
  bancaditalia: "https://www.bancaditalia.it/",
  hnb: "https://www.hnb.hr/",
  nbs: "https://nbs.sk/",
  sama: "https://www.sama.gov.sa/",
  rega: "https://rega.gov.sa/",
  bi: "https://www.bi.go.id/",
  ecb: "https://www.ecb.europa.eu/",
} as const;

function pending(
  partial: Omit<FactClaim, "verifiedAt" | "notes"> & {
    notes?: string | null;
  }
): FactClaim {
  return {
    ...partial,
    verifiedAt: AUDIT_AT,
    notes: [partial.notes, MANUAL_VERIFICATION_NOTE].filter(Boolean).join(" "),
  };
}

/**
 * Auditované claimy SK / HR / IT / ES / UAE / SA / Bali.
 * Žádný VERIFIED bez konkrétní ověřené citace (https deep-link).
 */
export const JURISDICTION_FACT_CLAIMS: FactClaim[] = [
  // ── Slovensko ───────────────────────────────────────────
  pending({
    id: "sk.tax.transfer.abolished",
    claim:
      "Samostatná daň z převodu nemovitostí na Slovensku byla zrušena; zůstávají poplatky za vklad a služby.",
    value: "zrušena (editorial pending)",
    jurisdiction: "slovakia",
    sourceName: "Národná banka Slovenska / daňová správa SR — k ověření",
    sourceUrl: URL.nbs,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "tax",
    notes:
      "Editorialní tvrzení z country tabs — chybí primární citace zákona / Finančné správy SR.",
  }),
  pending({
    id: "sk.tax.vat_new_build",
    claim:
      "U novostaveb od developera se na Slovensku uvádí standardní DPH u bytových jednotek — konkrétní sazba vyžaduje citaci zákona o DPH SR.",
    value: "20 % (neověřeno)",
    jurisdiction: "slovakia",
    sourceName: "Daňová správa SR — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "sk.tax.rental_income",
    claim:
      "Příjem z nájmu FO na Slovensku podléhá dani z příjmů; uváděné pásma 19/25 % nejsou ověřeny proti aktuálnímu znění zákona.",
    value: "19/25 % (neověřeno)",
    jurisdiction: "slovakia",
    sourceName: "Daňová správa SR — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "sk.cadastre.fees_band",
    claim:
      "Poplatek za vklad do katastru a právní služby na Slovensku — orientační pásmo, ne sazebník.",
    value: "orientačně jednotky tisíc EUR",
    jurisdiction: "slovakia",
    sourceName: "Tržní praxe / katastr SR",
    sourceUrl: null,
    sourceType: "market_practice",
    status: "MODEL",
    topic: "fees",
  }),
  pending({
    id: "sk.financing.nbs_framework",
    claim:
      "Makroobezřetnostní rámec hypoték na Slovensku stanovuje NBS — limity LTV/DTI ověřte proti aktuálnímu doporučení NBS.",
    value: null,
    jurisdiction: "slovakia",
    sourceName: "Národná banka Slovenska",
    sourceUrl: URL.nbs,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "ltv_dti_dsti",
  }),

  // ── Chorvatsko ──────────────────────────────────────────
  pending({
    id: "hr.tax.transfer",
    claim:
      "Daň z převodu starších nemovitostí v Chorvatsku — editorialně uváděno 3 %; vyžaduje citaci aktuálního zákona.",
    value: "3 % (neověřeno)",
    jurisdiction: "croatia",
    sourceName: "Daňová správa HR / ministrstvo — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "hr.tax.vat_new_build",
    claim:
      "DPH u novostaveb v Chorvatsku — editorialně 25 %; ověřte proti aktuální sazbě PDV.",
    value: "25 % (neověřeno)",
    jurisdiction: "croatia",
    sourceName: "Daňová správa HR — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "hr.tax.short_term_rental",
    claim:
      "Krátkodobý pronájem v Chorvatsku často využívá paušální režim — konkrétní paušál závisí na kategorii a kapacitě; není ověřen.",
    value: null,
    jurisdiction: "croatia",
    sourceName: "Turistická / daňová správa HR — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "hr.fees.notary_legal_band",
    claim:
      "Notář a právní služby v Chorvatsku — orientační pásmo 1–2 % transakce (model praxe).",
    value: "1–2 % (model)",
    jurisdiction: "croatia",
    sourceName: "Tržní praxe HR",
    sourceUrl: null,
    sourceType: "market_practice",
    status: "MODEL",
    topic: "fees",
  }),
  pending({
    id: "hr.financing.hnb_framework",
    claim:
      "Rámec úvěrování a finanční stability v Chorvatsku — HNB. Konkrétní LTV limity vyžadují citaci.",
    value: null,
    jurisdiction: "croatia",
    sourceName: "Hrvatska narodna banka",
    sourceUrl: URL.hnb,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "foreign_mortgage",
  }),

  // ── Itálie ──────────────────────────────────────────────
  pending({
    id: "it.tax.registro_iva",
    claim:
      "Imposta di registro / IVA u koupě v Itálii závisí na typu (prima casa vs. další) — konkrétní sazby nejsou ověřeny proti Agenzia delle Entrate.",
    value: "sazby dle typu (neověřeno)",
    jurisdiction: "italy",
    sourceName: "Agenzia delle Entrate — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "it.tax.imu",
    claim:
      "IMU (roční daň) u druhé nemovitosti v Itálii — sazby stanovují obce; editorialní pásmo není ověřeno.",
    value: "obecní sazba (neověřeno)",
    jurisdiction: "italy",
    sourceName: "Obecní / daňová správa IT — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "it.tax.cedolare_secca",
    claim:
      "Cedolare secca (paušál z nájmu) — uváděné sazby 21/10 % vyžadují citaci aktuálních pravidel.",
    value: "21/10 % (neověřeno)",
    jurisdiction: "italy",
    sourceName: "Agenzia delle Entrate — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "it.fees.notaio_band",
    claim:
      "Notaio a související poplatky v Itálii — orientační modelové pásmo, ne úřední sazebník.",
    value: "1–2,5 % (model)",
    jurisdiction: "italy",
    sourceName: "Tržní praxe IT",
    sourceUrl: null,
    sourceType: "market_practice",
    status: "MODEL",
    topic: "fees",
  }),
  pending({
    id: "it.financing.bancaditalia_framework",
    claim:
      "Dohled a statistiky hypotečního trhu v Itálii — Banca d'Italia. Individuální limity banky se liší.",
    value: null,
    jurisdiction: "italy",
    sourceName: "Banca d'Italia",
    sourceUrl: URL.bancaditalia,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "foreign_mortgage",
  }),

  // ── Španělsko ───────────────────────────────────────────
  pending({
    id: "es.tax.itp",
    claim:
      "ITP (daň z převodu starších nemovitostí) ve Španělsku se liší podle autonomní oblasti — konkrétní sazby nejsou ověřeny.",
    value: "8–10 % regionálně (neověřeno)",
    jurisdiction: "spain",
    sourceName: "Autonomní daňová správa ES — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "es.tax.iva_new_build",
    claim:
      "IVA u novostaveb + AJD — editorialní sazby vyžadují citaci AEAT / autonomních předpisů.",
    value: "IVA + AJD (neověřeno)",
    jurisdiction: "spain",
    sourceName: "Agencia Tributaria — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "es.tax.rental_nonresident_eu",
    claim:
      "Daň z nájmu pro nerezidenty EU ve Španělsku — uváděných 19 % není ověřeno proti aktuálnímu znění.",
    value: "19 % (neověřeno)",
    jurisdiction: "spain",
    sourceName: "Agencia Tributaria — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "es.tax.ibi",
    claim:
      "IBI (roční daň) — obecní sazba z katastrální hodnoty; pásmo editorialní.",
    value: "obecní sazba (neověřeno)",
    jurisdiction: "spain",
    sourceName: "Obecní správa ES — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "es.financing.bde_framework",
    claim:
      "Regulace a statistiky úvěrů ve Španělsku — Banco de España. Konkrétní LTV limity vyžadují citaci.",
    value: null,
    jurisdiction: "spain",
    sourceName: "Banco de España",
    sourceUrl: URL.bde,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "foreign_mortgage",
  }),

  // ── UAE / Dubaj ─────────────────────────────────────────
  pending({
    id: "dubai.tax.dld_transfer_fee",
    claim:
      "Poplatek Dubai Land Department z převodu — editorialně uváděno cca 4 % + administrační poplatek; vyžaduje aktuální DLD sazebník.",
    value: "4 % + admin (neověřeno)",
    jurisdiction: "dubai",
    sourceName: "Dubai Land Department",
    sourceUrl: URL.dld,
    sourceType: "land_authority",
    status: "NEEDS_UPDATE",
    topic: "fees",
    notes:
      "Homepage DLD je v registru autorit; deep-link na aktuální fee schedule není ověřen.",
  }),
  pending({
    id: "dubai.tax.personal_income_rental",
    claim:
      "Daň z příjmu FO z pronájmu v lokálním režimu SAE — často uváděno 0 %; ověřte aktuální federální/emirátní rámec a domovskou rezidenci.",
    value: "0 % lokálně (neověřeno)",
    jurisdiction: "dubai",
    sourceName: "Daňový rámec SAE — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "dubai.tax.annual_property",
    claim:
      "Roční daň z nemovitosti v Dubaji — editorialně 0 %; service charges jsou oddělené a mohou být vysoké.",
    value: "0 % daň / service charges zvlášť (neověřeno)",
    jurisdiction: "dubai",
    sourceName: "DLD / community rules — vyžaduje citaci",
    sourceUrl: URL.dld,
    sourceType: "land_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "dubai.ownership.freehold_zones",
    claim:
      "Vlastnictví cizinců v Dubaji je vázané na designated freehold zóny — konkrétní seznam zón ověřte u DLD.",
    value: "freehold v designated zones",
    jurisdiction: "dubai",
    sourceName: "Dubai Land Department",
    sourceUrl: URL.dld,
    sourceType: "land_authority",
    status: "NEEDS_UPDATE",
    topic: "ownership",
  }),
  pending({
    id: "dubai.financing.cbuae_framework",
    claim:
      "Rámec úvěrů a finanční stability v SAE — Central Bank of the UAE. Individuální LTV produktů bank se liší.",
    value: null,
    jurisdiction: "dubai",
    sourceName: "Central Bank of the UAE",
    sourceUrl: URL.cbuae,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "foreign_mortgage",
  }),

  // ── Saúdská Arábie ──────────────────────────────────────
  pending({
    id: "saudi.tax.rett",
    claim:
      "Real Estate Transaction Tax (RETT) v Saúdské Arábii — editorialně 5 %; strana poplatníka a výjimky vyžadují citaci.",
    value: "5 % (neověřeno)",
    jurisdiction: "saudi",
    sourceName: "ZATCA / REGA — vyžaduje citaci",
    sourceUrl: URL.rega,
    sourceType: "regulator",
    status: "NEEDS_UPDATE",
    topic: "tax",
  }),
  pending({
    id: "saudi.tax.vat",
    claim:
      "VAT 15 % se může uplatnit u některých komerčních / developerských situací — typ aktiva ověřte.",
    value: "15 % (situační, neověřeno)",
    jurisdiction: "saudi",
    sourceName: "ZATCA — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "saudi.ownership.foreign_restrictions",
    claim:
      "Vlastnictví cizinců v Saúdské Arábii je regulované (schválené zóny / struktury) — ověřte u REGA.",
    value: "regulované vlastnictví",
    jurisdiction: "saudi",
    sourceName: "Real Estate General Authority (REGA)",
    sourceUrl: URL.rega,
    sourceType: "regulator",
    status: "NEEDS_UPDATE",
    topic: "ownership",
  }),
  pending({
    id: "saudi.financing.sama_framework",
    claim:
      "Dohled nad financováním — Saudi Central Bank (SAMA). Konkrétní limity produktů vyžadují citaci.",
    value: null,
    jurisdiction: "saudi",
    sourceName: "Saudi Central Bank (SAMA)",
    sourceUrl: URL.sama,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "foreign_mortgage",
  }),

  // ── Bali / Indonésie ────────────────────────────────────
  pending({
    id: "bali.tax.bphtb",
    claim:
      "BPHTB (daň z nabytí) v Indonésii — editorialně 5 %; ověřte aktuální sazbu a základ.",
    value: "5 % (neověřeno)",
    jurisdiction: "bali",
    sourceName: "Daňová správa IDN — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "bali.tax.ppn",
    claim:
      "PPN (DPH) u novostaveb — editorialně 11 %; vyžaduje citaci zákona o DPH IDN.",
    value: "11 % (neověřeno)",
    jurisdiction: "bali",
    sourceName: "Daňová správa IDN — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "bali.tax.pph_rental",
    claim:
      "PPh z pronájmu — editorialní sazby pro rezidenty/nerezidenty nejsou ověřeny.",
    value: "srážková daň (neověřeno)",
    jurisdiction: "bali",
    sourceName: "Daňová správa IDN — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "tax_authority",
    status: "UNVERIFIED",
    topic: "tax",
  }),
  pending({
    id: "bali.ownership.leasehold_practice",
    claim:
      "Cizinci na Bali často nabývají leasehold (dlouhodobý pronájem) spíše než freehold — právní struktura vyžaduje lokální counsel.",
    value: "leasehold běžná praxe",
    jurisdiction: "bali",
    sourceName: "Právní praxe IDN / ATR BPN — vyžaduje citaci",
    sourceUrl: null,
    sourceType: "land_authority",
    status: "UNVERIFIED",
    topic: "ownership",
  }),
  pending({
    id: "bali.financing.bi_framework",
    claim:
      "Měnový a makro rámec Indonésie — Bank Indonesia. Lokální hypotéka pro cizince je omezená; ověřte case-by-case.",
    value: null,
    jurisdiction: "bali",
    sourceName: "Bank Indonesia",
    sourceUrl: URL.bi,
    sourceType: "central_bank",
    status: "NEEDS_UPDATE",
    topic: "foreign_mortgage",
  }),
];

export const CLAIM_JURISDICTIONS = [
  "cz",
  "slovakia",
  "croatia",
  "italy",
  "spain",
  "dubai",
  "saudi",
  "bali",
] as const;

export type ClaimJurisdiction = (typeof CLAIM_JURISDICTIONS)[number];
