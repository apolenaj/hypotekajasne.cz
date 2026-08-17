/**
 * Phase 7 conversion hierarchy + UTM naming (server/client safe constants).
 * No PII. Paid campaigns stay DRAFT until manual spend approval.
 */

export const PHASE7_PRIMARY_CONVERSION = "lead_success" as const;

export const PHASE7_SECONDARY_CONVERSIONS = [
  "lead_submit",
  "lead_form_view",
  "cta_click",
  "situation_select",
] as const;

export type Phase7PageIntent =
  | "refinance"
  | "osvc"
  | "foreign_income"
  | "investment"
  | "american"
  | "brand";

export const PHASE7_FUNNEL_LANDINGS: Record<
  Exclude<Phase7PageIntent, "brand">,
  string
> = {
  refinance: "/temata/refinancovani",
  osvc: "/temata/hypoteka-osvc",
  foreign_income: "/temata/hypoteka-ze-zahranicniho-prijmu",
  investment: "/temata/investicni-hypoteka",
  american: "/temata/americka-hypoteka",
};

/** Lowercase, no diacritics — used for campaign naming + validation. */
export function buildPhase7UtmCampaign(input: {
  country?: "cz";
  funnel: Phase7PageIntent;
  channel: "google" | "facebook" | "instagram";
  campaignType: "search" | "paid_social" | "remarketing" | "organic_social";
  variant?: string;
}): string {
  const country = input.country ?? "cz";
  const parts = [
    country,
    input.funnel,
    input.channel,
    input.campaignType,
  ];
  if (input.variant?.trim()) {
    parts.push(
      input.variant
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32)
    );
  }
  return parts.filter(Boolean).join("_");
}

export function isValidPhase7UtmToken(raw: string): boolean {
  return /^[a-z0-9._-]{1,64}$/.test(raw);
}

export type Phase7AdConversionPayload = {
  page_intent?: string;
  source_page?: string;
  landing_path?: string;
  cta_destination?: string;
  cta_placement?: string;
  funnel_id?: string;
  purpose?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

/**
 * Safe fields only for future Google Ads / GA4 conversion export.
 * Never include name, email, phone, message, gclid storage, or free-text notes.
 */
export function buildPhase7AdConversionPayload(
  input: Record<string, unknown>
): Phase7AdConversionPayload {
  const out: Phase7AdConversionPayload = {};
  const copyIfString = (key: keyof Phase7AdConversionPayload) => {
    const v = input[key];
    if (typeof v === "string" && v.trim()) {
      out[key] = v.trim().slice(0, 120);
    }
  };
  copyIfString("page_intent");
  copyIfString("source_page");
  copyIfString("landing_path");
  copyIfString("cta_destination");
  copyIfString("cta_placement");
  copyIfString("funnel_id");
  copyIfString("purpose");
  for (const k of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const) {
    const v = input[k];
    if (typeof v === "string" && isValidPhase7UtmToken(v.toLowerCase())) {
      out[k] = v.toLowerCase();
    }
  }
  return out;
}

export const PHASE7_SPEND_RULES = {
  /** No paid activation without explicit business approval. */
  paidCampaignsDefault: "DRAFT" as const,
  primaryOptimizationEvent: PHASE7_PRIMARY_CONVERSION,
  doNotOptimizeOn: PHASE7_SECONDARY_CONVERSIONS,
  gclidPolicy:
    "Click IDs are not persisted in first-party lead rows; Ads attribution uses Google cookies after marketing/analytics consent as configured in Consent Mode.",
} as const;
