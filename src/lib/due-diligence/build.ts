import { templatesForPropertyType } from "@/lib/due-diligence/checklists";
import type {
  DDChecklistItem,
  DueDiligenceInput,
  DueDiligenceModel,
  DDSummary,
  ExpertEscalation,
  TrafficLight,
} from "@/lib/due-diligence/types";
import {
  assertNotGreenFromUnknown,
  isVerifiedStatus,
} from "@/lib/due-diligence/types";
import { routes } from "@/lib/routes";

/**
 * Všechny položky startují GREY — absence dat ≠ OK.
 * GREEN jen s explicitní evidence + source.
 */
export function buildChecklistItems(
  input: DueDiligenceInput,
  now: Date = new Date()
): DDChecklistItem[] {
  const templates = templatesForPropertyType(input.propertyType);
  const ts = now.toISOString();

  return templates.map((t) => {
    const override = input.itemOverrides[t.id];
    let status: TrafficLight = override?.status ?? "GREY";
    const evidence = override?.evidence ?? null;
    const source = override?.source ?? null;

    status = assertNotGreenFromUnknown("GREY", status, Boolean(evidence && source));

    if (status === "GREEN" && (!evidence || !source)) {
      status = "GREY";
    }

    return {
      id: t.id,
      category: t.category,
      label: t.label,
      description: t.description,
      status,
      evidence,
      source,
      responsibleParty: t.responsibleParty,
      severity: t.defaultSeverity,
      claimKind: status === "GREEN" ? "DATA" : status === "RED" ? "ODHAD" : "NEOVERENO",
      updatedAt: override ? ts : null,
    };
  });
}

export function buildSummary(items: DDChecklistItem[]): DDSummary {
  const verifiedCount = items.filter((i) => i.status === "GREEN").length;
  const checkRequiredCount = items.filter((i) => i.status === "AMBER").length;
  const materialIssueCount = items.filter((i) => i.status === "RED").length;
  const unknownCount = items.filter((i) => i.status === "GREY").length;

  const parts: string[] = [];
  if (verifiedCount > 0) {
    parts.push(
      `${verifiedCount} ${verifiedCount === 1 ? "položka ověřena" : verifiedCount < 5 ? "položky ověřeny" : "položek ověřeno"}`
    );
  }
  if (checkRequiredCount > 0) {
    parts.push(
      `${checkRequiredCount} ${checkRequiredCount === 1 ? "vyžaduje kontrolu" : "vyžadují kontrolu"}`
    );
  }
  if (materialIssueCount > 0) {
    parts.push(
      `${materialIssueCount} ${materialIssueCount === 1 ? "potenciálně zásadní" : "potenciálně zásadní"}`
    );
  }
  if (unknownCount > 0 && parts.length === 0) {
    parts.push(`${unknownCount} položek neznámých — začněte ověřováním`);
  }

  const summaryLine =
    parts.length > 0 ? parts.join(" · ") : "Zatím bez ověřených položek";

  return {
    verifiedCount,
    checkRequiredCount,
    materialIssueCount,
    unknownCount,
    summaryLine,
  };
}

export function buildExpertEscalation(
  items: DDChecklistItem[],
  summary: DDSummary
): ExpertEscalation {
  const criticalRed = items.filter(
    (i) => i.status === "RED" && (i.severity === "critical" || i.severity === "high")
  );
  const recommended =
    summary.materialIssueCount > 0 ||
    criticalRed.length > 0 ||
    (summary.verifiedCount === 0 && summary.unknownCount >= 3);

  let reason =
    "Preventivní konzultace s licencovaným právníkem nebo specialistou.";
  if (summary.materialIssueCount > 0) {
    reason = `${summary.materialIssueCount} položek označeno jako potenciálně zásadní — doporučujeme human-expert review před nabídkou.`;
  } else if (summary.verifiedCount === 0 && summary.unknownCount >= 3) {
    reason =
      "Většina položek je neznámá (GREY) — absence dat neznamená absenci rizika. Expert pomůže prioritizovat prověrku.";
  }

  return {
    recommended,
    reason,
    urgency: summary.materialIssueCount > 0 ? "high" : "standard",
    ctaLabel: "Eskalovat na human-expert review",
    ctaHref: routes.navrhNaMiru,
  };
}

export function buildDueDiligenceModel(
  input: DueDiligenceInput,
  now: Date = new Date()
): DueDiligenceModel {
  const items = buildChecklistItems(input, now);
  const summary = buildSummary(items);
  const escalation = buildExpertEscalation(items, summary);

  return {
    generatedAt: now.toISOString(),
    input,
    items,
    summary,
    escalation,
    methodology: [
      "Všechny položky startují GREY — unknown není green.",
      "GREEN vyžaduje evidence + source — AI nevyvozuje OK z absence dat.",
      "Checklist se personalizuje dle typu nemovitosti.",
      "RED = potenciální materiální issue — ne automatický právní závěr.",
      "Human-expert escalation doporučena při RED nebo převaze GREY.",
      "Hypotéka Jasně poskytuje edukaci — ne právní due diligence.",
    ],
  };
}

export { isVerifiedStatus };
