import type { AttributionPayload, FinancialPassport } from "@/lib/majetio/types";
import { MAJETIO_SAFE_QUERY_KEYS } from "@/lib/majetio/types";

const DEFAULT_MAJETIO_BASE =
  process.env.NEXT_PUBLIC_MAJETIO_BASE_URL ?? "https://majetio.cz/";

const DEFAULT_HJ_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hypotekajasne.cz";

/**
 * Discovery URL na Majetio — pouze whitelistované parametry + attribution.
 * Žádné PII.
 */
export function buildMajetioDiscoveryUrl(input: {
  passport: FinancialPassport;
  attribution: AttributionPayload;
  baseUrl?: string;
}): string {
  const url = new URL(input.baseUrl ?? DEFAULT_MAJETIO_BASE);

  const p = input.passport;
  const a = input.attribution;

  // Prefer safe shopping budget; fall back to max bank + equity as ceiling
  const budgetMax =
    p.safePropertyBudget ??
    (p.maxEstimatedBankBudget != null
      ? p.maxEstimatedBankBudget + p.ownFunds
      : null);

  if (budgetMax != null && budgetMax > 0) {
    url.searchParams.set("budget_max", String(Math.round(budgetMax)));
  }
  if (p.safePropertyBudget != null && p.safePropertyBudget > 0) {
    url.searchParams.set(
      "safe_budget",
      String(Math.round(p.safePropertyBudget))
    );
  }
  if (p.ownFunds > 0) {
    url.searchParams.set("equity", String(Math.round(p.ownFunds)));
  }
  if (p.purpose && p.purpose !== "unknown") {
    url.searchParams.set("purpose", p.purpose);
  }
  if (p.country) {
    url.searchParams.set("country", p.country);
  }
  if (p.investmentProfile) {
    url.searchParams.set("profile", p.investmentProfile);
  }
  if (p.financingStatus && p.financingStatus !== "unknown") {
    url.searchParams.set("financing_status", p.financingStatus);
  }

  url.searchParams.set("fp_v", String(p.version));
  url.searchParams.set("llid", a.lifecycleId);
  url.searchParams.set("ref", a.referralId);
  url.searchParams.set("utm_source", a.utm.utm_source);
  url.searchParams.set("utm_medium", a.utm.utm_medium);
  url.searchParams.set("utm_campaign", a.utm.utm_campaign);
  if (a.utm.utm_content) {
    url.searchParams.set("utm_content", a.utm.utm_content);
  }

  // Strip anything outside whitelist (defense in depth)
  for (const key of [...url.searchParams.keys()]) {
    if (
      !(MAJETIO_SAFE_QUERY_KEYS as readonly string[]).includes(key)
    ) {
      url.searchParams.delete(key);
    }
  }

  return url.toString();
}

/**
 * @deprecated Prefer buildMajetioDiscoveryUrl + FinancialPassport.
 * Kept for tests / gradual migration.
 */
export function buildMajetioListingUrl(input: {
  budgetMax: number | null;
  equity: number;
  intent: string | null;
  baseUrl?: string;
  lifecycleId?: string;
  referralId?: string;
}): string {
  const url = new URL(input.baseUrl ?? DEFAULT_MAJETIO_BASE);
  if (input.budgetMax != null && input.budgetMax > 0) {
    url.searchParams.set("budget_max", String(Math.round(input.budgetMax)));
  }
  if (input.equity > 0) {
    url.searchParams.set("equity", String(Math.round(input.equity)));
  }
  if (input.intent) {
    url.searchParams.set("purpose", input.intent);
  }
  url.searchParams.set("utm_source", "hypoteka-jasne");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "readiness");
  if (input.lifecycleId) url.searchParams.set("llid", input.lifecycleId);
  if (input.referralId) url.searchParams.set("ref", input.referralId);
  return url.toString();
}

/**
 * Deep-link zpět na Hypotéka Jasně — „Spočítat financování“.
 * Jen cena / země / účel + attribution (žádné PII z Majetio).
 */
export function buildHypotekaFinancingHandoffUrl(input: {
  propertyPriceCzk: number;
  country?: string;
  purpose?: string;
  propertyId?: string;
  attribution?: Partial<AttributionPayload["utm"]> & {
    llid?: string;
    ref?: string;
  };
  baseUrl?: string;
}): string {
  const base = input.baseUrl ?? DEFAULT_HJ_BASE;
  const url = new URL("/kalkulacky", base);
  url.searchParams.set("price", String(Math.round(input.propertyPriceCzk)));
  if (input.country) url.searchParams.set("country", input.country);
  if (input.purpose) url.searchParams.set("purpose", input.purpose);
  if (input.propertyId) url.searchParams.set("listing_ref", input.propertyId);
  url.searchParams.set("utm_source", input.attribution?.utm_source ?? "majetio");
  url.searchParams.set(
    "utm_medium",
    input.attribution?.utm_medium ?? "property_detail"
  );
  url.searchParams.set(
    "utm_campaign",
    input.attribution?.utm_campaign ?? "financing_handoff"
  );
  if (input.attribution?.llid) {
    url.searchParams.set("llid", input.attribution.llid);
  }
  if (input.attribution?.ref) {
    url.searchParams.set("ref", input.attribution.ref);
  }
  return url.toString();
}

export function buildHypotekaReadinessHandoffUrl(input?: {
  llid?: string;
  ref?: string;
  baseUrl?: string;
}): string {
  const base = input?.baseUrl ?? DEFAULT_HJ_BASE;
  const url = new URL("/navrh-na-miru", base);
  url.searchParams.set("utm_source", "majetio");
  url.searchParams.set("utm_medium", "property_detail");
  url.searchParams.set("utm_campaign", "affordability");
  if (input?.llid) url.searchParams.set("llid", input.llid);
  if (input?.ref) url.searchParams.set("ref", input.ref);
  return url.toString();
}
