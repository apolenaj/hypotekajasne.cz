/**
 * Human Czech labels for public mortgage-market UX.
 * Never expose raw DB enums / technical keys.
 */

import type { MortgageOffer } from "@/lib/mortgage-market/offers";
import type { RateFreshness } from "@/lib/rates/mortgage-rate-freshness";

export function formatRatePercentCs(rate: number): string {
  return rate.toLocaleString("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCheckedDateCs(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString("cs-CZ");
}

/** Public freshness — never “LIVE” merely because a row exists. */
export function publicFreshnessLabel(
  freshness: Exclude<RateFreshness, "fallback">,
  checkedAt: string | null | undefined
): { short: string; detail: string } {
  const date = formatCheckedDateCs(checkedAt);
  if (freshness === "stale") {
    return {
      short: "Aktualizujeme",
      detail: date ? `Aktualizujeme · naposledy ověřeno ${date}` : "Aktualizujeme",
    };
  }
  return {
    short: date ? `Ověřeno ${date}` : "Ověřeno",
    detail: date ? `Ověřeno ${date}` : "Ověřeno",
  };
}

export function scenarioLabelCs(offer: Pick<
  MortgageOffer,
  "pricingScenarioKey" | "pricingScenarioLabel"
>): string {
  const key = offer.pricingScenarioKey;
  if (key === "with_repayment_insurance") return "s pojištěním";
  if (key === "without_repayment_insurance") return "bez pojištění";
  if (key.includes("with_ppi") || key.includes("with_repayment"))
    return "s pojištěním";
  if (key.includes("without_ppi") || key.includes("without_repayment"))
    return "bez pojištění";
  if (key.startsWith("oznameni")) return "oficiální sazebník";
  if (key.includes("housing_published")) return "zveřejněná sazba bydlení";
  if (key.includes("minimum_rate")) return "Minimální sazba dle sazebníku";
  if (key.includes("product_page_advertised") || key.includes("advertised_from_conditional"))
    return "Zvýhodněná sazba od";
  if (key.includes("advertised")) return "Zvýhodněná sazba od";
  if (offer.pricingScenarioLabel) {
    const label = offer.pricingScenarioLabel;
    // Skip English audit labels in public UI
    if (/[A-Za-z]{4,}/.test(label.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s%0-9.,\-–]/g, ""))) {
      return "zveřejněná sazba";
    }
    return label;
  }
  return "zveřejněná sazba";
}

export function fixationLabelCs(months: number | null | undefined): string {
  if (months == null) return "fixace neuvedena";
  if (months % 12 === 0) {
    const y = months / 12;
    if (y === 1) return "1 rok";
    if (y >= 2 && y <= 4) return `${y} roky`;
    return `${y} let`;
  }
  return `${months} měs.`;
}

export function purposeLabelCs(purpose: string | null | undefined): string {
  switch (purpose) {
    case "purchase":
      return "Koupě";
    case "refinance":
      return "Refinancování";
    case "investment":
      return "Investice";
    case "non_purpose":
      return "Americká hypotéka";
    case "business":
      return "Podnikání";
    default:
      return "Obecně";
  }
}

export function rateTypeLabelCs(rateType: string): string {
  switch (rateType) {
    case "standard":
      return "Standardní sazba";
    case "advertised_from":
      return "Sazba od (inzerovaná)";
    case "minimum":
      return "Minimální sazba";
    default:
      return "Zveřejněná sazba";
  }
}

/** Explicit LTV band → short Czech. Unknown → never “matches your LTV”. */
export function ltvScopeLabelCs(offer: Pick<
  MortgageOffer,
  | "ltvScope"
  | "ltvMin"
  | "ltvMax"
  | "ltvMinExclusive"
  | "ltvMaxExclusive"
  | "claimsPersonalizedLtvMatch"
>): { headline: string; isPersonalizedMatch: boolean } {
  if (offer.ltvScope === "unspecified") {
    return {
      headline: "LTV pásmo sazby neuvedeno",
      isPersonalizedMatch: false,
    };
  }
  const min = offer.ltvMin;
  const max = offer.ltvMax;
  if (min == null || max == null) {
    return {
      headline: "LTV pásmo sazby neuvedeno",
      isPersonalizedMatch: false,
    };
  }

  let headline: string;
  if (!offer.ltvMinExclusive && min === 0 && !offer.ltvMaxExclusive) {
    headline = `Pro LTV do ${max} %`;
  } else if (offer.ltvMinExclusive && !offer.ltvMaxExclusive) {
    headline = `Pro LTV nad ${min} % do ${max} %`;
  } else {
    const left = offer.ltvMinExclusive ? `nad ${min}` : `od ${min}`;
    const right = offer.ltvMaxExclusive ? `pod ${max}` : `do ${max}`;
    headline = `Pro LTV ${left} % ${right} %`;
  }

  return {
    headline,
    isPersonalizedMatch: offer.claimsPersonalizedLtvMatch === true,
  };
}

export function conditionTypeLabelCs(conditionType: string): string {
  switch (conditionType) {
    case "repayment_insurance":
      return "Pojištění schopnosti splácet";
    case "no_insurance":
      return "Bez pojištění schopnosti splácet";
    case "active_account_required":
      return "Aktivní účet";
    case "income_domiciliation_required":
    case "salary_account_required":
      return "Příjmy na účet u banky";
    case "life_insurance":
    case "life_insurance_required":
      return "Životní pojištění";
    case "property_insurance":
    case "property_insurance_required":
      return "Pojištění nemovitosti";
    case "green_property_required":
    case "PENB_class_requirement":
      return "PENB energetická třída";
    case "loyalty":
      return "Věrnostní podmínka";
    default:
      return "Podmínka sazby";
  }
}

/** Explicit discount only — NULL effect never invented. */
export function conditionEffectLabelCs(
  rateEffectBp: number | null | undefined
): string | null {
  if (rateEffectBp == null || !Number.isFinite(rateEffectBp)) return null;
  if (rateEffectBp === 0) return null;
  const pp = Math.abs(rateEffectBp) / 100;
  const ppLabel = pp.toLocaleString("cs-CZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (rateEffectBp < 0) return `sleva ${ppLabel} p.b.`;
  return `příplatek ${ppLabel} p.b.`;
}

export function sourceTypeLabelCs(sourceType: string): string {
  switch (sourceType) {
    case "official_lender_web":
    case "official_rate_page":
      return "Oficiální web banky";
    case "official_lender_pdf":
    case "official_tariff":
      return "Oficiální sazebník banky";
    case "official_terms":
      return "Oficiální podmínky banky";
    default:
      return "Zveřejněný zdroj banky";
  }
}
