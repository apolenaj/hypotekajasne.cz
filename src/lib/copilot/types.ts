/**
 * AI Property & Mortgage Copilot — types.
 * Orchestrace nad ověřenými nástroji; žádné volné halucinace sazeb/zákonů.
 */

export type ClaimKind = "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";

export type CopilotIntentId =
  | "affordability"
  | "explain_score"
  | "reach_target"
  | "property_safe"
  | "compare_properties"
  | "rate_stress"
  | "market_compare"
  | "missing_documents"
  | "next_step"
  | "action_plan"
  | "risk_analysis"
  | "contact_specialist"
  | "clarify"
  | "out_of_scope";

export type CopilotQuickActionId =
  | "affordability"
  | "compare_properties"
  | "risk_analysis"
  | "action_plan"
  | "explain_score"
  | "contact_specialist";

export type CopilotCitation = {
  id: string;
  label: string;
  source: string;
  updatedAt: string | null;
  claimKind: ClaimKind;
  href?: string;
};

export type CopilotUsedInput = {
  key: string;
  label: string;
  /** Display value — never send raw PII to analytics */
  display: string;
  claimKind: ClaimKind;
};

export type CopilotToolCall = {
  toolId: string;
  ok: boolean;
  summary: string;
};

export type CopilotAuditEntry = {
  id: string;
  at: string;
  intent: CopilotIntentId;
  tools: CopilotToolCall[];
  citationIds: string[];
  dataKeysUsed: string[];
  guardrailFlags: string[];
};

export type CopilotMessageRole = "user" | "assistant" | "system";

export type CopilotMessage = {
  id: string;
  role: CopilotMessageRole;
  content: string;
  createdAt: string;
  intent?: CopilotIntentId;
  citations?: CopilotCitation[];
  usedInputs?: CopilotUsedInput[];
  tools?: CopilotToolCall[];
  auditId?: string;
  cta?: { label: string; href: string }[];
};

/** Non-PII session property slot for compare / safety checks. */
export type CopilotPropertyDraft = {
  id: string;
  label: string;
  priceCzk: number;
  locationHint?: string;
  countryId?: string;
};

/**
 * Context available to Copilot without uploading PII to a third-party LLM.
 * Amounts stay in-browser unless user explicitly consents elsewhere (leads).
 */
export type CopilotSessionContext = {
  hasReadinessProfile: boolean;
  readinessScore: number | null;
  financingHigh: number | null;
  financingLow: number | null;
  intentLabel: string | null;
  ownFundsBand: string | null;
  targetPrice: number | null;
  properties: CopilotPropertyDraft[];
  modelRatePercent: number | null;
  modelRateUpdatedAt: string | null;
  modelRateClaimKind: ClaimKind;
};

export type CopilotOrchestratorInput = {
  message: string;
  quickAction?: CopilotQuickActionId;
  context: CopilotSessionContext;
  /** Raw readiness answers — client-only, never logged to analytics */
  readinessAnswers?: import("@/lib/mortgage-readiness").ReadinessAnswers | null;
};

export type CopilotOrchestratorResult = {
  message: CopilotMessage;
  audit: CopilotAuditEntry;
};

export const COPILOT_SYSTEM_DISCLAIMER =
  "HypotékaJasně Copilot pracuje jen s ověřenými daty platformy, výsledky kalkulaček a vaším lokálním profilem. Nejde o schválení úvěru ani o regulované osobní finanční doporučení — finální posouzení dělá banka / licencovaný specialista.";

export const COPILOT_FORBIDDEN_PROMISES = [
  "schválíme vám úvěr",
  "máte jistotu schválení",
  "banka vám půjčí",
  "garantovaný výnos",
  "zaručeně dosáhnete",
] as const;
