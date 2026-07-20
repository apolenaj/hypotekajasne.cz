import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bootstrapTwinFromWatchTarget } from "@/lib/digital-twin/bootstrap";
import {
  computeTwinSnapshot,
  computeCurrentEquity,
  selectLatestValueObservation,
} from "@/lib/digital-twin/compute";
import {
  DIGITAL_TWIN_BLUEPRINT,
  DIGITAL_TWIN_FEATURE_STATUS,
} from "@/lib/digital-twin/architecture";
import { emptyTwin } from "@/lib/digital-twin/types";
import { emptyWatchTarget } from "@/lib/watchlist/types";

describe("digital twin architecture invariants", () => {
  it("feature is COMING_SOON", () => {
    assert.equal(DIGITAL_TWIN_FEATURE_STATUS, "COMING_SOON");
    assert.ok(DIGITAL_TWIN_BLUEPRINT.principles.length >= 4);
  });

  it("forbids auto valuation without source", () => {
    assert.ok(
      DIGITAL_TWIN_BLUEPRINT.valueObservationPolicy.forbiddenWithoutSource.some(
        (f) => f.includes("current_market")
      )
    );
    assert.ok(
      DIGITAL_TWIN_BLUEPRINT.nonGoals.some((g) =>
        /aktuální|auto-valuation|Scraping/i.test(g)
      )
    );
  });

  it("bootstrap from watch does not seed valueHistory from price alone", () => {
    const target = emptyWatchTarget({
      id: "w1",
      kind: "property",
      label: "Byt",
      priceCzk: 5_000_000,
      city: "Praha",
    });
    const twin = bootstrapTwinFromWatchTarget(target);
    assert.equal(twin.valueHistory.length, 0);
    assert.equal(twin.purchase.purchasePriceCzk, 5_000_000);
    assert.equal(twin.relationship, "watched");
  });

  it("equity is null without value observation", () => {
    const twin = emptyTwin({
      id: "t1",
      label: "Test",
      relationship: "owned",
      financing: {
        loanAmountCzk: 3_000_000,
        ratePercent: 5,
        termYears: 30,
        fixationEnd: null,
        lenderLabel: null,
        monthlyPaymentCzk: 18_000,
        claimKind: "DATA",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    const eq = computeCurrentEquity(twin);
    assert.equal(eq.value, null);
    assert.ok(eq.blockers.some((b) => /valueHistory/i.test(b)));
  });

  it("equity computes only with explicit value observation", () => {
    const twin = emptyTwin({
      id: "t2",
      label: "Test",
      relationship: "owned",
      valueHistory: [
        {
          id: "v1",
          observedAt: "2026-06-01T00:00:00.000Z",
          valueCzk: 6_000_000,
          source: "bank_appraisal",
          method: "bank_valuation",
          confidence: "high",
          claimKind: "DATA",
        },
      ],
      mortgageBalanceHistory: [
        {
          id: "b1",
          asOf: "2026-06-01T00:00:00.000Z",
          balanceCzk: 4_000_000,
          source: "bank_statement",
          claimKind: "DATA",
        },
      ],
    });
    const eq = computeCurrentEquity(twin);
    assert.equal(eq.value, 2_000_000);
    assert.equal(eq.blockers.length, 0);
  });

  it("snapshot exposes latest value observation metadata", () => {
    const obs = {
      id: "v1",
      observedAt: "2026-01-15T00:00:00.000Z",
      valueCzk: 5_500_000,
      source: "user_entered" as const,
      method: "manual" as const,
      confidence: "medium" as const,
      claimKind: "DATA" as const,
    };
    const twin = emptyTwin({
      id: "t3",
      label: "X",
      relationship: "watched",
      valueHistory: [obs],
    });
    const snap = computeTwinSnapshot(twin, { currentMarketRatePercent: 5 });
    assert.deepEqual(snap.latestValueObservation, obs);
    assert.equal(selectLatestValueObservation(twin.valueHistory)?.source, "user_entered");
  });

  it("annualized return stays blocked until CF history exists", () => {
    const twin = emptyTwin({ id: "t4", label: "Y", relationship: "owned" });
    const snap = computeTwinSnapshot(twin);
    assert.equal(snap.annualizedReturn.value, null);
    assert.ok(snap.annualizedReturn.blockers.length > 0);
  });

  it("integrations define dashboard and copilot touchpoints", () => {
    assert.ok(
      DIGITAL_TWIN_BLUEPRINT.integrations.portfolioDashboard.touchpoints.some(
        (t) => t.includes("dashboard")
      )
    );
    assert.ok(
      DIGITAL_TWIN_BLUEPRINT.integrations.copilot.touchpoints.some((t) =>
        t.includes("twin.getSnapshot")
      )
    );
  });
});
