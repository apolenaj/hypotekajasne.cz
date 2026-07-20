import { appendB2bAudit } from "@/lib/b2b-portal/audit";
import type { B2bPortalStore, ShareEngagementEvent } from "@/lib/b2b-portal/types";

function hashViewer(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
  }
  return `vh_${(h >>> 0).toString(36)}`;
}

export function getAnonymousViewerHash(): string {
  if (typeof window === "undefined") return "vh_server";
  const key = "hj-b2b-viewer-seed";
  let seed = sessionStorage.getItem(key);
  if (!seed) {
    seed =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36);
    sessionStorage.setItem(key, seed);
  }
  return hashViewer(seed);
}

export function trackShareEngagement(input: {
  store: B2bPortalStore;
  analysisOrderId: string;
  orgId: string;
  memberId: string;
  eventType: ShareEngagementEvent["eventType"];
  metadata?: Record<string, string | number>;
}): { store: B2bPortalStore; event: ShareEngagementEvent } {
  const event: ShareEngagementEvent = {
    id: `eng_${Date.now().toString(36)}`,
    analysisOrderId: input.analysisOrderId,
    orgId: input.orgId,
    eventType: input.eventType,
    anonymousViewerHash: getAnonymousViewerHash(),
    metadata: input.metadata ?? {},
    at: new Date().toISOString(),
  };

  appendB2bAudit({
    orgId: input.orgId,
    actorMemberId: input.memberId,
    action: "engagement_tracked",
    resourceType: "engagement",
    resourceId: event.id,
    metadata: { eventType: event.eventType, anonymous: true },
  });

  return {
    store: {
      ...input.store,
      engagementEvents: [event, ...input.store.engagementEvents].slice(0, 500),
    },
    event,
  };
}

export function engagementSummaryForOrder(
  store: B2bPortalStore,
  orderId: string
): { views: number; downloads: number; ctaClicks: number } {
  const events = store.engagementEvents.filter((e) => e.analysisOrderId === orderId);
  return {
    views: events.filter((e) => e.eventType === "view").length,
    downloads: events.filter((e) => e.eventType === "download").length,
    ctaClicks: events.filter((e) => e.eventType === "cta_click").length,
  };
}

export function engagementSummaryForOrg(
  store: B2bPortalStore,
  orgId: string
): { totalEvents: number; uniqueViewers: number } {
  const events = store.engagementEvents.filter((e) => e.orgId === orgId);
  const unique = new Set(events.map((e) => e.anonymousViewerHash));
  return { totalEvents: events.length, uniqueViewers: unique.size };
}
