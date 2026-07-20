import {
  COPILOT_FORBIDDEN_PROMISES,
  COPILOT_SYSTEM_DISCLAIMER,
  type CopilotOrchestratorResult,
} from "@/lib/copilot/types";

const FORBIDDEN_PATTERNS = [
  /schválím[ey]?\s+(vám\s+)?úvěr/i,
  /máte\s+jistotu\s+schválení/i,
  /banka\s+vám\s+(určitě\s+)?půjčí/i,
  /garantovan(ý|á)\s+výnos/i,
  /zaručeně\s+dosáhnete/i,
  /právní\s+rada\s*:/i,
  /obejděte\s+daň/i,
];

export type GuardrailResult = {
  text: string;
  flags: string[];
};

/**
 * Strip / rewrite unsafe claims. Always append system disclaimer once.
 */
export function applyGuardrails(text: string): GuardrailResult {
  let out = text;
  const flags: string[] = [];

  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(out)) {
      flags.push(`blocked_pattern:${re.source}`);
      out = out.replace(re, "[upraveno — bez příslibu schválení]");
    }
  }

  for (const phrase of COPILOT_FORBIDDEN_PROMISES) {
    if (out.toLowerCase().includes(phrase)) {
      flags.push(`blocked_phrase:${phrase}`);
      out = out.replace(new RegExp(phrase, "ig"), "[bez příslibu]");
    }
  }

  if (!out.includes("Nejde o schválení úvěru") && !out.includes(COPILOT_SYSTEM_DISCLAIMER.slice(0, 40))) {
    out = `${out.trim()}\n\n—\n${COPILOT_SYSTEM_DISCLAIMER}`;
    flags.push("appended_system_disclaimer");
  }

  return { text: out, flags };
}

export function assertSafeAssistantMessage(
  result: CopilotOrchestratorResult
): CopilotOrchestratorResult {
  const g = applyGuardrails(result.message.content);
  return {
    ...result,
    message: { ...result.message, content: g.text },
    audit: {
      ...result.audit,
      guardrailFlags: [...result.audit.guardrailFlags, ...g.flags],
    },
  };
}
