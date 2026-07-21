import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMarketPulseDashboard,
  buildMarketMetrics,
  getSelectedMarket,
  scanOpportunityRadar,
  REGULATORY_CHANGELOG,
  buildHistoricalTrend,
  defaultOpportunityCriteria,
} from "@/lib/market-pulse";
import type { CurrentRates } from "@/lib/rates";

const TEST_RATES: CurrentRates = {
  rateWithInsurance: 4.89,
  rateWithoutInsurance: null,
  rpsnWithInsurance: null,
  rpsnWithoutInsurance: null,
  withoutInsuranceOrientational: false,
  updatedAt: "2026-07-01T00:00:00Z",
};

describe("market pulse insights", () => {
  it("generates factual price insight for CZ 1Y", () => {
    const metrics = buildMarketMetrics("cz", null);
    const price = metrics.find((m) => m.kind === "property_price")!;
    assert.ok(price.insights.length > 0);
    const insight = price.insights[0].text;
    assert.ok(insight.includes("vzrost") || insight.includes("klesl") || insight.includes("stejn"));
    assert.ok(!insight.toLowerCase().includes("nejlepší čas"));
    assert.ok(!insight.toLowerCase().includes("koupit"));
  });

  it("CZ mortgage rate uses LIVE when rates provided", () => {
    const metrics = buildMarketMetrics("cz", {
      ...TEST_RATES,
    });
    const rate = metrics.find((m) => m.kind === "mortgage_rate")!;
    assert.equal(rate.currentValue, 4.89);
    assert.equal(rate.record?.status, "LIVE");
  });

  it("foreign rates are not LIVE", () => {
    const metrics = buildMarketMetrics("dubai", null);
    const rate = metrics.find((m) => m.kind === "mortgage_rate")!;
    assert.notEqual(rate.record?.status, "LIVE");
  });

  it("supply and DOM are unavailable not invented", () => {
    const metrics = buildMarketMetrics("cz", null);
    const supply = metrics.find((m) => m.kind === "supply")!;
    const dom = metrics.find((m) => m.kind === "days_on_market")!;
    assert.equal(supply.currentValue, null);
    assert.equal(dom.currentValue, null);
    assert.equal(supply.insights.length, 0);
  });
});

describe("timeframes", () => {
  it("1M and 3M unavailable for yearly historical", () => {
    const trend = buildHistoricalTrend({
      countryId: "cz",
      timeframe: "1M",
      getValue: (p) => p.apt70m,
      unit: "czk",
      claimKind: "MODEL",
      status: "MODEL",
    });
    assert.equal(trend.available, false);
  });

  it("1Y trend is available for CZ prices", () => {
    const trend = buildHistoricalTrend({
      countryId: "cz",
      timeframe: "1Y",
      getValue: (p) => p.apt70m,
      unit: "czk",
      claimKind: "MODEL",
      status: "MODEL",
    });
    assert.equal(trend.available, true);
    assert.notEqual(trend.changePercent, null);
  });
});

describe("opportunity radar", () => {
  it("includes disclaimer on every alert", () => {
    const alerts = scanOpportunityRadar(
      defaultOpportunityCriteria({ minYieldPercent: 3, maxMarketRiskScore: 80 })
    );
    for (const a of alerts) {
      assert.ok(a.disclaimer.includes("Nejedná se o investiční doporučení"));
      assert.ok(!a.headline.toLowerCase().includes("garantovan"));
    }
  });

  it("does not claim guaranteed opportunity in body", () => {
    const alerts = scanOpportunityRadar(defaultOpportunityCriteria());
    for (const a of alerts) {
      assert.ok(!a.body.toLowerCase().includes("garantovan"));
      assert.equal(a.claimKind, "MODEL");
    }
  });
});

describe("regulatory changelog", () => {
  it("includes CNB 2026 entries", () => {
    assert.ok(REGULATORY_CHANGELOG.some((e) => e.id.includes("cnb-2026")));
    assert.ok(REGULATORY_CHANGELOG.some((e) => e.status === "VERIFIED"));
  });
});

describe("dashboard build", () => {
  it("builds for all supported markets", () => {
    const dash = buildMarketPulseDashboard({});
    assert.ok(dash.markets.length >= 8);
    const selected = getSelectedMarket(dash);
    assert.equal(selected.countryId, "cz");
    assert.ok(dash.methodology.some((m) => m.includes("nejlepší čas")));
  });
});
