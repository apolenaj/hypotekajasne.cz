import { createAuditId, createMessageId } from "@/lib/copilot/audit";
import { permissionNotes } from "@/lib/copilot/context";
import { assertSafeAssistantMessage } from "@/lib/copilot/guardrails";
import {
  detectIntent,
  extractPropertyPrice,
  extractTargetMillion,
} from "@/lib/copilot/intents";
import { buildResponseMeta } from "@/lib/copilot/response-meta";
import {
  parsePricesFromMessage,
  toolActionPlan,
  toolAffordability,
  toolClarify,
  toolCompareProperties,
  toolContactSpecialist,
  toolExplainScore,
  toolMarketCompare,
  toolMissingDocuments,
  toolNextStep,
  toolOutOfScope,
  toolPropertySafe,
  toolRateStress,
  toolReachTarget,
  toolRiskAnalysis,
  type ToolBundle,
} from "@/lib/copilot/tools";
import type {
  CopilotOrchestratorInput,
  CopilotOrchestratorResult,
} from "@/lib/copilot/types";

function runIntent(input: CopilotOrchestratorInput): ToolBundle {
  const { message, quickAction, context, readinessAnswers } = input;
  const { intent } = detectIntent(message, quickAction);
  const answers = readinessAnswers ?? null;
  const propsFromMsg = parsePricesFromMessage(message);
  const properties =
    propsFromMsg.length >= 2 ? propsFromMsg : context.properties;

  switch (intent) {
    case "affordability":
      return toolAffordability(context, answers);
    case "explain_score":
      return toolExplainScore(context, answers);
    case "reach_target": {
      const target =
        extractTargetMillion(message) ??
        context.targetPrice ??
        context.financingHigh ??
        7_000_000;
      return toolReachTarget(context, answers, target);
    }
    case "property_safe": {
      const price =
        extractPropertyPrice(message) ??
        properties[0]?.priceCzk ??
        context.targetPrice;
      if (price == null) {
        return {
          ...toolClarify(),
          markdown:
            "## Cena nemovitosti chybí\n\nNapište např. „Je byt za 6,2 milionu pro mě bezpečný?“ nebo přidejte nemovitost v panelu.",
          unknowns: ["Cena nemovitosti v dotazu"],
        };
      }
      return toolPropertySafe(context, answers, price, properties[0]?.label);
    }
    case "compare_properties":
      return toolCompareProperties(context, answers, properties);
    case "rate_stress":
      return toolRateStress(context, answers, 2);
    case "market_compare":
      return toolMarketCompare(context, message);
    case "missing_documents":
      return toolMissingDocuments(context, answers);
    case "next_step":
      return toolNextStep(context, answers);
    case "action_plan":
      return toolActionPlan(context, answers);
    case "risk_analysis":
      return toolRiskAnalysis(context, answers);
    case "contact_specialist":
      return toolContactSpecialist();
    case "out_of_scope":
      return toolOutOfScope();
    case "clarify":
    default:
      return toolClarify();
  }
}

/**
 * Full pipeline: intent → tools → citations → response meta → guardrails.
 * Context/permission is prepared by the caller (browser-local profile).
 */
export function orchestrateCopilot(
  input: CopilotOrchestratorInput
): CopilotOrchestratorResult {
  const detected = detectIntent(input.message, input.quickAction);
  const bundle = runIntent(input);
  const notes = permissionNotes(input.context);
  const preface =
    notes.length && !input.context.hasReadinessProfile
      ? `_${notes[0]}_\n\n`
      : "";

  const auditId = createAuditId();
  const messageId = createMessageId();
  const at = new Date().toISOString();

  const gated = bundle.tools.some(
    (t) => t.toolId === "permission_gate" || !t.ok
  );

  const responseMeta = buildResponseMeta({
    citations: bundle.citations,
    usedInputs: bundle.usedInputs,
    context: input.context,
    intent: detected.intent,
    modelAssumptions: bundle.modelAssumptions,
    unknowns: bundle.unknowns,
    gated,
  });

  const raw: CopilotOrchestratorResult = {
    message: {
      id: messageId,
      role: "assistant",
      content: preface + bundle.markdown,
      createdAt: at,
      intent: detected.intent,
      citations: bundle.citations,
      usedInputs: bundle.usedInputs,
      tools: bundle.tools,
      auditId,
      cta: bundle.cta,
      responseMeta,
    },
    audit: {
      id: auditId,
      at,
      intent: detected.intent,
      tools: bundle.tools,
      citationIds: bundle.citations.map((c) => c.id),
      dataKeysUsed: bundle.dataKeys,
      guardrailFlags: [],
      confidence: responseMeta.confidence,
      sourcesUsed: responseMeta.sourcesUsed,
    },
  };

  return assertSafeAssistantMessage(raw);
}
