/**
 * Privacy-aware analytics event taxonomy.
 * NEVER put PII or sensitive financial amounts in payloads.
 */

export const ANALYTICS_EVENTS = [
  "homepage_intent_selected",
  "calculator_started",
  "calculator_completed",
  "prescore_started",
  "prescore_completed",
  "investment_pass_started",
  "investment_pass_completed",
  "country_viewed",
  "financing_option_selected",
  "majetio_clicked",
  "analysis_started",
  "analysis_checkout_started",
  "lead_submitted",
  "partner_handoff",
  "conversion_confirmed",
  "document_vault_opened",
  "document_vault_action",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

/** Allowed payload keys — categorical / coarse only. */
export type AnalyticsPayload = {
  intent_id?: string;
  tool_id?: string;
  country_id?: string;
  financing_option_id?: string;
  lead_source?: string;
  partner_scope?: string;
  conversion_type?:
    | "lead"
    | "partner_handoff"
    | "mortgage_completed"
    | "property_purchased"
    | "analysis_purchased";
  experiment_id?: string;
  variant_id?: string;
  step?: number;
  score_bucket?: "0-25" | "26-50" | "51-75" | "76-100";
  /** Coarse price band for analysis — never exact CZK */
  price_band?: "free" | "premium";
  path?: string;
};

const FORBIDDEN_PAYLOAD_KEYS = [
  "email",
  "phone",
  "name",
  "income",
  "salary",
  "loan",
  "amount",
  "amount_czk",
  "net_income",
  "capital",
  "own_cash",
  "ssn",
  "birth",
  "address",
  "ico",
  "personal",
  "filename",
  "document_content",
  "extracted_amount",
  "document_category_detail",
  "iban",
  "account_number",
  "tax_id",
] as const;

export function assertSafeAnalyticsPayload(
  payload: Record<string, unknown>
): asserts payload is AnalyticsPayload {
  for (const key of Object.keys(payload)) {
    const lower = key.toLowerCase();
    for (const forbidden of FORBIDDEN_PAYLOAD_KEYS) {
      if (lower.includes(forbidden)) {
        throw new Error(
          `Analytics payload must not include sensitive key: ${key}`
        );
      }
    }
    const val = payload[key];
    if (typeof val === "number" && Math.abs(val) >= 10_000) {
      throw new Error(
        `Analytics payload must not include large numeric amounts (${key})`
      );
    }
    if (
      typeof val === "string" &&
      (val.includes("@") || /\+?\d[\d\s-]{8,}/.test(val))
    ) {
      throw new Error(
        `Analytics payload looks like PII in ${key}`
      );
    }
  }
}

export function scoreToBucket(
  score: number
): AnalyticsPayload["score_bucket"] {
  if (score <= 25) return "0-25";
  if (score <= 50) return "26-50";
  if (score <= 75) return "51-75";
  return "76-100";
}

export function isAnalyticsEventName(
  value: string
): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}
