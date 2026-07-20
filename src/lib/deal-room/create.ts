import type {
  CreateDealRoomInput,
  DealRoomNowSummary,
  DealRoomWorkspace,
  TimelineStep,
} from "@/lib/deal-room/types";
import { DEAL_ROOM_ROLE_LABELS } from "@/lib/deal-room/types";
import {
  buildDefaultContacts,
  buildDefaultTasks,
  buildDefaultTimeline,
} from "@/lib/deal-room/timeline";

export function createDealRoomWorkspace(
  input: CreateDealRoomInput,
  now: Date = new Date()
): DealRoomWorkspace {
  const createdAt = now.toISOString();
  const id = `deal_${now.getTime().toString(36)}`;

  return {
    id,
    createdAt,
    updatedAt: createdAt,
    status: "active",
    seriousInterestAt: createdAt,
    property: {
      title: input.propertyTitle,
      address: input.propertyAddress,
      country: input.country,
      priceCzk: input.priceCzk ?? null,
      majetioListingRef: input.majetioListingRef ?? null,
      listingUrl: input.listingUrl ?? null,
    },
    timeline: buildDefaultTimeline(createdAt),
    contacts: buildDefaultContacts(),
    documents: [],
    sharePermissions: [],
    questions: [],
    offers: [],
    tasks: buildDefaultTasks(createdAt),
    financingRouteRef: null,
    analysisRef: null,
  };
}

export function buildNowSummary(workspace: DealRoomWorkspace): DealRoomNowSummary {
  const active =
    workspace.timeline.find((s) => s.status === "in_progress") ??
    workspace.timeline.find((s) => s.status === "waiting") ??
    null;

  const waitingStep = workspace.timeline.find((s) => s.status === "waiting");
  const blockedStep = workspace.timeline.find((s) => s.status === "blocked");

  let happeningNow = "Transakce je v přípravě.";
  let waitingFor = "—";
  let whoseTurn: DealRoomNowSummary["whoseTurn"] = "user";

  if (active) {
    happeningNow = `Aktuální krok: ${active.label} (${active.status}).`;
    whoseTurn = active.owner;
    if (active.status === "in_progress") {
      waitingFor = `Dokončení kroku „${active.label}“ — odpovědnost: ${DEAL_ROOM_ROLE_LABELS[active.owner]}.`;
    } else if (active.status === "waiting") {
      waitingFor = `Čekáme na: ${DEAL_ROOM_ROLE_LABELS[active.owner]}.`;
    }
  }

  if (waitingStep && waitingStep.id !== active?.id) {
    waitingFor += ` Další ve frontě: ${waitingStep.label}.`;
  }
  if (blockedStep) {
    happeningNow = `Blokováno: ${blockedStep.label}.`;
    whoseTurn = blockedStep.owner;
    waitingFor = blockedStep.notes ?? "Vyřešte blokující podmínku.";
  }

  const openTasks = workspace.tasks.filter((t) => !t.done);
  if (openTasks.length > 0 && active?.owner === "user") {
    happeningNow += ` Máte ${openTasks.length} otevřených úkolů.`;
  }

  return {
    happeningNow,
    waitingFor,
    whoseTurn,
    whoseTurnLabel: DEAL_ROOM_ROLE_LABELS[whoseTurn],
    activeStep: active,
  };
}

export function advanceTimelineStep(
  workspace: DealRoomWorkspace,
  stepId: TimelineStep["id"]
): DealRoomWorkspace {
  const idx = workspace.timeline.findIndex((s) => s.id === stepId);
  if (idx < 0) return workspace;

  const timeline = workspace.timeline.map((s, i) => {
    if (s.id === stepId) {
      return {
        ...s,
        status: "completed" as const,
        completedAt: new Date().toISOString(),
      };
    }
    if (i === idx + 1) {
      return { ...s, status: "in_progress" as const };
    }
    return s;
  });

  return { ...workspace, timeline, updatedAt: new Date().toISOString() };
}
