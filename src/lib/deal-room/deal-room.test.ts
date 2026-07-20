import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDealRoomDashboard } from "@/lib/deal-room/build";
import { createDealRoomWorkspace, buildNowSummary } from "@/lib/deal-room/create";
import { DEMO_DEAL_ROOM_SEEDED } from "@/lib/deal-room/demo";
import {
  buildDefaultTimeline,
  canShareDocument,
  grantDocumentShare,
  documentsVisibleToRole,
} from "@/lib/deal-room/timeline";
import { TIMELINE_STEP_IDS } from "@/lib/deal-room/types";

describe("createDealRoomWorkspace", () => {
  it("creates workspace with 11 timeline steps", () => {
    const ws = createDealRoomWorkspace({
      propertyTitle: "Test byt",
      propertyAddress: "Test 1",
      country: "cz",
    });
    assert.equal(ws.timeline.length, TIMELINE_STEP_IDS.length);
    assert.equal(ws.status, "active");
    assert.ok(ws.seriousInterestAt);
  });

  it("connects default ecosystem contacts", () => {
    const ws = createDealRoomWorkspace({
      propertyTitle: "Test",
      propertyAddress: "A",
      country: "spain",
    });
    const roles = ws.contacts.map((c) => c.role);
    assert.ok(roles.includes("hypoteka_jasne"));
    assert.ok(roles.includes("majetio"));
    assert.ok(roles.includes("mortgage_specialist"));
  });
});

describe("buildNowSummary", () => {
  it("answers what is happening, waiting, whose turn", () => {
    const summary = buildNowSummary(DEMO_DEAL_ROOM_SEEDED);
    assert.ok(summary.happeningNow.length > 0);
    assert.ok(summary.waitingFor.length > 0);
    assert.ok(summary.whoseTurnLabel.length > 0);
    assert.ok(summary.activeStep);
  });
});

describe("permission model — no auto share", () => {
  it("denies share without permission", () => {
    assert.equal(
      canShareDocument({
        permissions: [],
        documentId: "dr_doc_reservation",
        fromRole: "user",
        toRole: "lawyer",
      }),
      false
    );
  });

  it("allows share after explicit grant", () => {
    const perm = grantDocumentShare({
      documentId: "dr_doc_reservation",
      fromRole: "user",
      toRole: "lawyer",
      grantedBy: "user",
      consentNote: "Souhlasím se sdílením pro právní prověrku.",
    });
    assert.equal(
      canShareDocument({
        permissions: [perm],
        documentId: "dr_doc_reservation",
        fromRole: "user",
        toRole: "lawyer",
      }),
      true
    );
  });

  it("lawyer cannot see user-only doc without permission", () => {
    const docs = DEMO_DEAL_ROOM_SEEDED.documents.map((d) => ({
      id: d.id,
      visibleToRoles: d.visibleToRoles,
    }));
    const visible = documentsVisibleToRole(
      docs,
      [],
      "user",
      "lawyer"
    );
    assert.ok(!visible.includes("dr_doc_reservation"));
  });
});

describe("timeline steps", () => {
  it("each step has owner and required docs fields", () => {
    const steps = buildDefaultTimeline(new Date().toISOString());
    for (const s of steps) {
      assert.ok(s.owner);
      assert.ok(Array.isArray(s.requiredDocuments));
    }
  });
});

describe("buildDealRoomDashboard", () => {
  it("builds full dashboard", () => {
    const dash = buildDealRoomDashboard(DEMO_DEAL_ROOM_SEEDED);
    assert.ok(dash.now.happeningNow);
    assert.ok(dash.methodology.length > 0);
  });
});
