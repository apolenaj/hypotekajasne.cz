/**
 * Additive partner-offer lenders not fully represented in the historical
 * cz-2026-08-09 audit (mBank rates + Oberbank presence).
 * Merged into the in-memory catalog used by /sazby + homepage.
 *
 * Verified 2026-09-28 against official sources (see evidence URLs).
 */

import type {
  ImportEvidence,
  ImportLender,
  ImportProduct,
  ImportRateRecord,
} from "@/lib/mortgage-market/import/types";

export const PARTNER_OFFER_EXT_CHECKED_AT = "2026-09-28T12:00:00.000Z";

const CHECKED = PARTNER_OFFER_EXT_CHECKED_AT;

function ev(
  evidenceId: string,
  lenderSlug: string,
  sourceName: string,
  documentTitle: string,
  sourceUrl: string,
  sourceType: ImportEvidence["sourceType"] = "official_lender_pdf"
): ImportEvidence {
  return {
    evidenceId,
    lenderSlug,
    sourceType,
    sourceName,
    documentTitle,
    sourceUrl,
    checkedAt: CHECKED,
    reliabilityTier: "primary",
  };
}

const EV_MBANK = ev(
  "ev-mbank-urokovy-listek-2026-09-22",
  "mbank",
  "mBank — Úrokový lístek č. 10/2026 (účinnost od 22. 9. 2026; ověřeno 28. 9. 2026)",
  "mBank úrokový lístek — mHypotéka",
  "https://www.mbank.cz/informace-k-produktum/urokovy-listek/osobni-finance/urokovy_listek_aktualni.pdf",
  "official_lender_pdf"
);

const EV_OBERBANK = ev(
  "ev-oberbank-hypotecni-uvery-2026-09-28",
  "oberbank",
  "Oberbank — Hypoteční úvěry product pages (no published numeric rate matrix; ověřeno 28. 9. 2026)",
  "Oberbank Hypoteční úvěry",
  "https://www.oberbank.cz/hypotecni-uvery",
  "official_lender_web"
);

export const PARTNER_OFFER_EXT_EVIDENCE: ImportEvidence[] = [
  EV_MBANK,
  EV_OBERBANK,
];

export const PARTNER_OFFER_EXT_LENDERS: ImportLender[] = [
  {
    recordId: "lender-mbank",
    slug: "mbank",
    name: "mBank",
    countryCode: "CZ",
    websiteUrl: "https://www.mbank.cz/",
    evidence: EV_MBANK,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
  },
  {
    recordId: "lender-oberbank",
    slug: "oberbank",
    name: "Oberbank",
    countryCode: "CZ",
    websiteUrl: "https://www.oberbank.cz/",
    evidence: EV_OBERBANK,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
    notes:
      "Product/eligibility verified. No public numeric rate sheet — inquiry-only display.",
  },
];

const LTV_LE_80: ImportRateRecord["ltv"] = {
  kind: "explicit",
  ltvMin: 0,
  ltvMax: 80,
  ltvMinExclusive: false,
  ltvMaxExclusive: false,
  provenance: "explicit_in_rate_source",
};

const LTV_GT80: ImportRateRecord["ltv"] = {
  kind: "explicit",
  ltvMin: 80,
  ltvMax: 100,
  ltvMinExclusive: true,
  ltvMaxExclusive: false,
  provenance: "explicit_in_rate_source",
};

export const PARTNER_OFFER_EXT_PRODUCTS: ImportProduct[] = [
  {
    recordId: "product-mbank-mhypoteka",
    lenderSlug: "mbank",
    slug: "mhypoteka-fixed",
    name: "mBank — mHypotéka s fixní sazbou",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    evidence: EV_MBANK,
    checkedAt: CHECKED,
    auditStatus: "IMPORT_READY",
    notes:
      "Rates from official Úrokový lístek effective 22. 9. 2026. Guaranteed for clients meeting contractual conditions per sheet.",
  },
  {
    recordId: "product-oberbank-standard",
    lenderSlug: "oberbank",
    slug: "standard-hypoteka",
    name: "Oberbank — StandardHypotéka",
    productType: "residential_purchase",
    borrowerScope: "natural_person",
    currency: "CZK",
    maxLtv: 80,
    minTermYears: 5,
    maxTermYears: 30,
    evidence: EV_OBERBANK,
    checkedAt: CHECKED,
    auditStatus: "VERIFIED",
    notes:
      "Eligibility publicly described; numeric rates not published — do not invent figures from stale representative PDFs.",
  },
];

function mbankRate(input: {
  id: string;
  years: number;
  rate: number;
  ltv: ImportRateRecord["ltv"];
  band: string;
}): ImportRateRecord {
  return {
    recordId: input.id,
    lenderSlug: "mbank",
    productSlug: "mhypoteka-fixed",
    financingPurpose: "purchase",
    fixationMonths: input.years * 12,
    nominalInterestRate: input.rate,
    rateType: "standard",
    pricingScenarioKey: `mhypoteka_fixed_${input.band}`,
    pricingScenarioLabel: `mHypotéka fixní sazba (${input.band}) — dle úrokového lístku`,
    ltv: input.ltv,
    conditions: [
      {
        conditionType: "other",
        conditionRole: "qualifying",
        description:
          "Sazby jsou dle úrokového lístku garantované při řádném splácení a plnění smluvních podmínek.",
        rateEffectBp: null,
        isRequired: true,
        isOptional: false,
        effectInferred: false,
      },
    ],
    evidence: EV_MBANK,
    checkedAt: CHECKED,
    validFrom: "2026-09-22",
    auditStatus: "IMPORT_READY",
  };
}

/** Official sheet: 1y / 3y / 5y × LTV do 80 % / nad 80 %. */
export const PARTNER_OFFER_EXT_RATES: ImportRateRecord[] = [
  mbankRate({
    id: "mbank-mhypoteka-1y-le80",
    years: 1,
    rate: 5.99,
    ltv: LTV_LE_80,
    band: "ltv_le_80",
  }),
  mbankRate({
    id: "mbank-mhypoteka-1y-gt80",
    years: 1,
    rate: 6.29,
    ltv: LTV_GT80,
    band: "ltv_gt80",
  }),
  mbankRate({
    id: "mbank-mhypoteka-3y-le80",
    years: 3,
    rate: 5.59,
    ltv: LTV_LE_80,
    band: "ltv_le_80",
  }),
  mbankRate({
    id: "mbank-mhypoteka-3y-gt80",
    years: 3,
    rate: 5.79,
    ltv: LTV_GT80,
    band: "ltv_gt80",
  }),
  mbankRate({
    id: "mbank-mhypoteka-5y-le80",
    years: 5,
    rate: 5.79,
    ltv: LTV_LE_80,
    band: "ltv_le_80",
  }),
  mbankRate({
    id: "mbank-mhypoteka-5y-gt80",
    years: 5,
    rate: 5.99,
    ltv: LTV_GT80,
    band: "ltv_gt80",
  }),
];
