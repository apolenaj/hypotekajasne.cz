import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CurrentRates } from "@/lib/rates";
import {
  buildAlertCenterDashboard,
  buildLtvRateChangeAlert,
  dedupeAlerts,
  buildFingerprint,
  rateChangeKey,
  ltvScopeKey,
} from "@/lib/alert-center";
import { defaultAlertCenterStore } from "@/lib/alert-center/types";

const TEST_RATES: CurrentRates = {
  rateWithInsurance: 4.89,
  rateWithoutInsurance: 4.99,
  rpsnWithInsurance: null,
  rpsnWithoutInsurance: null,
  withoutInsuranceOrientational: true,
  updatedAt: "2026-07-01T00:00:00Z",
};

describe("specific rate copy", () => {
  it("never uses generic sazby klesly", () => {
    const alert = buildLtvRateChangeAlert({
      previousRate: 5.14,
      currentRate: 4.89,
      ltvPercent: 80,
      purpose: "owner_occupied",
      action: { label: "Test", href: "/" },
      fetchedAt: TEST_RATES.updatedAt,
    })!;
    assert.ok(alert.title.includes("LTV"));
    assert.ok(alert.title.includes("p.b."));
    assert.ok(!alert.title.toLowerCase().includes("sazby klesly"));
    assert.ok(alert.whyExplanation.includes("LTV"));
    assert.ok(alert.reason.includes("4,89"));
  });
});

describe("deduplication", () => {
  it("merges same fingerprint", () => {
    const fp = buildFingerprint(
      "RATE_CHANGE",
      ltvScopeKey(80),
      rateChangeKey(5.14, 4.89)
    );
    const a = buildLtvRateChangeAlert({
      previousRate: 5.14,
      currentRate: 4.89,
      ltvPercent: 80,
      purpose: "owner_occupied",
      action: { label: "A", href: "/" },
      fetchedAt: null,
    })!;
    const b = { ...a, id: "dup2", priority: 4 as const };
    const { alerts, removedCount } = dedupeAlerts([a, b]);
    assert.equal(alerts.length, 1);
    assert.equal(removedCount, 1);
    assert.equal(alerts[0]!.fingerprint, fp);
  });
});

describe("alert center dashboard", () => {
  it("builds with required fields", () => {
    const dash = buildAlertCenterDashboard({
      store: defaultAlertCenterStore(),
      rates: TEST_RATES,
      collectContext: { previousRatePercent: 5.14 },
    });
    assert.ok(dash.alerts.length > 0);
    for (const a of dash.alerts) {
      assert.ok(a.severity);
      assert.ok(a.priority >= 1 && a.priority <= 5);
      assert.ok(a.reason);
      assert.ok(a.action.href);
      assert.ok(a.dataSource.module);
      assert.ok(a.whyExplanation.length > 10);
    }
  });

  it("respects off preference", () => {
    const store = defaultAlertCenterStore();
    store.preferences.byType.RATE_CHANGE = "off";
    const dash = buildAlertCenterDashboard({
      store,
      rates: TEST_RATES,
      collectContext: { previousRatePercent: 5.14 },
    });
    assert.ok(
      !dash.immediateAlerts.some((a) => a.type === "RATE_CHANGE")
    );
  });
});

describe("notification channels", () => {
  it("documents consent requirement for email", () => {
    const dash = buildAlertCenterDashboard({
      store: defaultAlertCenterStore(),
      rates: TEST_RATES,
    });
    assert.equal(dash.channelStatus.email.consentRequired, true);
    assert.equal(dash.channelStatus.in_app.status, "LIVE");
  });
});
