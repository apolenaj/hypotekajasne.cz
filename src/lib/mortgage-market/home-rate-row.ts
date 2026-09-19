/**
 * Homepage rate rows.
 * Homepage and /sazby both keep the last verified figure.
 * A date older than 72 hours adds a warning; it does not drop the number.
 */

import { groupOffersByLenderProduct } from "@/lib/mortgage-market/group-offers";
import type { MortgageOffer } from "@/lib/mortgage-market/offers";
import { orientacniSazbaPrefix } from "@/lib/mortgage-market/public-rate-display";
import {
  fixationLabelCs,
  formatCheckedDateCs,
  formatRatePercentCs,
  hasPublicPrimaryEvidenceUrl,
  scenarioLabelCs,
} from "@/lib/mortgage-market/public-labels";
import { isPublicRateWithinFreshWindow } from "@/lib/rates/mortgage-rate-freshness";

export const HOME_RATE_UNAVAILABLE = "Sazba není dostupná";

export type HomeRateRow = {
  key: string;
  lenderSlug: string;
  lenderName: string;
  /** Set when the same bank has more than one product in this fixation. */
  productLabel: string | null;
  rateLabel: string;
  fixationLabel: string;
  conditionLabel: string;
  verifiedAtLabel: string | null;
  ageWarning: string | null;
  sourceUrl: string | null;
  showNumeric: boolean;
};

function conditionLabel(offer: MortgageOffer): string {
  const parts: string[] = [];
  if (offer.ltvScope === "explicit" && offer.ltvMax != null) {
    const min =
      offer.ltvMin != null && offer.ltvMin > 0 ? `${offer.ltvMin}–` : "do ";
    parts.push(`LTV ${min}${offer.ltvMax} %`);
  } else {
    parts.push("Pásmo LTV ve zdroji neuvedeno");
  }
  const scenario = scenarioLabelCs(offer);
  if (scenario && scenario !== "—") parts.push(scenario);
  return parts.join(" · ");
}

function sourceUrlOf(offer: MortgageOffer): string | null {
  const url = offer.evidence?.sourceUrl?.trim();
  return url && hasPublicPrimaryEvidenceUrl(url) ? url : null;
}

export function buildHomeRateRows(
  offers: MortgageOffer[],
  fixationMonths: number,
  nowMs: number = Date.now()
): HomeRateRow[] {
  const matching = offers.filter(
    (offer) => offer.fixationMonths === fixationMonths
  );
  const groups = groupOffersByLenderProduct(matching);
  const lenderCounts = new Map<string, number>();
  for (const group of groups) {
    lenderCounts.set(
      group.lenderSlug,
      (lenderCounts.get(group.lenderSlug) ?? 0) + 1
    );
  }

  return groups.map((group) => {
    const offer = group.scenarios[0]!;
    const verifiedAt = offer.checkedAt?.trim() || offer.evidence?.checkedAt?.trim() || null;
    const verifiedAtLabel = verifiedAt ? formatCheckedDateCs(verifiedAt) : null;
    const sourceUrl = sourceUrlOf(offer);
    const rate = offer.nominalInterestRate;
    const usable =
      verifiedAt != null &&
      Number.isFinite(rate) &&
      rate >= 0;
    const fresh = usable && isPublicRateWithinFreshWindow(verifiedAt, nowMs);
    const fromPrefix = orientacniSazbaPrefix(offer) === "Orientační sazba od";
    const rateLabel = usable
      ? `${fromPrefix ? "od " : ""}${formatRatePercentCs(rate)} % p. a.`
      : HOME_RATE_UNAVAILABLE;

    return {
      key: group.key,
      lenderSlug: group.lenderSlug,
      lenderName: group.lenderName,
      productLabel:
        (lenderCounts.get(group.lenderSlug) ?? 0) > 1
          ? group.productName
          : null,
      rateLabel,
      fixationLabel: `Fixace ${fixationLabelCs(fixationMonths)}`,
      conditionLabel: conditionLabel(offer),
      verifiedAtLabel,
      ageWarning:
        usable && !fresh && verifiedAtLabel
          ? `Poslední ověřená sazba ${verifiedAtLabel}. Aktuální platnost není potvrzena — údaj je starší než 72 hodin a není to aktuální osobní nabídka.`
          : null,
      sourceUrl,
      showNumeric: usable,
    };
  });
}
