/**
 * Central public display policy for verified mortgage rates.
 * Homepage and /sazby share this policy.
 * Percent values are stored as percent points (4.79), never as a ratio (0.0479).
 */

import type { MortgageOffer } from "@/lib/mortgage-market/offers";
import {
  formatCheckedDateCs,
  formatRatePercentCs,
  hasPublicPrimaryEvidenceUrl,
} from "@/lib/mortgage-market/public-labels";
import { isPublicRateWithinFreshWindow } from "@/lib/rates/mortgage-rate-freshness";

/** Only for an in-flight fetch. A finished page must not keep this copy. */
export const PUBLIC_RATE_LOADING_MESSAGE = "Načítáme sazbu";
export const PUBLIC_RATE_LAST_VERIFIED_BADGE = "Poslední ověřená sazba";
export const PUBLIC_RATE_UNVERIFIED_MESSAGE =
  "Veřejnou sazbu se nepodařilo ověřit";
export const PUBLIC_RATE_INDIVIDUAL_MESSAGE = "Individuální sazba";
export const PUBLIC_RATE_EXPIRED_MESSAGE = "Sazba podle zdroje pozbyla platnosti";

/** @deprecated Finished cards no longer use the old verifying placeholder. */
export const PUBLIC_RATE_VERIFYING_MESSAGE = PUBLIC_RATE_UNVERIFIED_MESSAGE;

export type PublicRateDisplayVisibility =
  | "hidden"
  | "unavailable"
  | "individual"
  | "expired"
  | "last_verified"
  | "published";

export type PublicRateDisplay = {
  visibility: PublicRateDisplayVisibility;
  showNumeric: boolean;
  /** e.g. "od 4,79 % p. a." */
  headline: string;
  badge: string;
  /** Set when the number is kept but current validity is not confirmed. */
  freshnessNote: string | null;
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

/** "od" prefix for advertised / minimum-from rows. */
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

function buildRateFigure(
  prefix: PublicRateDisplay["orientacniPrefix"],
  rate: number
): string {
  const from = prefix === "Orientační sazba od" ? "od " : "";
  return `${from}${formatRatePercentCs(rate)} % p. a.`;
}

function hasUsableNominalRate(rate: number): boolean {
  return Number.isFinite(rate) && rate > 0 && rate < 100;
}

function validToElapsed(
  validTo: string | null | undefined,
  nowMs: number
): boolean {
  if (!validTo?.trim()) return false;
  const t = Date.parse(validTo);
  return Number.isFinite(t) && t <= nowMs;
}

function isExplicitlyIndividual(
  offer: Pick<MortgageOffer, "pricingScenarioKey" | "pricingScenarioLabel">
): boolean {
  const key = offer.pricingScenarioKey ?? "";
  const label = offer.pricingScenarioLabel ?? "";
  return key.includes("individually_assessed") || /individuáln/i.test(label);
}

/**
 * A date older than 72 hours does not erase the last verified number.
 * The number stays, labelled apart from a freshly confirmed offer.
 * A failed refresh must not be represented by clearing the number here.
 */
export function evaluatePublicRateDisplay(
  offer: Pick<
    MortgageOffer,
    | "checkedAt"
    | "evidence"
    | "nominalInterestRate"
    | "rateType"
    | "pricingScenarioKey"
    | "pricingScenarioLabel"
    | "validTo"
  >,
  nowMs: number = Date.now()
): PublicRateDisplay {
  const lastVerifiedAt = resolveLastVerifiedAt(offer);
  const sourceUrl = resolveOfficialSourceUrl(offer);
  const prefix = orientacniSazbaPrefix(offer);
  const verifiedAtLabel = lastVerifiedAt
    ? formatCheckedDateCs(lastVerifiedAt)
    : null;
  const base = {
    verifiedAtLabel,
    sourceUrl,
    orientacniPrefix: prefix,
    freshnessNote: null as string | null,
  };

  if (!lastVerifiedAt || !sourceUrl) {
    return {
      ...base,
      visibility: "hidden",
      showNumeric: false,
      headline: PUBLIC_RATE_UNVERIFIED_MESSAGE,
      badge: PUBLIC_RATE_UNVERIFIED_MESSAGE,
    };
  }

  if (validToElapsed(offer.validTo, nowMs)) {
    return {
      ...base,
      visibility: "expired",
      showNumeric: false,
      headline: PUBLIC_RATE_EXPIRED_MESSAGE,
      badge: PUBLIC_RATE_EXPIRED_MESSAGE,
      freshnessNote: verifiedAtLabel
        ? `Platnost podle zdroje skončila. Naposledy ověřeno ${verifiedAtLabel}.`
        : "Platnost podle zdroje skončila.",
    };
  }

  if (!hasUsableNominalRate(offer.nominalInterestRate)) {
    if (isExplicitlyIndividual(offer)) {
      return {
        ...base,
        visibility: "individual",
        showNumeric: false,
        headline: PUBLIC_RATE_INDIVIDUAL_MESSAGE,
        badge: PUBLIC_RATE_INDIVIDUAL_MESSAGE,
      };
    }
    return {
      ...base,
      visibility: "unavailable",
      showNumeric: false,
      headline: PUBLIC_RATE_UNVERIFIED_MESSAGE,
      badge: PUBLIC_RATE_UNVERIFIED_MESSAGE,
    };
  }

  const headline = buildRateFigure(prefix, offer.nominalInterestRate);
  const fresh = isPublicRateWithinFreshWindow(lastVerifiedAt, nowMs);
  if (!fresh) {
    return {
      ...base,
      visibility: "last_verified",
      showNumeric: true,
      headline,
      badge: PUBLIC_RATE_LAST_VERIFIED_BADGE,
      freshnessNote: verifiedAtLabel
        ? `Aktuální platnost není potvrzena. Naposledy ověřeno ${verifiedAtLabel}. Údaj je starší než 72 hodin a není to aktuální osobní nabídka.`
        : "Aktuální platnost není potvrzena.",
    };
  }

  return {
    ...base,
    visibility: "published",
    showNumeric: true,
    headline,
    badge: verifiedAtLabel ? `Ověřeno ${verifiedAtLabel}` : "Ověřeno",
    freshnessNote: null,
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
        nominalInterestRate: 1,
        rateType: "standard",
        pricingScenarioKey: "listing_gate",
        pricingScenarioLabel: null,
        validTo: null,
      },
      nowMs
    ).visibility !== "hidden"
  );
}
