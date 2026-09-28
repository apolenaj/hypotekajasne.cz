/**
 * Canonical public offers for /sazby + /api/mortgage-market/offers.
 * Single SoT: partner-offer catalog (7 banks) — not Air Bank / MONETA market scan.
 */
import { getPartnerOfferCatalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { CZ_MANIFEST_CHECKED_AT } from "@/lib/mortgage-market/import/data/cz-2026-08-09";
import { PARTNER_OFFER_EXT_CHECKED_AT } from "@/lib/mortgage-market/partner-offer-extension";
import {
  compareRatesNullable,
  isPartnerOfferBankSlug,
  partnerOfferSortOrder,
} from "@/lib/mortgage-market/partner-offer-banks";
import {
  getMortgageOffers,
  type GetMortgageOffersQuery,
  type GetMortgageOffersResult,
  type MortgageOffer,
} from "@/lib/mortgage-market/offers";

const PARTNER_NOW_MS =
  Math.max(
    Date.parse(CZ_MANIFEST_CHECKED_AT),
    Date.parse(PARTNER_OFFER_EXT_CHECKED_AT)
  ) +
  12 * 60 * 60 * 1000;

function sortPartnerOffers(list: MortgageOffer[]): MortgageOffer[] {
  return list.sort((a, b) => {
    const byBank =
      partnerOfferSortOrder(a.lenderSlug) - partnerOfferSortOrder(b.lenderSlug);
    if (byBank !== 0) return byBank;
    const byRate = compareRatesNullable(
      a.nominalInterestRate,
      b.nominalInterestRate
    );
    if (byRate !== 0) return byRate;
    return a.productSlug.localeCompare(b.productSlug);
  });
}

export function getPublishedCatalogOffers(
  query: Omit<GetMortgageOffersQuery, "nowMs" | "countryCode"> & {
    countryCode?: string;
  }
): GetMortgageOffersResult {
  const result = getMortgageOffers(getPartnerOfferCatalog(), {
    countryCode: query.countryCode ?? "CZ",
    purpose: query.purpose,
    fixationMonths: query.fixationMonths,
    ltv: query.ltv,
    lenderSlug: query.lenderSlug,
    productSlug: query.productSlug,
    productType: query.productType,
    borrowerScope: query.borrowerScope,
    pricingScenarioKey: query.pricingScenarioKey,
    includeLtvUnspecified: query.includeLtvUnspecified,
    activeOnly: query.activeOnly,
    nowMs: PARTNER_NOW_MS,
  });

  const offers = sortPartnerOffers(
    result.offers.filter((o) => isPartnerOfferBankSlug(o.lenderSlug))
  );
  const unspecifiedLtvOffers = sortPartnerOffers(
    result.unspecifiedLtvOffers.filter((o) =>
      isPartnerOfferBankSlug(o.lenderSlug)
    )
  );
  const lenderAvailability = result.lenderAvailability
    .filter((a) => isPartnerOfferBankSlug(a.lenderSlug))
    .sort(
      (a, b) =>
        partnerOfferSortOrder(a.lenderSlug) - partnerOfferSortOrder(b.lenderSlug)
    );

  return {
    ...result,
    offers,
    unspecifiedLtvOffers,
    lenderAvailability,
  };
}
