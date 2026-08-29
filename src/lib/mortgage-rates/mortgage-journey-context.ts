/**
 * Single source of truth for mortgage calculator → /sazby → lead context.
 * URL param names, parse/serialize, validation, and lead metadata stay aligned.
 */

import {
  buildLtvContext,
  roundExactLtv,
  type LtvContext,
} from "@/lib/mortgage-rates/ltv-context";

export const MORTGAGE_JOURNEY_TERM_OPTIONS = [10, 15, 20, 25, 30] as const;
export const MORTGAGE_JOURNEY_FIXATION_OPTIONS = [24, 36, 60, 84, 120] as const;

export type MortgageJourneyPurpose = "purchase" | "refinance";

/** @deprecated Prefer MortgageJourneyCore */
export type SazbyRatesQuery = MortgageJourneyCore;

export type MarketingAttributionParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
};

export type MortgageJourneyCore = {
  purpose: MortgageJourneyPurpose;
  fixationMonths: number;
  propertyValueCzk: number;
  ownFundsCzk: number;
  loanAmountCzk: number;
  termYears: number;
  /** Model rate from calculator — not used for bank offer filtering. */
  modelRatePercent?: number;
};

export type MortgageJourneyContext = MortgageJourneyCore & MarketingAttributionParams;

export const SAZBY_DEFAULT_QUERY: MortgageJourneyCore = {
  purpose: "purchase",
  fixationMonths: 36,
  propertyValueCzk: 6_000_000,
  ownFundsCzk: 1_500_000,
  loanAmountCzk: 4_500_000,
  termYears: 30,
};

export type MortgageJourneyParseResult = {
  context: MortgageJourneyContext;
  ltvContext: LtvContext;
  /** Bare /sazby without mortgage params — intentional defaults. */
  fromDefaults: boolean;
  /** Legacy `ltv=` query was used to derive property/loan. */
  fromLegacyLtv: boolean;
  /** User-visible issues from malformed URL params. */
  paramErrors: string[];
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const CLICK_ID_KEYS = ["gclid", "fbclid", "msclkid"] as const;

const MARKETING_KEYS = [...UTM_KEYS, ...CLICK_ID_KEYS] as const;

const PII_PARAM_KEYS = [
  "name",
  "email",
  "phone",
  "telefon",
  "jmeno",
  "message",
  "notes",
] as const;

const MORTGAGE_PARAM_KEYS = [
  "purpose",
  "fixationMonths",
  "property",
  "loan",
  "equity",
  "termYears",
  "modelRate",
  "ltv",
] as const;

function sanitizeMarketingToken(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim().slice(0, 120);
  if (trimmed.length < 1) return undefined;
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return undefined;
  return trimmed.toLowerCase();
}

function parsePositiveInt(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const value = Number(raw.replace(/\s/g, ""));
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

function parseOptionalRate(raw: string | undefined): number | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const normalized = raw.trim().replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0 || value > 25) return undefined;
  return Math.round(value * 100) / 100;
}

function parsePurpose(raw: string | undefined): MortgageJourneyPurpose {
  return raw === "refinance" ? "refinance" : "purchase";
}

function hasMortgageParams(raw: Record<string, string | undefined>): boolean {
  return MORTGAGE_PARAM_KEYS.some((key) => {
    const value = raw[key];
    return value != null && value.trim() !== "";
  });
}

function parseMarketing(raw: Record<string, string | undefined>): MarketingAttributionParams {
  const marketing: MarketingAttributionParams = {};
  for (const key of MARKETING_KEYS) {
    const value = sanitizeMarketingToken(raw[key]);
    if (value) marketing[key] = value;
  }
  return marketing;
}

function deriveOwnFunds(
  propertyValueCzk: number,
  loanAmountCzk: number,
  equityRaw: string | undefined
): { ownFundsCzk: number; error: string | null } {
  const equity = parsePositiveInt(equityRaw);
  if (equityRaw != null && equityRaw.trim() !== "" && equity == null) {
    return {
      ownFundsCzk: Math.max(0, propertyValueCzk - loanAmountCzk),
      error: "Neplatná hodnota vlastních prostředků v odkazu. Zadejte částku znovu.",
    };
  }
  if (equity != null) {
    if (equity > propertyValueCzk) {
      return {
        ownFundsCzk: equity,
        error: "Vlastní prostředky v odkazu přesahují hodnotu nemovitosti.",
      };
    }
    const impliedLoan = propertyValueCzk - equity;
    if (Math.abs(impliedLoan - loanAmountCzk) > 1) {
      return {
        ownFundsCzk: equity,
        error:
          "Parametry v odkazu si odporují (nemovitost, úvěr a vlastní prostředky). Upravte hodnoty.",
      };
    }
    return { ownFundsCzk: equity, error: null };
  }
  return {
    ownFundsCzk: Math.max(0, propertyValueCzk - loanAmountCzk),
    error: null,
  };
}

/** Parse full journey context from URL search params (server + client safe). */
export function parseMortgageJourneyParams(
  raw: Record<string, string | undefined>
): MortgageJourneyParseResult {
  const marketing = parseMarketing(raw);
  const paramErrors: string[] = [];

  for (const key of PII_PARAM_KEYS) {
    if (raw[key]?.trim()) {
      paramErrors.push(
        "Odkaz obsahuje nepodporované parametry. Osobní údaje do URL nepatří — zadejte je až ve formuláři."
      );
      break;
    }
  }

  if (!hasMortgageParams(raw)) {
    const context: MortgageJourneyContext = { ...SAZBY_DEFAULT_QUERY, ...marketing };
    return {
      context,
      ltvContext: buildLtvContext(context),
      fromDefaults: true,
      fromLegacyLtv: false,
      paramErrors,
    };
  }

  const purpose = parsePurpose(raw.purpose);
  let fromLegacyLtv = false;

  let propertyValueCzk = parsePositiveInt(raw.property);
  let loanAmountCzk = parsePositiveInt(raw.loan);

  if (raw.property?.trim() && propertyValueCzk == null) {
    paramErrors.push("Neplatná hodnota nemovitosti v odkazu. Zadejte cenu znovu.");
  }
  if (raw.loan?.trim() && loanAmountCzk == null) {
    paramErrors.push("Neplatná výše úvěru v odkazu. Zadejte částku znovu.");
  }

  if (propertyValueCzk == null || loanAmountCzk == null) {
    const legacyLtv = Number(raw.ltv?.replace(",", "."));
    if (Number.isFinite(legacyLtv) && legacyLtv > 0 && legacyLtv <= 100) {
      fromLegacyLtv = true;
      propertyValueCzk = 10_000_000;
      loanAmountCzk = roundExactLtv((propertyValueCzk * legacyLtv) / 100);
    }
  }

  if (propertyValueCzk == null || loanAmountCzk == null) {
    paramErrors.push(
      "Odkaz neobsahuje platné parametry výpočtu. Zadejte hodnotu nemovitosti a výši úvěru."
    );
    const context: MortgageJourneyContext = { ...SAZBY_DEFAULT_QUERY, ...marketing };
    return {
      context,
      ltvContext: buildLtvContext(context),
      fromDefaults: false,
      fromLegacyLtv,
      paramErrors,
    };
  }

  if (loanAmountCzk > propertyValueCzk) {
    paramErrors.push("Úvěr v odkazu nesmí být vyšší než hodnota nemovitosti.");
  }

  const ownFundsResult = deriveOwnFunds(propertyValueCzk, loanAmountCzk, raw.equity);
  if (ownFundsResult.error) paramErrors.push(ownFundsResult.error);

  const fixationRaw = raw.fixationMonths;
  let fixationMonths = Number(fixationRaw ?? SAZBY_DEFAULT_QUERY.fixationMonths);
  if (
    fixationRaw != null &&
    fixationRaw.trim() !== "" &&
    !(MORTGAGE_JOURNEY_FIXATION_OPTIONS as readonly number[]).includes(fixationMonths)
  ) {
    paramErrors.push("Neplatná fixace v odkazu. Vyberte fixaci znovu.");
    fixationMonths = SAZBY_DEFAULT_QUERY.fixationMonths;
  }

  const termRaw = raw.termYears;
  let termYears = Number(termRaw ?? SAZBY_DEFAULT_QUERY.termYears);
  if (
    termRaw != null &&
    termRaw.trim() !== "" &&
    !(MORTGAGE_JOURNEY_TERM_OPTIONS as readonly number[]).includes(termYears)
  ) {
    paramErrors.push("Neplatná doba splácení v odkazu. Zadejte dobu znovu.");
    termYears = SAZBY_DEFAULT_QUERY.termYears;
  }

  const modelRatePercent = parseOptionalRate(raw.modelRate);
  if (raw.modelRate?.trim() && modelRatePercent == null) {
    paramErrors.push("Neplatná modelová sazba v odkazu — bude ignorována.");
  }

  const context: MortgageJourneyContext = {
    purpose,
    fixationMonths,
    propertyValueCzk,
    ownFundsCzk: ownFundsResult.ownFundsCzk,
    loanAmountCzk,
    termYears,
    ...(modelRatePercent != null ? { modelRatePercent } : {}),
    ...marketing,
  };

  const ltvContext = buildLtvContext(context);
  if (ltvContext.validationError && !paramErrors.includes(ltvContext.validationError)) {
    paramErrors.push(ltvContext.validationError);
  }

  return {
    context,
    ltvContext,
    fromDefaults: false,
    fromLegacyLtv,
    paramErrors: [...new Set(paramErrors)],
  };
}

/** Serialize mortgage + marketing params for /sazby URLs. */
export function serializeMortgageJourneyParams(
  context: MortgageJourneyContext,
  options?: {
    /** Preserve marketing keys from an existing query (e.g. current page). */
    preserveMarketingFrom?: Record<string, string | undefined> | URLSearchParams;
  }
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("purpose", context.purpose);
  params.set("fixationMonths", String(context.fixationMonths));
  params.set("property", String(Math.round(context.propertyValueCzk)));
  params.set("loan", String(Math.round(context.loanAmountCzk)));
  params.set("equity", String(Math.round(context.ownFundsCzk)));
  params.set("termYears", String(context.termYears));
  if (context.modelRatePercent != null && Number.isFinite(context.modelRatePercent)) {
    params.set("modelRate", String(context.modelRatePercent));
  }

  const preserved = options?.preserveMarketingFrom;
  const preservedRecord: Record<string, string | undefined> =
    preserved instanceof URLSearchParams
      ? Object.fromEntries(preserved.entries())
      : (preserved ?? {});

  const marketingSource: MarketingAttributionParams = {
    ...parseMarketing(preservedRecord),
    ...pickMarketing(context),
  };

  for (const [key, value] of Object.entries(marketingSource)) {
    if (value) params.set(key, value);
  }

  return params;
}

function pickMarketing(context: MortgageJourneyContext): MarketingAttributionParams {
  const out: MarketingAttributionParams = {};
  for (const key of MARKETING_KEYS) {
    const value = context[key];
    if (value) out[key] = value;
  }
  return out;
}

export function mergeMarketingFromSearch(
  context: MortgageJourneyContext,
  search: string | URLSearchParams
): MortgageJourneyContext {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const raw = Object.fromEntries(params.entries());
  return { ...context, ...parseMarketing(raw) };
}

export function buildMortgageJourneyHref(
  context: MortgageJourneyContext,
  options?: {
    basePath?: string;
    preserveMarketingFrom?: Record<string, string | undefined> | URLSearchParams;
  }
): string {
  const basePath = options?.basePath ?? "/sazby";
  const params = serializeMortgageJourneyParams(context, options);
  return `${basePath}?${params.toString()}`;
}

/** Deep link back to hypoteční kalkulačka with preserved journey params. */
export function buildCalculatorHref(
  context: MortgageJourneyContext,
  options?: {
    preserveMarketingFrom?: Record<string, string | undefined> | URLSearchParams;
  }
): string {
  return buildMortgageJourneyHref(context, {
    basePath: "/kalkulacky/hypotecni",
    ...options,
  });
}

export function journeyCoreEqual(
  a: MortgageJourneyCore,
  b: MortgageJourneyCore
): boolean {
  return (
    a.purpose === b.purpose &&
    a.fixationMonths === b.fixationMonths &&
    a.propertyValueCzk === b.propertyValueCzk &&
    a.ownFundsCzk === b.ownFundsCzk &&
    a.loanAmountCzk === b.loanAmountCzk &&
    a.termYears === b.termYears &&
    (a.modelRatePercent ?? null) === (b.modelRatePercent ?? null)
  );
}

/** Lead + analytics metadata from journey context (no PII). */
export function buildLeadMetadataFromJourney(
  context: MortgageJourneyContext,
  ltvContext: LtvContext,
  extras?: Record<string, unknown>
): Record<string, unknown> {
  const marketing = pickMarketing(context);
  return {
    purpose: context.purpose,
    fixationMonths: context.fixationMonths,
    termYears: context.termYears,
    propertyValue: context.propertyValueCzk,
    ownFunds: context.ownFundsCzk,
    mortgageAmount: context.loanAmountCzk,
    exactLtv: ltvContext.exactLtv,
    ltvBand: ltvContext.ltvBand,
    ltvPct: ltvContext.exactLtv,
    modelRatePercent: context.modelRatePercent,
    calculatorType: "mortgage",
    ...marketing,
    ...extras,
  };
}

/** @deprecated Use serializeMortgageJourneyParams */
export function serializeSazbySearchParams(
  query: MortgageJourneyCore,
  options?: {
    preserveMarketingFrom?: Record<string, string | undefined> | URLSearchParams;
  }
): URLSearchParams {
  return serializeMortgageJourneyParams(query, options);
}

/** @deprecated Use parseMortgageJourneyParams for full validation metadata */
export function parseSazbySearchParams(
  raw: Record<string, string | undefined>
): MortgageJourneyCore {
  return parseMortgageJourneyParams(raw).context;
}
