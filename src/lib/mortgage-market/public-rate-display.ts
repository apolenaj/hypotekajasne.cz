/**
 * Central public display policy for verified mortgage rates on /sazby.
 * Single source of truth for freshness, eligibility, and Czech headline labels.
 */

import type { MortgageOffer } from "@/lib/mortgage-market/offers";
import {
  formatCheckedDateCs,
  formatRatePercentCs,
  hasPublicPrimaryEvidenceUrl,
} from "@/lib/mortgage-market/public-labels";
import { isPublicRateWithinFreshWindow } from "@/lib/rates/mortgage-rate-freshness";

export const PUBLIC_RATE_VERIFYING_MESSAGE = "Sazbu právě ověřujeme";

export type PublicRateDisplayVisibility = "hidden" | "verifying" | "published";

export type PublicRateDisplay = {
  visibility: PublicRateDisplayVisibility;
  showNumeric: boolean;
  /** e.g. "Orientační sazba od 4,79 %" or verifying message */
  headline: string;
  badge: string;
  verifiedAtLabel: string | null;
  sourceUrl: string | null;
  orientacniPrefix: "Orientační sazba" | "Orientační sazba od";
};

function resolveLastVerifiedAt(offer: Pick<MortgageOffer, "checkedAt" | "evidence">): string | null {
  const fromRate = offer.checkedAt?.trim();
  if (fromRate) return fromRate;
  const fromEvidence = offer.evidence?.checkedAt?.trim();
  return fromEvidence || null;
}

function resolveOfficialSourceUrl(
  offer: Pick<MortgageOffer, "evidence">
): string | null {
  const url = offer.evidence?.sourceUrl?.trim();
  if (!url || !hasPublicPrimaryEvidenceUrl(url)) return null;
  return url;
}

/** "Orientační sazba od" for advertised/minimum-from rows; plain label otherwise. */
export function orientacniSazbaPrefix(
  offer: Pick<MortgageOffer, "rateType" | "pricingScenarioKey">
): "Orientační sazba" | "Orientační sazba od" {
  if (offer.rateType === "advertised_from") return "Orientační sazba od";
  const key = offer.pricingScenarioKey;
  if (
    key.includes("advertised") ||
    key.includes("minimum_rate") ||
    key.includes("product_page_advertised")
  ) {
    return "Orientační sazba od";
  }
  return "Orientační sazba";
}

function buildPublishedHeadline(
  prefix: PublicRateDisplay["orientacniPrefix"],
  rate: number
): string {
  return `${prefix} ${formatRatePercentCs(rate)} %`;
}

/**
 * Evaluate how a mortgage offer may appear on the public /sazby page.
 * - hidden: missing lastVerifiedAt or HTTPS official source — never list publicly
 * - verifying: source present but checked_at older than 72h — no numeric rate
 * - published: fresh verified rate with numeric value
 */
export function evaluatePublicRateDisplay(
  offer: Pick<
    MortgageOffer,
    | "checkedAt"
    | "evidence"
    | "nominalInterestRate"
    | "rateType"
    | "pricingScenarioKey"
  >,
  nowMs: number = Date.now()
): PublicRateDisplay {
  const lastVerifiedAt = resolveLastVerifiedAt(offer);
  const sourceUrl = resolveOfficialSourceUrl(offer);
  const prefix = orientacniSazbaPrefix(offer);
  const verifiedAtLabel = lastVerifiedAt
    ? formatCheckedDateCs(lastVerifiedAt)
    : null;

  if (!lastVerifiedAt || !sourceUrl) {
    return {
      visibility: "hidden",
      showNumeric: false,
      headline: PUBLIC_RATE_VERIFYING_MESSAGE,
      badge: PUBLIC_RATE_VERIFYING_MESSAGE,
      verifiedAtLabel,
      sourceUrl,
      orientacniPrefix: prefix,
    };
  }

  const fresh = isPublicRateWithinFreshWindow(lastVerifiedAt, nowMs);
  if (!fresh) {
    return {
      visibility: "verifying",
      showNumeric: false,
      headline: PUBLIC_RATE_VERIFYING_MESSAGE,
      badge: PUBLIC_RATE_VERIFYING_MESSAGE,
      verifiedAtLabel,
      sourceUrl,
      orientacniPrefix: prefix,
    };
  }

  const headline = buildPublishedHeadline(prefix, offer.nominalInterestRate);
  const badge = verifiedAtLabel
    ? `Ověřeno ${verifiedAtLabel}`
    : "Ověřeno";

  return {
    visibility: "published",
    showNumeric: true,
    headline,
    badge,
    verifiedAtLabel,
    sourceUrl,
    orientacniPrefix: prefix,
  };
}

/** Offers without verified_at or official HTTPS source must not appear on /sazby. */
export function isPubliclyListableMortgageOffer(
  offer: Pick<MortgageOffer, "checkedAt" | "evidence">,
  nowMs: number = Date.now()
): boolean {
  return (
    evaluatePublicRateDisplay(
      {
        ...offer,
        nominalInterestRate: 0,
        rateType: "standard",
        pricingScenarioKey: "listing_gate",
      },
      nowMs
    ).visibility !== "hidden"
  );
}
