/**
 * Phase 2 Step 2.2 — CZ mortgage-market import manifest (evidence integrity).
 *
 * Source: owner primary-source audit only (checked_at 2026-08-09).
 * Do NOT invent rates, LTV bands, discounts, or URLs not supplied.
 * Production SQL is NOT generated here.
 */

import type {
  ImportCondition,
  ImportEvidence,
  ImportFee,
  ImportHoldRow,
  ImportLender,
  ImportProduct,
  ImportRateRecord,
  ImportRepresentativeExample,
  MortgageMarketImportManifest,
} from "@/lib/mortgage-market/import/types";

export const CZ_MANIFEST_CHECKED_AT = "2026-08-09T00:00:00.000Z";

const CHECKED = CZ_MANIFEST_CHECKED_AT;

function ev(
  evidenceId: string,
  lenderSlug: string,
  sourceName: string,
  documentTitle?: string,
  sourceUrl?: string | null,
  sourceType: ImportEvidence["sourceType"] = "official_rate_page"
): ImportEvidence {
  return {
    evidenceId,
    lenderSlug,
    sourceType,
    sourceName,
    documentTitle: documentTitle ?? sourceName,
    sourceUrl: sourceUrl ?? null,
    checkedAt: CHECKED,
    reliabilityTier: "primary",
  };
}

const LTV_TO_90: ImportRateRecord["ltv"] = {
  kind: "explicit",
  ltvMin: 0,
  ltvMax: 90,
  ltvMinExclusive: false,
  ltvMaxExclusive: false,
  provenance: "explicit_in_rate_source",
};

const LTV_LE_80: ImportRateRecord["ltv"] = {
  kind: "explicit",
  ltvMin: 0,
  ltvMax: 80,
  ltvMinExclusive: false,
  ltvMaxExclusive: false,
  provenance: "explicit_in_rate_source",
};

const LTV_GT80_90: ImportRateRecord["ltv"] = {
  kind: "explicit",
  ltvMin: 80,
  ltvMax: 90,
  ltvMinExclusive: true,
  ltvMaxExclusive: false,
  provenance: "explicit_in_rate_source",
};

const LTV_UNSPECIFIED: ImportRateRecord["ltv"] = {
  kind: "unspecified",
  ltvMin: null,
  ltvMax: null,
  provenance: "unspecified_in_rate_source",
};

// ─── Evidence catalog ───────────────────────────────────────────────────────

const EV_AIR = ev(
  "ev-air-bank-rates-2026-03-27",
  "air-bank",
  "Air Bank official mortgage rate publication (valid from 2026-03-27)",
  "Air Bank hypotéka — sazby",
  "https://www.airbank.cz/co-vas-nejvic-zajima/urokove-sazby-u-hypoteky/",
  "official_lender_web"
);
const EV_MONETA = ev(
  "ev-moneta-rates-2026-07-23",
  "moneta",
  "MONETA Money Bank official rate sheet (valid from 2026-07-23)",
  "MONETA sazebník hypoték",
  "https://www.moneta.cz/dokumenty-ke-stazeni/sazebniky",
  "official_lender_web"
);
const EV_MONETA_RPSN = ev(
  "ev-moneta-representative-example",
  "moneta",
  "MONETA Money Bank official representative RPSN example (primary audit)",
  "MONETA reprezentativní příklad",
  "https://www.moneta.cz/hypoteky/hypoteka",
  "official_lender_web"
);
const EV_UC = ev(
  "ev-unicredit-purpose-rates",
  "unicredit",
  "UniCredit Bank official purpose-mortgage advertised rates (primary audit)",
  "UniCredit účelová hypotéka — sazby",
  "https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html",
  "official_lender_web"
);
const EV_CS = ev(
  "ev-cs-oznameni-urokovych-sazeb",
  "ceska-sporitelna",
  "Česká spořitelna — Oznámení o úrokových sazbách (účinnost od 29. 5. 2026)",
  "ČS Oznámení o úrokových sazbách",
  "https://www.csas.cz/banka/content/inet/internet/cs/RR_SK.ANN..xml,pdf_IE",
  "official_lender_pdf"
);
/** Conflicting product-page headline — NOT used for IMPORT_READY rates. */
const EV_CS_CAMPAIGN_HOLD = ev(
  "ev-cs-web-campaign-od-5-09-hold",
  "ceska-sporitelna",
  "ČS product page headline „Nová hypotéka od 5,09 % ročně“ — HOLD; fixation not stated; do not overwrite Oznámení matrix",
  "ČS web product-page headline (unreconciled)",
  "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
  "official_lender_web"
);
const EV_KB = ev(
  "ev-kb-minimum-rates-by-fixation-ltv",
  "komercni-banka",
  "Komerční banka — Oznámení o úrokových sazbách (účinnost od 24. 7. 2026)",
  "KB minimální výše úrokové sazby podle doby fixace",
  "https://www.kb.cz/getmedia/72c05c27-6ecd-4383-8c02-63d679fa4d00/oznameni-o-urokovych-sazbach.pdf",
  "official_lender_pdf"
);
const EV_KB_PRODUCT = ev(
  "ev-kb-product-page-advertised-from",
  "komercni-banka",
  "Komerční banka — Hypotéka product page (conditional advertised-from 5,19 % p.a.)",
  "KB Hypotéka — produktová stránka",
  "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
  "official_lender_web"
);
const EV_CSOB = ev(
  "ev-csob-rate-page-hold",
  "csob",
  "ČSOB official rate page displays LTV-point rates — HOLD until fixation/rate_type/conditions fully evidenced",
  "ČSOB Hypotéka — sazby (HOLD)"
);
const EV_RB = ev(
  "ev-rb-product-pages",
  "raiffeisenbank",
  "Raiffeisenbank official product / eligibility pages (primary audit)",
  "Raiffeisenbank hypotéky — produkty",
  "https://www.rb.cz/osobni/hypoteky",
  "official_lender_web"
);
const EV_RB_LOWER_PAYMENT = ev(
  "ev-rb-hypoteka-s-nizsi-splatkou-example",
  "raiffeisenbank",
  "Raiffeisenbank — Hypotéka s nižší splátkou official representative example",
  "RB Hypotéka s nižší splátkou — reprezentativní příklad",
  "https://www.rb.cz/osobni/hypoteky/nabidka-hypotek/hypoteka-s-nizsi-splatkou",
  "official_lender_web"
);

export const CZ_2026_08_09_EVIDENCE: ImportEvidence[] = [
  EV_AIR,
  EV_MONETA,
  EV_MONETA_RPSN,
  EV_UC,
  EV_CS,
  EV_CS_CAMPAIGN_HOLD,
  EV_KB,
  EV_KB_PRODUCT,
  EV_CSOB,
  EV_RB,
  EV_RB_LOWER_PAYMENT,
];

// ─── Lenders ────────────────────────────────────────────────────────────────

export const CZ_2026_08_09_LENDERS: ImportLender[] = [
  {
    recordId: "lender-air-bank",
    slug: "air-bank",
    name: "Air Bank",
    countryCode: "CZ",
    websiteUrl: null,
    evidence: EV_AIR,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
  {
    recordId: "lender-moneta",
    slug: "moneta",
    name: "MONETA Money Bank",
    countryCode: "CZ",
    websiteUrl: null,
    evidence: EV_MONETA,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
  {
    recordId: "lender-unicredit",
    slug: "unicredit",
    name: "UniCredit Bank",
    countryCode: "CZ",
    websiteUrl: null,
    evidence: EV_UC,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
  {
    recordId: "lender-ceska-sporitelna",
    slug: "ceska-sporitelna",
    name: "Česká spořitelna",
    countryCode: "CZ",
    websiteUrl: null,
    evidence: EV_CS,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
  {
    recordId: "lender-komercni-banka",
    slug: "komercni-banka",
    name: "Komerční banka",
    countryCode: "CZ",
    websiteUrl: null,
    evidence: EV_KB,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes:
      "Official minimum-rate matrix by fixation × LTV from Oznámení (od 24. 7. 2026). Product-page 5.19% is a separate conditional scenario.",
  },
  {
    recordId: "lender-csob",
    slug: "csob",
    name: "ČSOB",
    countryCode: "CZ",
    websiteUrl: null,
    evidence: EV_CSOB,
    checkedAt: CHECKED,
    auditStatus: "HOLD",
    notes:
      "Rate page values captured as HOLD — fixation / rate_type / conditions not fully evidenced.",
  },
  {
    recordId: "lender-raiffeisenbank",
    slug: "raiffeisenbank",
    name: "Raiffeisenbank",
    countryCode: "CZ",
    websiteUrl: null,
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
    notes:
      "Product/eligibility verified; Klasik retail rates HOLD. Lower-payment product has example only.",
  },
];

// ─── Products ───────────────────────────────────────────────────────────────

const airLoyaltyCondition: ImportCondition = {
  conditionType: "other",
  conditionRole: "published_discount",
  description:
    "Loyalty discount −10 bp (explicit). Not applied automatically to base with/without PPI matrix rates unless pricing_scenario includes loyalty.",
  rateEffectBp: -10,
  isRequired: false,
  isOptional: true,
  effectInferred: false,
};

const airSmartReserveCondition: ImportCondition = {
  conditionType: "other",
  conditionRole: "published_surcharge",
  description: "Smart Reserve surcharge +20 bp (explicit).",
  rateEffectBp: 20,
  isRequired: false,
  isOptional: true,
  effectInferred: false,
};

export const CZ_2026_08_09_PRODUCTS: ImportProduct[] = [
  {
    recordId: "product-air-bank-residential",
    lenderSlug: "air-bank",
    slug: "residential-mortgage",
    name: "Air Bank — new residential mortgage",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    maxLtv: 90,
    documentedConditions: [airLoyaltyCondition, airSmartReserveCondition],
    evidence: EV_AIR,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes:
      "Same published rates explicitly apply up to 90% LTV. Product max LTV is eligibility context; rate LTV is also explicitly evidenced up to 90%.",
  },
  {
    recordId: "product-moneta-housing",
    lenderSlug: "moneta",
    slug: "mortgage-housing",
    name: "MONETA — mortgage for housing",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_MONETA,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes: "LTV pricing segment not published on rate sheet.",
  },
  {
    recordId: "product-moneta-trade",
    lenderSlug: "moneta",
    slug: "mortgage-trade-entrepreneur",
    name: "MONETA — trade/entrepreneur mortgage",
    productType: "business_secured",
    borrowerScope: "entrepreneur",
    currency: "CZK",
    evidence: EV_MONETA,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes: "PPI discount does not apply to these published rates.",
  },
  {
    recordId: "product-moneta-american",
    lenderSlug: "moneta",
    slug: "american-mortgage",
    name: "MONETA — American mortgage",
    productType: "american",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_MONETA,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
  {
    recordId: "product-unicredit-purpose",
    lenderSlug: "unicredit",
    slug: "purpose-mortgage",
    name: "UniCredit — purpose mortgage",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    maxLtv: 90,
    evidence: EV_UC,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes:
      "Product may permit up to 90% LTV; rate rows use only explicitly published LTV pricing bands.",
  },
  {
    recordId: "product-cs-fixed",
    lenderSlug: "ceska-sporitelna",
    slug: "hypoteka-oznameni-fixed",
    name: "Česká spořitelna — Oznámení o úrokových sazbách (fixed)",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    documentedConditions: [
      {
        conditionType: "other",
        conditionRole: "qualifying",
        description:
          "Hypotéka pro budoucnost — included in Oznámení scenario conditions; no current numerical discount evidenced.",
        rateEffectBp: null,
        isRequired: false,
        isOptional: true,
        effectInferred: false,
      },
    ],
    evidence: EV_CS,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes:
      "IMPORT_READY rates come only from Oznámení table (od 29. 5. 2026). Product-page headline od 5,09% is a separate unreconciled collision (HOLD).",
  },
  {
    recordId: "product-cs-american",
    lenderSlug: "ceska-sporitelna",
    slug: "american-mortgage",
    name: "Česká spořitelna — American mortgage",
    productType: "american",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_CS,
    checkedAt: CHECKED,
    auditStatus: "STRUCTURED",
    notes: "Advertised-from 5.59; fixation not published → rate on HOLD.",
  },
  {
    recordId: "product-kb-standard",
    lenderSlug: "komercni-banka",
    slug: "standard-mortgage",
    name: "Komerční banka — standard mortgage",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_KB,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes:
      "Official minimum rates by fixation × LTV from Oznámení. Product-page conditional od 5,19% is a separate scenario.",
  },
  {
    recordId: "product-kb-american",
    lenderSlug: "komercni-banka",
    slug: "american-mortgage",
    name: "Komerční banka — American mortgage",
    productType: "american",
    borrowerScope: "natural_person",
    currency: "CZK",
    maxLtv: 70,
    maxTermYears: 20,
    evidence: EV_KB,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes:
      "American minimum rates by fixation (LTV segment not published on that table). Product max LTV 70 is eligibility only.",
  },
  {
    recordId: "product-csob-retail",
    lenderSlug: "csob",
    slug: "retail-mortgage",
    name: "ČSOB — retail mortgage",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_CSOB,
    checkedAt: CHECKED,
    auditStatus: "HOLD",
    notes:
      "Rate page shows LTV-point rates; fixation/rate_type/conditions not fully evidenced → HOLD.",
  },
  {
    recordId: "product-csob-american",
    lenderSlug: "csob",
    slug: "american-mortgage",
    name: "ČSOB — American mortgage",
    productType: "american",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_CSOB,
    checkedAt: CHECKED,
    auditStatus: "HOLD",
  },
  {
    recordId: "product-rb-klasik",
    lenderSlug: "raiffeisenbank",
    slug: "retail-klasik",
    name: "Raiffeisenbank — retail Klasik",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    maxAmount: 20_000_000,
    maxLtv: 90,
    minTermYears: 5,
    maxTermYears: 30,
    fixationMonthsAvailable: [12, 24, 36, 48, 60, 72, 84, 120, 180],
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
    notes: "Ordinary retail rate variants not generated from dynamic calculator.",
  },
  {
    recordId: "product-rb-green",
    lenderSlug: "raiffeisenbank",
    slug: "responsible-green-mortgage",
    name: "Raiffeisenbank — responsible/green mortgage",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    documentedConditions: [
      {
        conditionType: "green_property_required",
        conditionRole: "published_discount",
        description:
          "Explicit rate discount −10 bp when energy requirements are satisfied.",
        rateEffectBp: -10,
        isRequired: false,
        isOptional: true,
        requirementMode: "required_for_discount",
        effectInferred: false,
      },
    ],
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
  },
  {
    recordId: "product-rb-american",
    lenderSlug: "raiffeisenbank",
    slug: "american-mortgage",
    name: "Raiffeisenbank — American mortgage",
    productType: "american",
    borrowerScope: "natural_person",
    currency: "CZK",
    maxAmount: 12_000_000,
    maxLtv: 70,
    minTermYears: 5,
    maxTermYears: 20,
    fixationMonthsAvailable: [12, 24, 36, 48, 60, 72, 84, 120, 180],
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
  },
  {
    recordId: "product-rb-business-american",
    lenderSlug: "raiffeisenbank",
    slug: "business-american-mortgage",
    name: "Raiffeisenbank — business American mortgage",
    productType: "business_secured",
    borrowerScope: "entrepreneur",
    currency: "CZK",
    maxTermYears: 25,
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
    notes: "Advertised-from 5.5; exact rate individually assessed.",
  },
  {
    recordId: "product-rb-lower-payment",
    lenderSlug: "raiffeisenbank",
    slug: "hypoteka-s-nizsi-splatkou",
    name: "Raiffeisenbank — Hypotéka s nižší splátkou",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_RB_LOWER_PAYMENT,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
    notes:
      "Representative example only. Do NOT treat 4.59% as generic Klasik retail rate.",
  },
];

// ─── Rate builders ──────────────────────────────────────────────────────────

function airRate(input: {
  id: string;
  purpose: "purchase" | "refinance";
  years: number;
  withPpi: boolean;
  rate: number;
}): ImportRateRecord {
  const scenario = input.withPpi
    ? "with_repayment_insurance"
    : "without_repayment_insurance";
  const conditions: ImportCondition[] = input.withPpi
    ? [
        {
          conditionType: "repayment_insurance",
          conditionRole: "published_discount",
          description: "PPI / repayment insurance — published effect −10 bp.",
          insuranceKind: "repayment",
          requirementMode: "required_for_discount",
          rateEffectBp: -10,
          isRequired: true,
          isOptional: false,
          effectInferred: false,
        },
      ]
    : [
        {
          conditionType: "no_insurance",
          conditionRole: "qualifying",
          description: "Published rate without repayment insurance (PPI).",
          insuranceKind: "none",
          requirementMode: "not_applicable",
          rateEffectBp: null,
          isRequired: false,
          isOptional: true,
          effectInferred: false,
        },
      ];

  return {
    recordId: input.id,
    lenderSlug: "air-bank",
    productSlug: "residential-mortgage",
    financingPurpose: input.purpose,
    fixationMonths: input.years * 12,
    nominalInterestRate: input.rate,
    rateType: "standard",
    pricingScenarioKey: scenario,
    pricingScenarioLabel: input.withPpi
      ? "With repayment insurance (PPI)"
      : "Without repayment insurance (PPI)",
    ltv: LTV_TO_90,
    conditions,
    evidence: EV_AIR,
    checkedAt: CHECKED,
    validFrom: "2026-03-27T00:00:00.000Z",
    auditStatus: "IMPORT_READY",
  };
}

function monetaRate(input: {
  id: string;
  productSlug: string;
  years: number;
  rate: number;
  includeHousingDiscounts: boolean;
}): ImportRateRecord {
  const conditions: ImportCondition[] = input.includeHousingDiscounts
    ? [
        {
          conditionType: "active_account_required",
          conditionRole: "published_discount",
          description:
            "Active account — published effect −50 bp (included in housing published rates).",
          rateEffectBp: -50,
          isRequired: true,
          isOptional: false,
          effectInferred: false,
        },
        {
          conditionType: "repayment_insurance",
          conditionRole: "published_discount",
          description:
            "Optional repayment insurance — published effect −20 bp (housing).",
          insuranceKind: "repayment",
          requirementMode: "optional",
          rateEffectBp: -20,
          isRequired: false,
          isOptional: true,
          effectInferred: false,
        },
      ]
    : [
        {
          conditionType: "repayment_insurance",
          conditionRole: "qualifying",
          description:
            "PPI discount does NOT apply to published Trade/entrepreneur mortgage rates.",
          insuranceKind: "repayment",
          requirementMode: "not_applicable",
          rateEffectBp: null,
          isRequired: false,
          isOptional: true,
          effectInferred: false,
        },
      ];

  return {
    recordId: input.id,
    lenderSlug: "moneta",
    productSlug: input.productSlug,
    financingPurpose:
      input.productSlug === "american-mortgage" ? "non_purpose" : "purchase",
    fixationMonths: input.years * 12,
    nominalInterestRate: input.rate,
    rateType: "standard",
    pricingScenarioKey: input.includeHousingDiscounts
      ? "housing_published_with_account_and_optional_ppi"
      : "trade_published_base",
    ltv: LTV_UNSPECIFIED,
    conditions:
      input.productSlug === "american-mortgage" ? undefined : conditions,
    evidence: EV_MONETA,
    checkedAt: CHECKED,
    validFrom: "2026-07-23T00:00:00.000Z",
    auditStatus: "IMPORT_READY",
  };
}

function ucRate(input: {
  id: string;
  years: number;
  rate: number;
  ltv: ImportRateRecord["ltv"];
  bandLabel: string;
}): ImportRateRecord {
  return {
    recordId: input.id,
    lenderSlug: "unicredit",
    productSlug: "purpose-mortgage",
    financingPurpose: "purchase",
    fixationMonths: input.years * 12,
    nominalInterestRate: input.rate,
    rateType: "advertised_from",
    pricingScenarioKey: `advertised_with_ppi_and_active_account_${input.bandLabel}`,
    pricingScenarioLabel: `Advertised-from (${input.bandLabel}) with repayment insurance + active repayment account`,
    ltv: input.ltv,
    conditions: [
      {
        conditionType: "repayment_insurance",
        conditionRole: "required",
        description:
          "Repayment insurance required for these published advertised rates. No explicit numeric PPI rate_effect_bp in evidence.",
        insuranceKind: "repayment",
        requirementMode: "mandatory_for_rate",
        rateEffectBp: null,
        isRequired: true,
        isOptional: false,
        effectInferred: false,
      },
      {
        conditionType: "active_account_required",
        conditionRole: "required",
        description:
          "Active repayment account required. Monthly inflow >= 1.5× annuity payment AND >= 3 card payments/month.",
        rateEffectBp: null,
        isRequired: true,
        isOptional: false,
        effectInferred: false,
        valueText:
          "monthly_inflow>=1.5x_annuity AND card_payments_per_month>=3",
      },
    ],
    eligibility: [
      {
        ruleCategory: "income",
        ruleCode: "foreign_income_or_residence",
        effect: "manual_assessment",
        description:
          "Treated as foreign-currency mortgage when at least one applicant has income in a foreign currency or residence outside CZ; loan remains in CZK. Eligibility only — no automatic pricing impact.",
        changesPricing: false,
        pricingEffectBp: null,
      },
    ],
    evidence: EV_UC,
    checkedAt: CHECKED,
    validFrom: null,
    auditStatus: "IMPORT_READY",
  };
}

function csRate(input: { id: string; years: number; rate: number }): ImportRateRecord {
  return {
    recordId: input.id,
    lenderSlug: "ceska-sporitelna",
    productSlug: "hypoteka-oznameni-fixed",
    financingPurpose: "purchase",
    fixationMonths: input.years * 12,
    nominalInterestRate: input.rate,
    rateType: "standard",
    pricingScenarioKey: "oznameni_account_ppi_budoucnost",
    pricingScenarioLabel:
      "Oznámení o úrokových sazbách — sazby zohledňují aktivní účet ČS, pojištění schopnosti splácet a Hypotéku pro budoucnost (číselný efekt slev v Oznámení neuveden)",
    ltv: LTV_UNSPECIFIED,
    conditions: [
      {
        conditionType: "active_account_required",
        conditionRole: "published_discount",
        description:
          "Splácení z aktivního účtu u České spořitelny — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.",
        rateEffectBp: null,
        isRequired: true,
        isOptional: false,
        effectInferred: false,
      },
      {
        conditionType: "repayment_insurance",
        conditionRole: "published_discount",
        description:
          "Pojištění schopnosti splácet od PČS — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.",
        insuranceKind: "repayment",
        requirementMode: "mandatory_for_rate",
        rateEffectBp: null,
        isRequired: true,
        isOptional: false,
        effectInferred: false,
      },
      {
        conditionType: "other",
        conditionRole: "qualifying",
        description:
          "Hypotéka pro budoucnost — sleva je v sazbě zohledněna; číselný efekt Oznámení neuvádí.",
        rateEffectBp: null,
        isRequired: false,
        isOptional: true,
        effectInferred: false,
      },
    ],
    evidence: EV_CS,
    checkedAt: CHECKED,
    validFrom: null,
    auditStatus: "IMPORT_READY",
    notes:
      "Do not mix with product-page headline od 5,09% (see HOLD collision).",
  };
}

function kbMinRate(input: {
  id: string;
  productSlug: string;
  years: number;
  rate: number;
  ltv: ImportRateRecord["ltv"];
  bandLabel: string;
  purpose: string;
}): ImportRateRecord {
  return {
    recordId: input.id,
    lenderSlug: "komercni-banka",
    productSlug: input.productSlug,
    financingPurpose: input.purpose,
    fixationMonths: input.years * 12,
    nominalInterestRate: input.rate,
    // Closest faithful type for "minimální výše úrokové sazby podle doby fixace"
    // (not guaranteed / not personalized).
    rateType: "advertised_from",
    pricingScenarioKey: `minimum_rate_by_fixation_${input.bandLabel}`,
    pricingScenarioLabel: "Minimální sazba dle sazebníku",
    ltv: input.ltv,
    evidence: EV_KB,
    checkedAt: CHECKED,
    validFrom: null,
    auditStatus: "IMPORT_READY",
    notes:
      "From KB Oznámení matrix. Distinct from product-page conditional od 5,19%.",
  };
}

// ─── Rates ──────────────────────────────────────────────────────────────────

const airPurchase: Array<[number, number, number]> = [
  // years, withPpi, withoutPpi
  [2, 4.79, 4.89],
  [3, 4.79, 4.89],
  [5, 4.89, 4.99],
  [7, 5.09, 5.19],
  [10, 5.29, 5.39],
];

const airRefinance: Array<[number, number, number]> = [
  [2, 4.69, 4.79],
  [3, 4.69, 4.79],
  [5, 4.79, 4.89],
  [7, 4.99, 5.09],
  [10, 5.19, 5.29],
];

const airRates: ImportRateRecord[] = [];
for (const [years, withPpi, withoutPpi] of airPurchase) {
  airRates.push(
    airRate({
      id: `air-purchase-${years}y-with-ppi`,
      purpose: "purchase",
      years,
      withPpi: true,
      rate: withPpi,
    }),
    airRate({
      id: `air-purchase-${years}y-without-ppi`,
      purpose: "purchase",
      years,
      withPpi: false,
      rate: withoutPpi,
    })
  );
}
for (const [years, withPpi, withoutPpi] of airRefinance) {
  airRates.push(
    airRate({
      id: `air-refinance-${years}y-with-ppi`,
      purpose: "refinance",
      years,
      withPpi: true,
      rate: withPpi,
    }),
    airRate({
      id: `air-refinance-${years}y-without-ppi`,
      purpose: "refinance",
      years,
      withPpi: false,
      rate: withoutPpi,
    })
  );
}

const monetaHousing: Array<[number, number]> = [
  [1, 4.79],
  [3, 4.99],
  [5, 5.09],
  [7, 5.39],
  [10, 5.59],
];
const monetaTrade: Array<[number, number]> = [
  [1, 5.39],
  [3, 5.59],
  [5, 5.69],
  [7, 5.99],
  [10, 6.19],
];
const monetaAmerican: Array<[number, number]> = [
  [1, 5.19],
  [3, 5.39],
  [5, 5.49],
  [7, 5.79],
  [10, 5.99],
];

const monetaRates: ImportRateRecord[] = [
  ...monetaHousing.map(([years, rate]) =>
    monetaRate({
      id: `moneta-housing-${years}y`,
      productSlug: "mortgage-housing",
      years,
      rate,
      includeHousingDiscounts: true,
    })
  ),
  ...monetaTrade.map(([years, rate]) =>
    monetaRate({
      id: `moneta-trade-${years}y`,
      productSlug: "mortgage-trade-entrepreneur",
      years,
      rate,
      includeHousingDiscounts: false,
    })
  ),
  ...monetaAmerican.map(([years, rate]) =>
    monetaRate({
      id: `moneta-american-${years}y`,
      productSlug: "american-mortgage",
      years,
      rate,
      includeHousingDiscounts: false,
    })
  ),
];

const ucRates: ImportRateRecord[] = [
  ucRate({
    id: "uc-purpose-2y-le80",
    years: 2,
    rate: 5.09,
    ltv: LTV_LE_80,
    bandLabel: "ltv_le_80",
  }),
  ucRate({
    id: "uc-purpose-2y-gt80-90",
    years: 2,
    rate: 5.59,
    ltv: LTV_GT80_90,
    bandLabel: "ltv_gt80_90",
  }),
  ucRate({
    id: "uc-purpose-3y-le80",
    years: 3,
    rate: 5.19,
    ltv: LTV_LE_80,
    bandLabel: "ltv_le_80",
  }),
  ucRate({
    id: "uc-purpose-3y-gt80-90",
    years: 3,
    rate: 5.69,
    ltv: LTV_GT80_90,
    bandLabel: "ltv_gt80_90",
  }),
  ucRate({
    id: "uc-purpose-5y-le80",
    years: 5,
    rate: 5.59,
    ltv: LTV_LE_80,
    bandLabel: "ltv_le_80",
  }),
  ucRate({
    id: "uc-purpose-5y-gt80-90",
    years: 5,
    rate: 6.09,
    ltv: LTV_GT80_90,
    bandLabel: "ltv_gt80_90",
  }),
];

/** ČS Oznámení (účinnost od 29. 5. 2026) — fixation-specific „od“ rates. */
const csFixed: Array<[number, number]> = [
  [1, 5.14],
  [2, 4.94],
  [3, 4.94],
  [4, 5.04],
  [5, 5.14],
  [8, 5.34],
  [10, 5.54],
  [15, 5.74],
  [20, 5.94],
];

const csRates: ImportRateRecord[] = [
  ...csFixed.map(([years, rate]) =>
    csRate({ id: `cs-oznameni-${years}y`, years, rate })
  ),
  {
    recordId: "cs-american-advertised-from",
    lenderSlug: "ceska-sporitelna",
    productSlug: "american-mortgage",
    financingPurpose: "non_purpose",
    fixationMonths: null,
    nominalInterestRate: 5.44,
    rateType: "advertised_from",
    pricingScenarioKey: "advertised_from",
    ltv: LTV_UNSPECIFIED,
    evidence: EV_CS,
    checkedAt: CHECKED,
    auditStatus: "HOLD",
    notes: "Oznámení publishes „Americká hypotéka od 5,44 %“ without fixation — HOLD.",
  },
  {
    recordId: "cs-web-campaign-od-5-09-unreconciled",
    lenderSlug: "ceska-sporitelna",
    productSlug: "hypoteka-oznameni-fixed",
    financingPurpose: "purchase",
    fixationMonths: null,
    nominalInterestRate: 5.09,
    rateType: "advertised_from",
    pricingScenarioKey: "web_campaign_headline_unreconciled",
    pricingScenarioLabel:
      "Produktová stránka: Nová hypotéka od 5,09 % — NOT mixed with Oznámení table",
    ltv: LTV_UNSPECIFIED,
    evidence: EV_CS_CAMPAIGN_HOLD,
    checkedAt: CHECKED,
    auditStatus: "HOLD",
    notes:
      "SOURCE COLLISION: product-page headline od 5,09% vs Oznámení fixation table (2y/3y od 4,94%). Do not invent fixation for the headline — HOLD.",
  },
];

/** KB Oznámení (od 24. 7. 2026): [years, le80, gt80_90] */
const kbMortgageMin: Array<[number, number, number]> = [
  [1, 5.14, 5.54],
  [2, 5.19, 5.59],
  [3, 5.24, 5.64],
  [4, 5.54, 5.94],
  [5, 5.74, 6.14],
];

const kbAmericanMin: Array<[number, number]> = [
  [1, 5.54],
  [2, 5.59],
  [3, 5.64],
  [4, 5.94],
  [5, 6.14],
];

const kbConditionalAdvertised: ImportRateRecord = {
  recordId: "kb-product-page-advertised-from-5-19",
  lenderSlug: "komercni-banka",
  productSlug: "standard-mortgage",
  financingPurpose: "purchase",
  fixationMonths: null,
  nominalInterestRate: 5.19,
  rateType: "advertised_from",
  pricingScenarioKey: "product_page_advertised_from_conditional",
  pricingScenarioLabel: "Zvýhodněná sazba od",
  ltv: LTV_UNSPECIFIED,
  conditions: [
    {
      conditionType: "income_domiciliation_required",
      conditionRole: "qualifying",
      description: "Směřování příjmů na účet vedený u KB",
      rateEffectBp: null,
      isRequired: true,
      isOptional: false,
      effectInferred: false,
    },
    {
      conditionType: "life_insurance_required",
      conditionRole: "qualifying",
      description:
        "Rizikové životní pojištění u Komerční pojišťovny, a. s.",
      insuranceKind: "life",
      requirementMode: "mandatory_for_rate",
      rateEffectBp: null,
      isRequired: true,
      isOptional: false,
      effectInferred: false,
    },
    {
      conditionType: "property_insurance_required",
      conditionRole: "qualifying",
      description:
        "Pojištění zastavené nemovitosti u Komerční pojišťovny, a. s.",
      insuranceKind: "property",
      requirementMode: "mandatory_for_rate",
      rateEffectBp: null,
      isRequired: true,
      isOptional: false,
      effectInferred: false,
    },
    {
      conditionType: "PENB_class_requirement",
      conditionRole: "qualifying",
      description: "PENB energetická třída A nebo B k zastavené nemovitosti",
      valueText: "A|B",
      rateEffectBp: null,
      isRequired: true,
      isOptional: false,
      effectInferred: false,
    },
  ],
  evidence: EV_KB_PRODUCT,
  checkedAt: CHECKED,
  validFrom: null,
  auditStatus: "IMPORT_READY",
  notes:
    "Product-page conditional od 5,19%. Fixation and LTV not stated on page — must not personalized-match LTV or replace Oznámení matrix.",
};

const kbRates: ImportRateRecord[] = [
  ...kbMortgageMin.flatMap(([years, le80, gt80]) => [
    kbMinRate({
      id: `kb-mortgage-${years}y-le80`,
      productSlug: "standard-mortgage",
      years,
      rate: le80,
      ltv: LTV_LE_80,
      bandLabel: "ltv_le_80",
      purpose: "purchase",
    }),
    kbMinRate({
      id: `kb-mortgage-${years}y-gt80-90`,
      productSlug: "standard-mortgage",
      years,
      rate: gt80,
      ltv: LTV_GT80_90,
      bandLabel: "ltv_gt80_90",
      purpose: "purchase",
    }),
  ]),
  ...kbAmericanMin.map(([years, rate]) =>
    kbMinRate({
      id: `kb-american-${years}y`,
      productSlug: "american-mortgage",
      years,
      rate,
      ltv: LTV_UNSPECIFIED,
      bandLabel: "ltv_unspecified",
      purpose: "non_purpose",
    })
  ),
  kbConditionalAdvertised,
];

function csobHoldRate(input: {
  id: string;
  productSlug: string;
  rate: number;
  displayedLtv: number;
  purpose: string;
}): ImportRateRecord {
  return {
    recordId: input.id,
    lenderSlug: "csob",
    productSlug: input.productSlug,
    financingPurpose: input.purpose,
    fixationMonths: null,
    nominalInterestRate: input.rate,
    rateType: "advertised_from",
    pricingScenarioKey: "rate_page_ltv_point_unverified_semantics",
    pricingScenarioLabel: `ČSOB rate page displays rate at LTV ${input.displayedLtv} — semantics HOLD`,
    ltv: LTV_UNSPECIFIED,
    evidence: EV_CSOB,
    checkedAt: CHECKED,
    auditStatus: "HOLD",
    notes: `Source displays LTV ${input.displayedLtv} = ${input.rate}%. Fixation, whether advertised/minimum/standard, and included conditions not fully evidenced — HOLD.`,
  };
}

const csobHoldRates: ImportRateRecord[] = [
  csobHoldRate({
    id: "csob-mortgage-ltv70-hold",
    productSlug: "retail-mortgage",
    rate: 5.39,
    displayedLtv: 70,
    purpose: "purchase",
  }),
  csobHoldRate({
    id: "csob-mortgage-ltv80-hold",
    productSlug: "retail-mortgage",
    rate: 5.54,
    displayedLtv: 80,
    purpose: "purchase",
  }),
  csobHoldRate({
    id: "csob-mortgage-ltv90-hold",
    productSlug: "retail-mortgage",
    rate: 5.69,
    displayedLtv: 90,
    purpose: "purchase",
  }),
  csobHoldRate({
    id: "csob-american-ltv70-hold",
    productSlug: "american-mortgage",
    rate: 5.89,
    displayedLtv: 70,
    purpose: "non_purpose",
  }),
];

const rbHoldRate: ImportRateRecord = {
  recordId: "rb-business-american-advertised-from",
  lenderSlug: "raiffeisenbank",
  productSlug: "business-american-mortgage",
  financingPurpose: "business",
  fixationMonths: null,
  nominalInterestRate: 5.5,
  rateType: "advertised_from",
  pricingScenarioKey: "advertised_from_individually_assessed",
  ltv: LTV_UNSPECIFIED,
  eligibility: [
    {
      ruleCategory: "applicant",
      ruleCode: "entrepreneur_or_legal_entity",
      effect: "eligible",
      description: "Borrower = entrepreneur/company.",
      changesPricing: false,
      pricingEffectBp: null,
    },
    {
      ruleCategory: "income",
      ruleCode: "annual_turnover_range",
      effect: "eligible",
      description: "Annual turnover 300,000 to 100,000,000 CZK.",
      changesPricing: false,
      pricingEffectBp: null,
    },
    {
      ruleCategory: "other",
      ruleCode: "individually_assessed_rate",
      effect: "manual_assessment",
      description: "Exact rate individually assessed — not a retail matrix rate.",
      changesPricing: false,
      pricingEffectBp: null,
    },
  ],
  evidence: EV_RB,
  checkedAt: CHECKED,
  auditStatus: "HOLD",
  notes: "Advertised-from only; ordinary retail Klasik variants not generated.",
};

export const CZ_2026_08_09_RATES: ImportRateRecord[] = [
  ...airRates,
  ...monetaRates,
  ...ucRates,
  ...csRates,
  ...kbRates,
  ...csobHoldRates,
  rbHoldRate,
];

// ─── Fees ───────────────────────────────────────────────────────────────────

export const CZ_2026_08_09_FEES: ImportFee[] = [
  {
    recordId: "fee-air-ppi-percent",
    lenderSlug: "air-bank",
    productSlug: "residential-mortgage",
    feeType: "insurance_repayment",
    amount: null,
    percentOfMonthlyPayment: 8.7,
    currency: "CZK",
    frequency: "monthly",
    description:
      "PPI cost = 8.7% of current/prescribed monthly mortgage payment (published). Not merged into nominal interest.",
    isMandatory: false,
    evidence: EV_AIR,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
  {
    recordId: "fee-moneta-ppi-percent",
    lenderSlug: "moneta",
    productSlug: "mortgage-housing",
    feeType: "insurance_repayment",
    amount: null,
    percentOfMonthlyPayment: 10.99,
    currency: "CZK",
    frequency: "monthly",
    description:
      "PPI cost = 10.99% of monthly payment (published). Not merged into nominal interest.",
    isMandatory: false,
    evidence: EV_MONETA,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
];

// ─── Representative examples ────────────────────────────────────────────────

export const CZ_2026_08_09_EXAMPLES: ImportRepresentativeExample[] = [
  {
    recordId: "moneta-rpsn-with-ppi",
    lenderSlug: "moneta",
    productSlug: "mortgage-housing",
    loanAmount: 2_500_000,
    termYears: 30,
    numberOfPayments: 360,
    fixationMonths: 36,
    nominalRate: 4.99,
    monthlyPayment: 13_405,
    insuranceIncluded: true,
    insuranceCost: 1_474,
    rpsn: 6.11,
    totalAmountPayable: 5_374_722,
    pricingScenarioKey: "with_repayment_insurance",
    linkedRateRecordId: "moneta-housing-3y",
    evidence: EV_MONETA_RPSN,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    rpsnCalculated: false,
  },
  {
    recordId: "moneta-rpsn-without-ppi",
    lenderSlug: "moneta",
    productSlug: "mortgage-housing",
    loanAmount: 2_500_000,
    termYears: 30,
    numberOfPayments: 360,
    fixationMonths: 36,
    nominalRate: 5.19,
    monthlyPayment: 13_712,
    insuranceIncluded: false,
    insuranceCost: null,
    rpsn: 5.33,
    totalAmountPayable: 4_953_903,
    pricingScenarioKey: "without_repayment_insurance",
    linkedRateRecordId: null,
    evidence: EV_MONETA_RPSN,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    rpsnCalculated: false,
  },
  {
    recordId: "rb-lower-payment-example",
    lenderSlug: "raiffeisenbank",
    productSlug: "hypoteka-s-nizsi-splatkou",
    loanAmount: 3_500_000,
    termYears: 20,
    fixationMonths: 36,
    nominalRate: 4.59,
    monthlyPayment: 13_388,
    rpsn: null,
    totalAmountPayable: null,
    insuranceCost: null,
    accountCost: null,
    includedFees: null,
    pricingScenarioKey: "interest_only_lower_payment_phase",
    linkedRateRecordId: null,
    evidence: EV_RB_LOWER_PAYMENT,
    checkedAt: CHECKED,
    // RPSN not published in supplied example → not IMPORT_READY
    auditStatus: "STRUCTURED",
    rpsnCalculated: false,
  },
  {
    recordId: "kb-product-page-representative-example",
    lenderSlug: "komercni-banka",
    productSlug: "standard-mortgage",
    loanAmount: 4_000_000,
    termYears: 30,
    numberOfPayments: 360,
    fixationMonths: 36,
    nominalRate: 5.19,
    monthlyPayment: 21_966,
    rpsn: 5.34,
    totalAmountPayable: 7_903_819.83,
    insuranceIncluded: null,
    insuranceCost: null,
    pricingScenarioKey: "product_page_advertised_from_conditional",
    linkedRateRecordId: "kb-product-page-advertised-from-5-19",
    evidence: EV_KB_PRODUCT,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    rpsnCalculated: false,
  },
];

/** Extra published payment figures for RB lower-payment example (not a rate variant). */
export const CZ_2026_08_09_RB_LOWER_PAYMENT_ANNUITY = {
  interestOnlyMonthlyPayment: 13_388,
  fullAnnuityMonthlyPayment: 22_313,
  note: "Attached only to Hypotéka s nižší splátkou example — not Klasik retail rate.",
} as const;

// ─── Eligibility rules (standalone) ─────────────────────────────────────────

export const CZ_2026_08_09_ELIGIBILITY = [
  {
    recordId: "elig-uc-foreign-income-residence",
    lenderSlug: "unicredit",
    productSlug: "purpose-mortgage",
    ruleCategory: "income",
    ruleCode: "foreign_income_or_residence",
    effect: "manual_assessment",
    description:
      "Mortgage treated as foreign-currency mortgage when at least one applicant has foreign-currency income or residence outside CZ; loan remains in CZK. No automatic rate change.",
    changesPricing: false,
    pricingEffectBp: null,
    evidence: EV_UC,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY" as const,
  },
  {
    recordId: "elig-rb-klasik-max-amount",
    lenderSlug: "raiffeisenbank",
    productSlug: "retail-klasik",
    ruleCategory: "regulatory",
    ruleCode: "max_amount",
    effect: "max_amount",
    description: "Max amount 20,000,000 CZK.",
    changesPricing: false,
    pricingEffectBp: null,
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED" as const,
  },
  {
    recordId: "elig-rb-klasik-max-ltv",
    lenderSlug: "raiffeisenbank",
    productSlug: "retail-klasik",
    ruleCategory: "regulatory",
    ruleCode: "max_ltv",
    effect: "max_ltv",
    description: "Max product LTV 90%. Not a rate pricing band.",
    changesPricing: false,
    pricingEffectBp: null,
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED" as const,
  },
  {
    recordId: "elig-rb-american-max-ltv",
    lenderSlug: "raiffeisenbank",
    productSlug: "american-mortgage",
    ruleCategory: "regulatory",
    ruleCode: "max_ltv",
    effect: "max_ltv",
    description: "Max product LTV 70%.",
    changesPricing: false,
    pricingEffectBp: null,
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED" as const,
  },
  {
    recordId: "elig-rb-business-turnover",
    lenderSlug: "raiffeisenbank",
    productSlug: "business-american-mortgage",
    ruleCategory: "income",
    ruleCode: "annual_turnover_300k_to_100m",
    effect: "eligible",
    description: "Annual turnover 300,000 to 100,000,000 CZK.",
    changesPricing: false,
    pricingEffectBp: null,
    evidence: EV_RB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED" as const,
  },
  {
    recordId: "elig-kb-american-max-ltv",
    lenderSlug: "komercni-banka",
    productSlug: "american-mortgage",
    ruleCategory: "regulatory",
    ruleCode: "max_ltv",
    effect: "max_ltv",
    description: "Max product LTV 70% (product eligibility — not rate LTV).",
    changesPricing: false,
    pricingEffectBp: null,
    evidence: EV_KB,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED" as const,
  },
];

// ─── HOLD rows ──────────────────────────────────────────────────────────────

export const CZ_2026_08_09_HOLD_ROWS: ImportHoldRow[] = [
  {
    recordId: "hold-csob-retail-rate-semantics",
    lenderSlug: "csob",
    productSlug: "retail-mortgage",
    reason:
      "ČSOB rate page LTV-point values captured as HOLD rate rows until fixation, rate_type semantics, and included conditions are fully evidenced.",
    auditStatus: "HOLD",
    evidence: EV_CSOB,
    checkedAt: CHECKED,
  },
  {
    recordId: "hold-rb-retail-klasik-rates",
    lenderSlug: "raiffeisenbank",
    productSlug: "retail-klasik",
    reason:
      "Do not generate ordinary retail Klasik rate variants from dynamic calculator data. Do not use 4.59% (lower-payment example) as Klasik.",
    auditStatus: "HOLD",
    evidence: EV_RB,
    checkedAt: CHECKED,
  },
  {
    recordId: "hold-cs-campaign-vs-oznameni",
    lenderSlug: "ceska-sporitelna",
    productSlug: "hypoteka-oznameni-fixed",
    reason:
      "SOURCE COLLISION: Oznámení fixation table (2y/3y od 4,94%) vs product-page headline od 5,09% without fixation — NEEDS_RECONCILIATION. Do not invent fixation for the headline.",
    auditStatus: "HOLD",
    evidence: EV_CS_CAMPAIGN_HOLD,
    checkedAt: CHECKED,
  },
];

// ─── Manifest ───────────────────────────────────────────────────────────────

export const CZ_2026_08_09_MANIFEST: MortgageMarketImportManifest = {
  manifestId: "cz-mortgage-market-2026-08-09",
  countryCode: "CZ",
  checkedAt: CHECKED,
  lenders: CZ_2026_08_09_LENDERS,
  products: CZ_2026_08_09_PRODUCTS,
  rates: CZ_2026_08_09_RATES,
  fees: CZ_2026_08_09_FEES,
  representativeExamples: CZ_2026_08_09_EXAMPLES,
  eligibilityRules: CZ_2026_08_09_ELIGIBILITY,
  evidence: CZ_2026_08_09_EVIDENCE,
  holdRows: CZ_2026_08_09_HOLD_ROWS,
};

export default CZ_2026_08_09_MANIFEST;
