import type {
  DealRoomRole,
  DocumentSharePermission,
  TimelineStep,
  TimelineStepId,
} from "@/lib/deal-room/types";
import { TIMELINE_STEP_IDS, TIMELINE_STEP_LABELS } from "@/lib/deal-room/types";

const STEP_DOCS: Partial<Record<TimelineStepId, string[]>> = {
  property_selected: ["Identifikace nemovitosti"],
  analysis_complete: ["Investiční rentgen / analýza (MODEL)"],
  viewing: ["Potvrzení termínu prohlídky"],
  offer: ["Písemná nabídka nebo protinabídka"],
  reservation: ["Rezervační smlouva", "Rezervační vklad"],
  financing: [
    "Doklady o příjmu",
    "Výpisy z účtu",
    "Hypoteční dokumentace",
  ],
  valuation: ["Znalecký posudek / bankovní odhad"],
  legal_review: ["List vlastnictví", "Právní prověrka smluv"],
  contract: ["Kupní smlouva", "Smlouva o úvěru"],
  land_registry: ["Návrh na vklad", "Plnomocenství"],
  handover: ["Předávací protokol", "PENB"],
};

const STEP_OWNERS: Record<TimelineStepId, DealRoomRole> = {
  property_selected: "user",
  analysis_complete: "hypoteka_jasne",
  viewing: "agent_developer",
  offer: "user",
  reservation: "agent_developer",
  financing: "mortgage_specialist",
  valuation: "mortgage_specialist",
  legal_review: "lawyer",
  contract: "lawyer",
  land_registry: "lawyer",
  handover: "agent_developer",
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function buildDefaultTimeline(createdAt: string): TimelineStep[] {
  const base = Date.parse(createdAt);
  const offsets = [0, 3, 7, 14, 21, 28, 35, 42, 49, 56, 70];

  return TIMELINE_STEP_IDS.map((id, i) => {
    let status: TimelineStep["status"] = "pending";
    if (i === 0) status = "completed";
    if (i === 1) status = "in_progress";
    if (i === 2) status = "waiting";

    return {
      id,
      label: TIMELINE_STEP_LABELS[id],
      status,
      owner: STEP_OWNERS[id],
      dueAt: addDays(new Date(base).toISOString(), offsets[i] ?? 30),
      completedAt: i === 0 ? createdAt : null,
      requiredDocuments: STEP_DOCS[id] ?? [],
      notes: null,
      claimKind: "ODHAD" as const,
    };
  });
}

export function buildDefaultContacts(): import("@/lib/deal-room/types").DealRoomContact[] {
  return [
    {
      role: "user",
      label: "Kupující",
      email: null,
      phone: null,
      connected: true,
    },
    {
      role: "hypoteka_jasne",
      label: "Hypotéka Jasně",
      email: null,
      phone: null,
      connected: true,
    },
    {
      role: "majetio",
      label: "Majetio",
      email: null,
      phone: null,
      connected: true,
    },
    {
      role: "mortgage_specialist",
      label: "Licencovaný specialista",
      email: null,
      phone: null,
      connected: false,
    },
    {
      role: "agent_developer",
      label: "Makléř / developer",
      email: null,
      phone: null,
      connected: false,
    },
    {
      role: "lawyer",
      label: "Právník",
      email: null,
      phone: null,
      connected: false,
    },
  ];
}

export function buildDefaultTasks(createdAt: string): import("@/lib/deal-room/types").DealRoomTask[] {
  const due = addDays(createdAt, 7);
  return [
    {
      id: "task_viewing",
      title: "Domluvit prohlídku s makléřem",
      owner: "user",
      dueAt: due,
      done: false,
      section: "timeline",
    },
    {
      id: "task_financing",
      title: "Doplnit dokumenty ve Vault pro financování",
      owner: "user",
      dueAt: addDays(createdAt, 14),
      done: false,
      section: "documents",
    },
    {
      id: "task_specialist",
      title: "Propojit hypotečního specialistu",
      owner: "hypoteka_jasne",
      dueAt: addDays(createdAt, 5),
      done: false,
      section: "contacts",
    },
  ];
}

export function canShareDocument(input: {
  permissions: DocumentSharePermission[];
  documentId: string;
  fromRole: DealRoomRole;
  toRole: DealRoomRole;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  return input.permissions.some(
    (p) =>
      p.documentId === input.documentId &&
      p.fromRole === input.fromRole &&
      p.toRole === input.toRole &&
      !p.revokedAt &&
      (p.expiresAt == null || Date.parse(p.expiresAt) > now.getTime())
  );
}

/** Documents visible to role — user always sees own; others need explicit permission */
export function documentsVisibleToRole(
  documents: { id: string; visibleToRoles: DealRoomRole[] }[],
  permissions: DocumentSharePermission[],
  role: DealRoomRole,
  viewerRole: DealRoomRole
): string[] {
  if (viewerRole === "user" || viewerRole === role) {
    return documents
      .filter((d) => d.visibleToRoles.includes(viewerRole) || viewerRole === "user")
      .map((d) => d.id);
  }
  return documents
    .filter((d) =>
      canShareDocument({
        permissions,
        documentId: d.id,
        fromRole: "user",
        toRole: viewerRole,
      })
    )
    .map((d) => d.id);
}

export function grantDocumentShare(input: {
  documentId: string;
  fromRole: DealRoomRole;
  toRole: DealRoomRole;
  grantedBy: DealRoomRole;
  consentNote: string;
  expiresInDays?: number;
}): DocumentSharePermission {
  const now = new Date();
  const expiresAt =
    input.expiresInDays != null
      ? new Date(now.getTime() + input.expiresInDays * 86_400_000).toISOString()
      : null;
  return {
    id: `perm_${now.getTime().toString(36)}`,
    documentId: input.documentId,
    fromRole: input.fromRole,
    toRole: input.toRole,
    grantedBy: input.grantedBy,
    grantedAt: now.toISOString(),
    expiresAt,
    revokedAt: null,
    consentNote: input.consentNote,
  };
}

export { STEP_OWNERS };
