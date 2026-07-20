/**
 * Property Digital Twin — timeline event factory.
 * Events emitted on domain mutations (append-only audit).
 */

import type {
  PropertyDigitalTwin,
  TwinTimelineEvent,
  TwinTimelineEventKind,
} from "@/lib/digital-twin/types";
import type { ClaimKind } from "@/lib/property-rentgen/types";

function eventId(kind: string): string {
  return `te_${kind}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createTimelineEvent(input: {
  kind: TwinTimelineEventKind;
  title: string;
  summary: string;
  claimKind: ClaimKind;
  at?: string;
  refId?: string;
  payload?: Record<string, string | number | null>;
}): TwinTimelineEvent {
  return {
    id: eventId(input.kind),
    at: input.at ?? new Date().toISOString(),
    kind: input.kind,
    title: input.title,
    summary: input.summary,
    claimKind: input.claimKind,
    refId: input.refId ?? null,
    payload: input.payload,
  };
}

/** Map domain changes → standard timeline events */
export const TIMELINE_EVENT_CATALOG: Record<
  TwinTimelineEventKind,
  { label: string; description: string }
> = {
  purchased: {
    label: "Purchased",
    description: "Uživatel zadal nákup / převedl twin do owned.",
  },
  renovated: {
    label: "Renovated",
    description: "Dokončen nebo zahájen renovation project.",
  },
  tenant_changed: {
    label: "Tenant changed",
    description: "Nový nájemník / rent observation s jiným tenantLabel.",
  },
  rent_increased: {
    label: "Rent increased",
    description: "Nová rent observation vyšší než předchozí.",
  },
  refinanced: {
    label: "Refinanced",
    description: "Aktualizace financing snapshot (sazba, fixace, lender).",
  },
  value_estimated: {
    label: "Estimated value changed",
    description: "Přidána valueHistory observation — vždy se source/method/confidence.",
  },
  expense_recorded: { label: "Expense", description: "Nový expense record." },
  document_added: { label: "Document", description: "Nový document ref." },
  insurance_renewed: { label: "Insurance", description: "Insurance policy update." },
  occupancy_changed: { label: "Occupancy", description: "Nové occupancy období." },
  relationship_changed: {
    label: "Relationship",
    description: "watched → owned nebo sold.",
  },
};

export function appendTimelineEvent(
  twin: PropertyDigitalTwin,
  event: TwinTimelineEvent,
  maxEvents = 200
): PropertyDigitalTwin {
  return {
    ...twin,
    updatedAt: new Date().toISOString(),
    timeline: [event, ...twin.timeline].slice(0, maxEvents),
  };
}
