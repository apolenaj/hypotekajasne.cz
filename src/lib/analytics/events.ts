/**
 * Privacy-aware analytics event taxonomy.
 * NEVER put PII or sensitive financial amounts in payloads.
 *
 * North-star funnel (see funnel.ts):
 * Landing → Zjistit moje možnosti → Výsledek → decision action → lead / premium
 */

export const ANALYTICS_EVENTS = [
  // —— GLOBAL ——
  "page_view",
  "homepage_view",
  "primary_cta_clicked",
  "homepage_intent_selected",
  "intent_selected",

  // —— ONBOARDING (/moje-moznosti) ——
  "onboarding_started",
  "onboarding_step_completed",
  "onboarding_completed",
  "onboarding_abandoned",
  /** @deprecated prefer onboarding_*; kept for continuity */
  "moznosti_started",
  "moznosti_step",
  "moznosti_completed",
  "moznosti_reset",

  // —— CALCULATORS ——
  "calculator_started",
  "calculator_completed",
  "result_viewed",
  "specialist_cta_clicked",
  "prescore_started",
  "prescore_completed",
  "financing_option_selected",

  // —— COUNTRIES ——
  "market_viewed",
  "market_compared",
  "market_compare_started",
  "country_calculator_started",
  /** @deprecated prefer market_viewed */
  "country_viewed",

  // —— FINANCIAL / INVESTMENT PASSPORT ——
  "passport_started",
  "passport_completed",
  "passport_shared_intent",
  "financial_passport_created",
  "investment_pass_started",
  "investment_pass_completed",
  "investment_passport_completed",

  // —— INVESTMENT X-RAY (rentgen) ——
  "rentgen_started",
  "property_xray_started",
  "property_input_completed",
  "free_result_viewed",
  "property_xray_completed",
  "premium_viewed",
  "premium_cta_clicked",
  "analysis_started",
  "analysis_checkout_started",

  // —— COPILOT ——
  "copilot_opened",
  "copilot_question_submitted",
  "source_opened",

  // —— LEADS ——
  "lead_form_started",
  "lead_form_submitted_success",
  "lead_form_submitted",
  "lead_form_error",
  /** @deprecated prefer lead_form_submitted_success */
  "lead_submitted",
  "partner_handoff",
  "partner_handoff_requested",
  "conversion_confirmed",
  "majetio_clicked",

  // —— REFINANCE ——
  "refinance_radar_started",

  // —— OTHER TOOLS ——
  "document_vault_opened",
  "document_vault_action",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

/** Allowed payload keys — categorical / coarse only. */
export type AnalyticsPayload = {
  intent_id?: string;
  tool_id?: string;
  country_id?: string;
  /** Comma-separated country ids for compare (max few ids) — never names of people */
  market_ids?: string;
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
  step_id?: string;
  cta_id?: string;
  error_code?: string;
  /** Coarse category for Copilot — never free-text question */
  question_category?: string;
  source_id?: string;
  score_bucket?: "0-25" | "26-50" | "51-75" | "76-100";
  /** Coarse price band for analysis — never exact CZK */
  price_band?: "free" | "premium";
  path?: string;
  /** Referrer hostname only (e.g. google.com) — never full URL with query */
  referrer_host?: string;
  funnel_id?: string;
  /** First-touch UTM — only after analytics consent (sanitized) */
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  visitor_type?: "new" | "returning";
  /** Anonymous session id — not lifecycle PII */
  session_id?: string;
  /** Partner-transfer consent path — qualified lead KPI */
  lead_qualified?: boolean;
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
  "debt",
  "debts",
  "liability",
  "liabilities",
  "rodne",
  "rodin",
  "birth_number",
  "financial_profile",
  "profile_data",
  "iban",
  "account_number",
  "tax_id",
  "query",
  "question",
  "message",
  "prompt",
  "conversation",
  "transcript",
  "answer",
  "chat",
] as const;

/** Keys that must match exactly (avoid blocking question_category). */
const FORBIDDEN_EXACT = new Set<string>([
  "query",
  "question",
  "message",
  "prompt",
  "conversation",
  "transcript",
  "answer",
  "chat",
  "name",
  "email",
  "phone",
  "income",
  "salary",
  "loan",
  "amount",
  "iban",
]);

export function assertSafeAnalyticsPayload(
  payload: Record<string, unknown>
): asserts payload is AnalyticsPayload {
  for (const key of Object.keys(payload)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_EXACT.has(lower)) {
      throw new Error(
        `Analytics payload must not include sensitive key: ${key}`
      );
    }
    for (const forbidden of FORBIDDEN_PAYLOAD_KEYS) {
      if (FORBIDDEN_EXACT.has(forbidden)) continue;
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
      throw new Error(`Analytics payload looks like PII in ${key}`);
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

/** Coarse Copilot question category — never store free text. */
export function categorizeCopilotPrompt(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/ltv|dsti|dti|rpsn|fixac|sazb|hypoték|hypotek/.test(p)) {
    return "mortgage_mechanics";
  }
  if (/nájem|najem|koup|vs|buy|rent/.test(p)) return "buy_vs_rent";
  if (/dubaj|dubai|španěl|spanel|bali|chorvat|saudi|zahrani/.test(p)) {
    return "foreign_market";
  }
  if (/refinan|splat|úvěr|uver/.test(p)) return "refinance";
  if (/výnos|vynos|cash|invest/.test(p)) return "investment_yield";
  if (/dovol|rozpočet|rozpocet|příjem|prijem/.test(p)) return "affordability";
  return "general";
}

export type EventDictionaryRow = {
  event: AnalyticsEventName;
  trigger: string;
  properties: string;
  purpose: string;
};

/**
 * Human-readable EVENT DICTIONARY for product + engineering.
 * Keep in sync with ANALYTICS_EVENTS.
 */
export const EVENT_DICTIONARY: EventDictionaryRow[] = [
  {
    event: "page_view",
    trigger: "Client route change (after analytics consent)",
    properties: "path, referrer_host?, utm_*, visitor_type?",
    purpose: "Traffic baseline; attribution of landings",
  },
  {
    event: "homepage_view",
    trigger: "Home route (/) page view",
    properties: "path=/, utm_*, visitor_type?",
    purpose: "Homepage funnel entry (dashboard KPI)",
  },
  {
    event: "intent_selected",
    trigger: "Home intent chip / needs selection",
    properties: "intent_id, utm_*?",
    purpose: "Intent mix — canonical name for homepage_intent_selected",
  },
  {
    event: "primary_cta_clicked",
    trigger: "Primary conversion CTA (hero / final / nav)",
    properties: "cta_id, path?, tool_id?",
    purpose: "Measure north-star CTA engagement",
  },
  {
    event: "homepage_intent_selected",
    trigger: "Home needs / intent chip selected",
    properties: "intent_id",
    purpose: "Intent mix on homepage",
  },
  {
    event: "onboarding_started",
    trigger: "Moje možnosti wizard opens",
    properties: "tool_id=moje_moznosti",
    purpose: "North-star funnel: start",
  },
  {
    event: "onboarding_step_completed",
    trigger: "User advances an onboarding step",
    properties: "tool_id, step, step_id?",
    purpose: "Find drop-off steps",
  },
  {
    event: "onboarding_completed",
    trigger: "Onboarding result screen shown",
    properties: "tool_id, score_bucket?",
    purpose: "North-star: result reached",
  },
  {
    event: "onboarding_abandoned",
    trigger: "Leave/unmount before completion",
    properties: "tool_id, step?",
    purpose: "Abandonment diagnostics",
  },
  {
    event: "calculator_started",
    trigger: "Calculator tool mounted / first interaction",
    properties: "tool_id, country_id?",
    purpose: "Tool engagement",
  },
  {
    event: "calculator_completed",
    trigger: "Calculator produces a result",
    properties: "tool_id, country_id?",
    purpose: "Tool completion rate",
  },
  {
    event: "result_viewed",
    trigger: "Result panel enters view / is shown",
    properties: "tool_id",
    purpose: "Result attention vs start",
  },
  {
    event: "specialist_cta_clicked",
    trigger: "CTA toward licensed specialist / consult",
    properties: "cta_id, tool_id?, lead_source?",
    purpose: "Decision action after result",
  },
  {
    event: "market_viewed",
    trigger: "Country / market hub page view",
    properties: "country_id",
    purpose: "Which markets get attention",
  },
  {
    event: "market_compare_started",
    trigger: "User selects ≥2 markets to compare",
    properties: "tool_id, market_ids",
    purpose: "Compare funnel start — KPI denominator",
  },
  {
    event: "market_compared",
    trigger: "Compare selection updated (≥2 markets)",
    properties: "market_ids, tool_id?",
    purpose: "Compare feature usage (legacy alias)",
  },
  {
    event: "country_calculator_started",
    trigger: "Calculator opened in country context",
    properties: "country_id, tool_id",
    purpose: "Country → calc conversion",
  },
  {
    event: "financial_passport_created",
    trigger: "Financial passport score ready",
    properties: "tool_id, score_bucket?, utm_*?",
    purpose: "Financial passport completion — canonical",
  },
  {
    event: "investment_passport_completed",
    trigger: "Investment passport dashboard shown",
    properties: "tool_id, score_bucket?",
    purpose: "Investment passport completion — canonical",
  },
  {
    event: "property_xray_started",
    trigger: "Rentgen tool mounted",
    properties: "tool_id, price_band, experiment_id?, variant_id?",
    purpose: "X-ray funnel start — canonical",
  },
  {
    event: "property_xray_completed",
    trigger: "Free X-ray preview rendered",
    properties: "tool_id, price_band, score_bucket?",
    purpose: "X-ray completion KPI numerator",
  },
  {
    event: "refinance_radar_started",
    trigger: "Refinance radar view mounted with profile",
    properties: "tool_id=refinance_radar",
    purpose: "Refinancing activation KPI",
  },
  {
    event: "lead_form_submitted",
    trigger: "Lead API success",
    properties: "lead_source, partner_scope?, lead_qualified?, utm_*?",
    purpose: "Lead conversion — canonical",
  },
  {
    event: "partner_handoff_requested",
    trigger: "Explicit partner transfer consent path",
    properties: "lead_source, partner_scope",
    purpose: "Licensed handoff — canonical",
  },
  {
    event: "passport_completed",
    trigger: "Passport document / score ready",
    properties: "tool_id, score_bucket?",
    purpose: "Passport completion",
  },
  {
    event: "passport_shared_intent",
    trigger: "Share / export / Majetio bridge clicked",
    properties: "cta_id, tool_id?",
    purpose: "Downstream decision action",
  },
  {
    event: "rentgen_started",
    trigger: "Rentgen island mounted",
    properties: "tool_id, price_band, experiment_id?, variant_id?",
    purpose: "X-ray funnel start",
  },
  {
    event: "property_input_completed",
    trigger: "User submits property inputs (Spočítat)",
    properties: "tool_id, price_band?",
    purpose: "Input → free result drop-off",
  },
  {
    event: "free_result_viewed",
    trigger: "Free preview result rendered",
    properties: "tool_id, price_band",
    purpose: "Free layer value",
  },
  {
    event: "premium_viewed",
    trigger: "Premium block scrolled into view",
    properties: "tool_id, price_band",
    purpose: "Premium awareness",
  },
  {
    event: "premium_cta_clicked",
    trigger: "Premium CTA clicked",
    properties: "tool_id, price_band, cta_id?",
    purpose: "Premium intent",
  },
  {
    event: "copilot_opened",
    trigger: "Copilot view mounted",
    properties: "tool_id=ai_copilot",
    purpose: "Copilot adoption",
  },
  {
    event: "copilot_question_submitted",
    trigger: "User submits a prompt (category only)",
    properties: "tool_id, question_category",
    purpose: "Usage mix without storing text",
  },
  {
    event: "source_opened",
    trigger: "Citation / source link opened",
    properties: "source_id, tool_id?",
    purpose: "Trust / source engagement",
  },
  {
    event: "lead_form_started",
    trigger: "Lead form focused / first interaction",
    properties: "lead_source, tool_id?",
    purpose: "Form start vs submit",
  },
  {
    event: "lead_form_submitted_success",
    trigger: "Lead API success",
    properties: "lead_source, partner_scope?",
    purpose: "Qualified lead (north-star conversion)",
  },
  {
    event: "lead_form_error",
    trigger: "Lead validation / API failure",
    properties: "lead_source, error_code",
    purpose: "Fix friction without PII",
  },
  {
    event: "partner_handoff",
    trigger: "Explicit partner transfer consent path",
    properties: "lead_source, partner_scope",
    purpose: "Licensed handoff rate",
  },
];
