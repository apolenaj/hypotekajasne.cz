/**
 * Response metadata: confidence + source freshness for Finanční AI průvodce.
 * Evidence kinds are internal SoT — UI maps to Czech labels.
 */

import { FRESHNESS_THRESHOLD_MS } from "@/lib/data/freshness";
import type {
  ClaimKind,
  CopilotCitation,
  CopilotConfidence,
  CopilotEvidenceKind,
  CopilotResponseMeta,
  CopilotSessionContext,
  CopilotUsedInput,
} from "@/lib/copilot/types";

export function evidenceFromClaim(claim: ClaimKind): CopilotEvidenceKind {
  switch (claim) {
    case "DATA":
      return "FACT";
    case "MODEL":
      return "MODEL";
    case "ODHAD":
      return "ESTIMATE";
    case "NEOVERENO":
    default:
      return "UNKNOWN";
  }
}

export function claimFromEvidence(kind: CopilotEvidenceKind): ClaimKind {
  switch (kind) {
    case "FACT":
      return "DATA";
    case "MODEL":
      return "MODEL";
    case "ESTIMATE":
      return "ODHAD";
    case "UNKNOWN":
    default:
      return "NEOVERENO";
  }
}

export const EVIDENCE_KIND_HINT: Record<CopilotEvidenceKind, string> = {
  FACT: "Ověřená / aktuální data platformy",
  MODEL: "Modelový výpočet s dokumentovanými předpoklady",
  ESTIMATE: "Orientační odhad — ověřte u specialisty",
  UNKNOWN: "Údaj není ověřen nebo chybí — nepoužíváme jako fakt",
};

export const EVIDENCE_KIND_LABEL_CS: Record<CopilotEvidenceKind, string> = {
  FACT: "Fakt",
  MODEL: "Model",
  ESTIMATE: "Odhad",
  UNKNOWN: "Neznámé",
};

export const CONFIDENCE_LABEL_CS: Record<CopilotConfidence, string> = {
  HIGH: "vysoká",
  MEDIUM: "střední",
  LOW: "nízká",
};

function isFreshTimestamp(iso: string | null | undefined, nowMs: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  return nowMs - t <= FRESHNESS_THRESHOLD_MS.LIVE;
}

function isStaleTimestamp(iso: string | null | undefined, nowMs: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  return nowMs - t > FRESHNESS_THRESHOLD_MS.LIVE;
}

/** Explicit notice when live rate is unavailable (PROMPT 15). */
export function liveRateUnavailableNotice(ratePercent: number): string {
  const formatted = ratePercent.toFixed(2).replace(".", ",");
  return `Aktuální živá sazba není dostupná. Následující výpočet používá modelovou sazbu ${formatted} %.`;
}

export function staleRateNotice(
  ratePercent: number,
  updatedAt: string | null
): string {
  const formatted = ratePercent.toFixed(2).replace(".", ",");
  const when = updatedAt
    ? ` (naposledy ${new Date(updatedAt).toLocaleDateString("cs-CZ")})`
    : "";
  return `Živá sazba není aktuální${when}. Následující výpočet používá poslední dostupnou sazbu ${formatted} % — nejde o závaznou nabídku banky.`;
}

export function resolveRateNotice(
  context: CopilotSessionContext
): string | null {
  const rate = context.modelRatePercent;
  if (rate == null || !(rate > 0)) {
    return liveRateUnavailableNotice(5);
  }
  const layer = context.rateLayer ?? "MODEL";
  if (layer === "LIVE" && context.modelRateClaimKind === "DATA") {
    return null;
  }
  if (layer === "STALE") {
    return staleRateNotice(rate, context.modelRateUpdatedAt);
  }
  return liveRateUnavailableNotice(rate);
}

export type BuildResponseMetaInput = {
  citations: CopilotCitation[];
  usedInputs: CopilotUsedInput[];
  context: CopilotSessionContext;
  intent?: string;
  modelAssumptions?: string[];
  unknowns?: string[];
  /** Tools that failed permission / missing data */
  gated?: boolean;
  nowMs?: number;
};

/**
 * Build confidence + freshness metadata from tool output.
 * Does not invent sources — only classifies what tools already cited.
 */
export function buildResponseMeta(
  input: BuildResponseMetaInput
): CopilotResponseMeta {
  const nowMs = input.nowMs ?? Date.now();
  const citations = input.citations;
  const usedInputs = input.usedInputs;

  let freshSources = 0;
  let staleSources = 0;
  let modelCount = 0;
  let estimateCount = 0;
  let unknownCount = 0;
  const evidenceKinds = new Set<CopilotEvidenceKind>();

  for (const c of citations) {
    const ev = evidenceFromClaim(c.claimKind);
    evidenceKinds.add(ev);
    if (ev === "MODEL") {
      modelCount += 1;
      continue;
    }
    if (ev === "ESTIMATE") {
      estimateCount += 1;
      continue;
    }
    if (ev === "UNKNOWN") {
      unknownCount += 1;
      staleSources += 1;
      continue;
    }
    // FACT
    if (isFreshTimestamp(c.updatedAt, nowMs)) {
      freshSources += 1;
    } else if (isStaleTimestamp(c.updatedAt, nowMs) || !c.updatedAt) {
      // FACT without timestamp → treat conservatively as stale for freshness UI
      staleSources += 1;
    } else {
      freshSources += 1;
    }
  }

  for (const u of usedInputs) {
    evidenceKinds.add(evidenceFromClaim(u.claimKind));
  }

  const rateNotice = resolveRateNotice(input.context);
  const modelAssumptions = [...(input.modelAssumptions ?? [])];
  const unknowns = [...(input.unknowns ?? [])];

  if (rateNotice && !modelAssumptions.some((a) => a.includes("sazb"))) {
    modelAssumptions.push(
      `Úroková sazba: ${input.context.modelRatePercent?.toFixed(2) ?? "5.00"} % p.a. (neživé / modelové pásmo)`
    );
  }
  if (!input.context.hasReadinessProfile) {
    unknowns.push("Chybí lokální profil připravenosti (příjem, zdroje, záměr).");
  }
  if (input.context.modelRatePercent == null) {
    unknowns.push("Živá tržní sazba není v kontextu dostupná.");
  }

  const sourcesUsed = citations.length;
  const confidence = scoreConfidence({
    context: input.context,
    intent: input.intent,
    gated: input.gated,
    sourcesUsed,
    freshSources,
    staleSources,
    modelCount,
    unknownCount,
    unknowns,
    rateLayer: input.context.rateLayer ?? "MODEL",
  });

  const summaryChips = buildSummaryChips({
    confidence,
    sourcesUsed,
    freshSources,
    staleSources,
    modelCount,
    estimateCount,
    unknownCount,
    rateNotice,
  });

  return {
    confidence,
    confidenceLabelCs: CONFIDENCE_LABEL_CS[confidence],
    sourcesUsed,
    freshSources,
    staleSources,
    modelCount,
    estimateCount,
    unknownCount,
    modelAssumptions,
    unknowns,
    evidenceKinds: [...evidenceKinds],
    rateNotice,
    summaryChips,
  };
}

function scoreConfidence(input: {
  context: CopilotSessionContext;
  intent?: string;
  gated?: boolean;
  sourcesUsed: number;
  freshSources: number;
  staleSources: number;
  modelCount: number;
  unknownCount: number;
  unknowns: string[];
  rateLayer: NonNullable<CopilotSessionContext["rateLayer"]>;
}): CopilotConfidence {
  if (
    input.gated ||
    input.intent === "clarify" ||
    input.intent === "out_of_scope" ||
    !input.context.hasReadinessProfile
  ) {
    return "LOW";
  }
  // Citation UNKNOWN evidence (not just listed model limits)
  if (input.unknownCount >= 2) {
    return "LOW";
  }
  if (input.rateLayer === "LIVE" && input.freshSources >= 1 && input.staleSources === 0) {
    return "HIGH";
  }
  if (input.rateLayer === "STALE" || input.staleSources >= 2) {
    return "MEDIUM";
  }
  if (input.rateLayer === "MODEL" || input.modelCount >= 2) {
    return "MEDIUM";
  }
  if (input.sourcesUsed >= 2 && input.context.hasReadinessProfile) {
    return "MEDIUM";
  }
  return "LOW";
}

function buildSummaryChips(input: {
  confidence: CopilotConfidence;
  sourcesUsed: number;
  freshSources: number;
  staleSources: number;
  modelCount: number;
  estimateCount: number;
  unknownCount: number;
  rateNotice: string | null;
}): { id: string; label: string }[] {
  const chips: { id: string; label: string }[] = [
    {
      id: "confidence",
      label: `Důvěra odpovědi: ${CONFIDENCE_LABEL_CS[input.confidence]}`,
    },
  ];
  if (input.sourcesUsed > 0) {
    chips.push({
      id: "sources",
      label: `Použito ${input.sourcesUsed} ${sourceWord(input.sourcesUsed)}`,
    });
  }
  if (input.freshSources > 0) {
    chips.push({
      id: "fresh",
      label: `${input.freshSources} čerstvých`,
    });
  }
  if (input.staleSources > 0) {
    chips.push({
      id: "stale",
      label: `${input.staleSources} zastaralých / neověřených`,
    });
  }
  if (input.modelCount > 0) {
    chips.push({
      id: "model",
      label:
        input.modelCount === 1
          ? "1 údaj je modelový"
          : `${input.modelCount} modelových údajů`,
    });
  }
  if (input.estimateCount > 0) {
    chips.push({
      id: "estimate",
      label:
        input.estimateCount === 1
          ? "1 údaj je odhad"
          : `${input.estimateCount} odhadů`,
    });
  }
  if (input.unknownCount > 0) {
    chips.push({
      id: "unknown",
      label: `${input.unknownCount} neznámých`,
    });
  }
  if (input.rateNotice) {
    chips.push({ id: "rate", label: "Sazba: model / ne živá" });
  }
  return chips;
}

function sourceWord(n: number): string {
  if (n === 1) return "zdroj";
  if (n >= 2 && n <= 4) return "zdroje";
  return "zdrojů";
}

/**
 * Prepend rate notice to markdown when live rate is missing.
 */
export function prependRateNotice(
  markdown: string,
  context: CopilotSessionContext
): string {
  const notice = resolveRateNotice(context);
  if (!notice) return markdown;
  if (markdown.includes("živá sazba není") || markdown.includes("modelovou sazbu")) {
    return markdown;
  }
  return `> **${notice}**\n\n${markdown}`;
}
