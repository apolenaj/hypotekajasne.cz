import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildB2bPortalDashboard,
  computeIsolatedAnalysisScore,
  createAnalysisOrder,
  defaultB2bPortalStore,
  deliverAnalysisOrder,
  recordAnalysisPayment,
  seedDemoB2bStore,
  submitProperty,
  B2B_SCORE_ISOLATION_RULES,
  trackShareEngagement,
} from "@/lib/b2b-portal";
import { DEMO_AGENT_ORG } from "@/lib/b2b-portal/demo";

describe("B2B portal architecture", () => {
  it("defines score isolation rules", () => {
    assert.ok(B2B_SCORE_ISOLATION_RULES.length >= 3);
    assert.ok(
      B2B_SCORE_ISOLATION_RULES.some((r) => r.includes("Payment status"))
    );
  });
});

describe("organization & roles", () => {
  it("seeds demo orgs with active member", () => {
    const store = seedDemoB2bStore(defaultB2bPortalStore());
    assert.ok(store.activeOrgId);
    assert.ok(store.activeMemberId);
    assert.equal(Object.keys(store.organizations).length, 4);
  });

  it("builds dashboard for agent org", () => {
    const dash = buildB2bPortalDashboard(seedDemoB2bStore(defaultB2bPortalStore()));
    assert.ok(dash.organization);
    assert.ok(dash.member);
    assert.ok(dash.permissions.includes("analysis.order"));
  });
});

describe("analysis order — payment does not affect score", () => {
  it("freezes score at order and after payment", () => {
    let store = seedDemoB2bStore(defaultB2bPortalStore());
    const memberId = store.activeMemberId!;
    const orgId = DEMO_AGENT_ORG.id;

    const { store: s1, submission } = submitProperty({
      store,
      orgId,
      memberId,
      data: {
        label: "Test byt",
        country: "Česká republika",
        city: "Praha",
        propertyType: "Byt",
        areaM2: 55,
        priceCzk: 5_200_000,
        rentMonthlyCzk: 19_500,
        listingUrl: null,
        notes: null,
      },
    });
    store = s1;

    const scoreAtSubmit = computeIsolatedAnalysisScore(submission);
    const { store: s2, order } = createAnalysisOrder({
      store,
      orgId,
      memberId,
      propertySubmissionId: submission.id,
    });
    store = s2;

    assert.equal(order.scoreSnapshot.paymentDoesNotAffectScore, true);
    assert.equal(
      order.scoreSnapshot.investmentScore,
      scoreAtSubmit.investmentScore
    );

    store = recordAnalysisPayment({ store, orderId: order.id, memberId });
    const paid = store.analysisOrders[order.id]!;
    assert.equal(paid.status, "paid");
    assert.equal(paid.scoreSnapshot.investmentScore, order.scoreSnapshot.investmentScore);
    assert.equal(paid.scoreSnapshot.computedAt, order.scoreSnapshot.computedAt);
  });

  it("delivers report with majetio branding and share token", () => {
    let store = seedDemoB2bStore(defaultB2bPortalStore());
    const memberId = store.activeMemberId!;
    const orgId = DEMO_AGENT_ORG.id;

    const { store: s1, submission } = submitProperty({
      store,
      orgId,
      memberId,
      data: {
        label: "Delivery test",
        country: "Česká republika",
        city: "Brno",
        propertyType: "Byt",
        areaM2: 48,
        priceCzk: 4_500_000,
        rentMonthlyCzk: 17_000,
        listingUrl: null,
        notes: null,
      },
    });
    const { store: s2, order } = createAnalysisOrder({
      store: s1,
      orgId,
      memberId,
      propertySubmissionId: submission.id,
    });
    store = recordAnalysisPayment({ store: s2, orderId: order.id, memberId });
    store = deliverAnalysisOrder({
      store,
      orderId: order.id,
      memberId,
      orgName: DEMO_AGENT_ORG.name,
    });
    const delivered = store.analysisOrders[order.id]!;
    assert.equal(delivered.status, "delivered");
    assert.ok(delivered.reportId);
    assert.ok(delivered.shareToken?.startsWith("shr_"));
    assert.equal(delivered.majetioIntelligenceBranded, true);
  });
});

describe("engagement tracking", () => {
  it("tracks anonymous events", () => {
    let store = seedDemoB2bStore(defaultB2bPortalStore());
    const { event } = trackShareEngagement({
      store,
      analysisOrderId: "ord_test",
      orgId: DEMO_AGENT_ORG.id,
      memberId: store.activeMemberId!,
      eventType: "view",
    });
    assert.ok(event.anonymousViewerHash.startsWith("vh_"));
    assert.equal(event.eventType, "view");
  });
});

describe("sponsored placements", () => {
  it("marks sponsored and doesNotAffectScore on orders", () => {
    let store = seedDemoB2bStore(defaultB2bPortalStore());
    const { store: s1, submission } = submitProperty({
      store,
      orgId: DEMO_AGENT_ORG.id,
      memberId: store.activeMemberId!,
      data: {
        label: "Sponsored test",
        country: "Česká republika",
        city: "Ostrava",
        propertyType: "Byt",
        areaM2: 50,
        priceCzk: 3_000_000,
        rentMonthlyCzk: 15_000,
        listingUrl: null,
        notes: null,
      },
    });
    const { order } = createAnalysisOrder({
      store: s1,
      orgId: DEMO_AGENT_ORG.id,
      memberId: store.activeMemberId!,
      propertySubmissionId: submission.id,
    });
    assert.ok(order.sponsoredPlacements.length > 0);
    for (const sp of order.sponsoredPlacements) {
      assert.equal(sp.isSponsored, true);
      assert.equal(sp.doesNotAffectScore, true);
    }
  });
});

describe("developer projects", () => {
  it("includes units and financing in demo seed", () => {
    const store = seedDemoB2bStore(defaultB2bPortalStore());
    const projects = Object.values(store.developerProjects);
    assert.ok(projects.length > 0);
    assert.ok(projects[0]!.units.length >= 2);
    assert.ok(projects[0]!.financingOptions.length >= 1);
  });
});
