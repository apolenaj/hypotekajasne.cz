/**
 * NORMALIZE — ScrapedBankRate → MortgageProduct[] (bez inventury sazeb).
 */

import type { ScrapedBankRate } from "@/lib/scrape/bank-scrapers";
import { buildProductId, hashPayload } from "@/lib/mortgage-pipeline/hash";
import { stripInvalidApr } from "@/lib/mortgage-pipeline/rpsn";
import type {
  MortgageProduct,
  RawMortgageIngest,
} from "@/lib/mortgage-pipeline/types";

function baseProduct(
  scraped: ScrapedBankRate,
  scrapedAt: string,
  opts: {
    productName: string;
    productType: MortgageProduct["productType"];
    purpose: MortgageProduct["purpose"];
    rate: number | null;
    apr: number | null;
    example: string | null;
    requiredInsurance: boolean | null;
    sourceUrl: string | null;
    sourceType: MortgageProduct["sourceType"];
    status: MortgageProduct["status"];
    confidence: number;
  }
): MortgageProduct {
  const rawSnapshotHash = hashPayload({
    bank: scraped.id,
    productName: opts.productName,
    rate: opts.rate,
    apr: opts.apr,
    example: opts.example,
    sourceUrl: opts.sourceUrl,
    scrapedAt,
  });

  const id = buildProductId({
    country: "cz",
    lender: scraped.bankName,
    productName: opts.productName,
    productType: opts.productType,
    purpose: opts.purpose,
    fixation: 5,
    requiredInsurance: opts.requiredInsurance,
  });

  return stripInvalidApr({
    id,
    country: "cz",
    lender: scraped.bankName,
    productName: opts.productName,
    productType: opts.productType,
    purpose: opts.purpose,
    residency: "resident",
    currency: "CZK",
    rateType: "fixed",
    fixation: 5,
    ltvMin: null,
    ltvMax: null,
    loanAmountMin: null,
    loanAmountMax: null,
    termMin: null,
    termMax: null,
    nominalRateFrom: opts.rate,
    representativeAPR: opts.apr,
    representativeExample: opts.example,
    requiredAccount: null,
    requiredInsurance: opts.requiredInsurance,
    fees: [],
    sourceUrl: opts.sourceUrl,
    sourceType: opts.sourceType,
    validFrom: scrapedAt,
    scrapedAt,
    verifiedAt: null,
    status: opts.status,
    confidence: opts.confidence,
    rawSnapshotHash,
  });
}

/**
 * Mapuje ověřený scrape na produkty.
 * RPSN jen pokud máme hodnotu + můžeme sestavit reprezentativní příklad ze zdroje;
 * jinak APR = null (UI: Na vyžádání).
 */
export function normalizeScrapedBank(
  scraped: ScrapedBankRate,
  scrapedAt: string
): { raw: RawMortgageIngest; products: MortgageProduct[] } {
  const isKb = scraped.id === "komercni-banka";
  const sourceType = isKb ? "insider" : "official_bank";
  const status = isKb ? "PARTNER_QUOTE" : "LIVE";
  const confidence = isKb ? 0.9 : 0.85;

  const raw: RawMortgageIngest = {
    lender: scraped.bankName,
    sourceUrl: scraped.sourceUrl,
    sourceType,
    scrapedAt,
    payload: { ...scraped },
  };

  const products: MortgageProduct[] = [];

  const classicExample =
    scraped.rpsnWithInsurance != null && scraped.sourceUrl
      ? `Reprezentativní RPSN ${scraped.rpsnWithInsurance.toFixed(2)} % dle zdroje banky (${scraped.sourceUrl}). Individuální RPSN se liší.`
      : null;

  if (scraped.rateWithInsurance != null) {
    products.push(
      baseProduct(scraped, scrapedAt, {
        productName: "Hypotéka — klasická (s pojištěním)",
        productType: "classic",
        purpose: "any",
        rate: scraped.rateWithInsurance,
        apr: scraped.rpsnWithInsurance,
        example: classicExample,
        requiredInsurance: true,
        sourceUrl: scraped.sourceUrl,
        sourceType,
        status,
        confidence,
      })
    );
  }

  // Bez pojištění: jen reálná sazba (ne inventura). Orientační +0.3 = MODELLED.
  if (scraped.rateWithoutInsurance != null) {
    const withoutEstimated =
      scraped.withoutInsuranceEstimated === true &&
      scraped.id !== "unicredit-bank" &&
      scraped.id !== "komercni-banka";

    const withoutExample =
      scraped.rpsnWithoutInsurance != null &&
      scraped.sourceUrl &&
      !withoutEstimated
        ? `Reprezentativní RPSN ${scraped.rpsnWithoutInsurance.toFixed(2)} % dle zdroje (${scraped.sourceUrl}).`
        : null;

    products.push(
      baseProduct(scraped, scrapedAt, {
        productName: "Hypotéka — klasická (bez pojištění)",
        productType: "classic",
        purpose: "any",
        rate: scraped.rateWithoutInsurance,
        apr: withoutEstimated ? null : scraped.rpsnWithoutInsurance,
        example: withoutExample,
        requiredInsurance: false,
        sourceUrl: scraped.sourceUrl,
        sourceType: withoutEstimated ? "unknown" : sourceType,
        status: withoutEstimated ? "MODELLED" : status,
        confidence: withoutEstimated ? 0.45 : confidence,
      })
    );
  }

  if (scraped.americanRateWithInsurance != null) {
    const amExample =
      scraped.americanRpsnWithInsurance != null &&
      (scraped.americanSourceUrl || scraped.sourceUrl)
        ? `Reprezentativní RPSN ${scraped.americanRpsnWithInsurance.toFixed(2)} % (americká hypotéka).`
        : null;

    products.push(
      baseProduct(scraped, scrapedAt, {
        productName: "Americká hypotéka (s pojištěním)",
        productType: "american",
        purpose: "unsecured_equity",
        rate: scraped.americanRateWithInsurance,
        apr: scraped.americanRpsnWithInsurance,
        example: amExample,
        requiredInsurance: true,
        sourceUrl: scraped.americanSourceUrl ?? scraped.sourceUrl,
        sourceType: "aggregator",
        status: "LIVE",
        confidence: 0.75,
      })
    );
  }

  return { raw, products };
}

export function normalizeAllScraped(
  rows: ScrapedBankRate[],
  scrapedAt: string
): { raw: RawMortgageIngest[]; products: MortgageProduct[] } {
  const raw: RawMortgageIngest[] = [];
  const products: MortgageProduct[] = [];
  for (const row of rows) {
    const n = normalizeScrapedBank(row, scrapedAt);
    raw.push(n.raw);
    products.push(...n.products);
  }
  return { raw, products };
}
