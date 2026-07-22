import {
  calculateReadiness,
  INTENT_OPTIONS,
  loadReadiness,
  type ReadinessAnswers,
} from "@/lib/mortgage-readiness";
import type {
  ClaimKind,
  CopilotPropertyDraft,
  CopilotRateLayer,
  CopilotSessionContext,
} from "@/lib/copilot/types";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";

const PROPERTIES_KEY = "hj-copilot-properties-v1";

function fundsBand(ownFunds: number): string | null {
  if (!ownFunds || ownFunds <= 0) return null;
  if (ownFunds < 500_000) return "<0.5M";
  if (ownFunds < 1_000_000) return "0.5–1M";
  if (ownFunds < 2_000_000) return "1–2M";
  if (ownFunds < 4_000_000) return "2–4M";
  return "4M+";
}

export function loadCopilotProperties(): CopilotPropertyDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PROPERTIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CopilotPropertyDraft[];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function saveCopilotProperties(items: CopilotPropertyDraft[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PROPERTIES_KEY, JSON.stringify(items.slice(0, 8)));
}

export function upsertCopilotProperty(item: CopilotPropertyDraft) {
  const list = loadCopilotProperties().filter((p) => p.id !== item.id);
  list.unshift(item);
  saveCopilotProperties(list);
}

export function clearCopilotProperties() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PROPERTIES_KEY);
}

export function buildSessionContext(opts?: {
  modelRatePercent?: number | null;
  modelRateUpdatedAt?: string | null;
  modelRateClaimKind?: ClaimKind;
  rateLayer?: CopilotRateLayer;
  properties?: CopilotPropertyDraft[];
}): {
  context: CopilotSessionContext;
  answers: ReadinessAnswers | null;
} {
  const stored = typeof window !== "undefined" ? loadReadiness() : null;
  const answers = (stored?.answers as ReadinessAnswers | undefined) ?? null;
  const rateLayer = opts?.rateLayer ?? "MODEL";
  const rate =
    opts?.modelRatePercent ??
    (rateLayer === "MODEL" ? MODEL_FALLBACK_RATE_PERCENT : null);
  const result =
    answers && rate != null ? calculateReadiness(answers, rate) : null;
  const intentLabel =
    answers?.intent != null
      ? INTENT_OPTIONS.find((o) => o.id === answers.intent)?.label ?? null
      : null;

  const claimKind: ClaimKind =
    opts?.modelRateClaimKind ??
    (rateLayer === "LIVE"
      ? "DATA"
      : rateLayer === "STALE"
        ? "NEOVERENO"
        : "MODEL");

  return {
    answers,
    context: {
      hasReadinessProfile: Boolean(answers?.intent && answers.netIncome > 0),
      readinessScore: result?.score ?? null,
      financingHigh: result?.financingRange?.high ?? null,
      financingLow: result?.financingRange?.low ?? null,
      intentLabel,
      ownFundsBand: answers ? fundsBand(answers.ownFunds) : null,
      targetPrice: answers?.targetPrice ?? null,
      properties: opts?.properties ?? loadCopilotProperties(),
      modelRatePercent: opts?.modelRatePercent ?? rate,
      modelRateUpdatedAt: opts?.modelRateUpdatedAt ?? null,
      modelRateClaimKind: claimKind,
      rateLayer,
    },
  };
}

/**
 * Permission layer: what the Copilot may use without extra consent.
 * Sensitive amounts stay local; we never invent missing profile fields.
 */
export function permissionNotes(context: CopilotSessionContext): string[] {
  const notes: string[] = [];
  if (!context.hasReadinessProfile) {
    notes.push(
      "Nemáte uložený profil připravenosti — odpovědi budou obecnější. Vyplňte /navrh-na-miru."
    );
  }
  notes.push(
    "Citlivé údaje (příjem, kontakty) zůstávají v prohlížeči; na server třetí strany LLM je neodesíláme."
  );
  return notes;
}
