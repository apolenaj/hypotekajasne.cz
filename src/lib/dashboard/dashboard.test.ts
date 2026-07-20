import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDashboardModel,
  detectPersona,
  rankDashboardWidgets,
  resolveNextBestAction,
  recommendEducation,
} from "@/lib/dashboard";
import {
  buildFinancialPassportDocument,
  fromReadinessAnswers,
} from "@/lib/financial-passport";
import { EMPTY_ANSWERS, type ReadinessAnswers } from "@/lib/mortgage-readiness";
import type { CurrentRates } from "@/lib/rates";

const emptyRates: CurrentRates = {
  rateWithInsurance: null,
  rateWithoutInsurance: null,
  rpsnWithInsurance: null,
  rpsnWithoutInsurance: null,
  withoutInsuranceOrientational: false,
  updatedAt: null,
};

const sample: ReadinessAnswers = {
  ...EMPTY_ANSWERS,
  intent: "owner_occupied",
  age: 36,
  incomeType: "employee",
  netIncome: 65_000,
  ownFunds: 900_000,
  targetPrice: 5_500_000,
  noRecentDefaults: true,
  employmentMonths: 24,
};

describe("dashboard persona + relevance", () => {
  it("onboarding without profile", () => {
    assert.equal(detectPersona(null, []), "onboarding");
  });

  it("buyer with complete owner-occupied profile", () => {
    const doc = buildFinancialPassportDocument(
      fromReadinessAnswers(sample),
      4.5
    );
    assert.equal(detectPersona(doc, []), "buyer");
  });

  it("investor with investment intent", () => {
    const doc = buildFinancialPassportDocument(
      fromReadinessAnswers({ ...sample, intent: "investment" }),
      5
    );
    assert.equal(detectPersona(doc, []), "investor");
  });

  it("relevance engine caps widgets and keeps next action", () => {
    const doc = buildFinancialPassportDocument(
      fromReadinessAnswers(sample),
      5
    );
    const widgets = rankDashboardWidgets({
      persona: "buyer",
      doc,
      watchlistCount: 0,
      alertCount: 0,
      hasTimelineChange: false,
      completeness: 80,
    });
    assert.ok(widgets.length <= 6);
    assert.ok(widgets.length >= 3);
    assert.ok(widgets.some((w) => w.id === "next_best_action"));
    // Should not dump all 10
    assert.ok(widgets.length < 10);
  });

  it("onboarding caps to fewer widgets", () => {
    const widgets = rankDashboardWidgets({
      persona: "onboarding",
      doc: null,
      watchlistCount: 0,
      alertCount: 0,
      hasTimelineChange: false,
      completeness: 0,
    });
    assert.ok(widgets.length <= 4);
  });
});

describe("dashboard model build", () => {
  it("builds personalized model with profile-relevant rates only", () => {
    const doc = buildFinancialPassportDocument(
      fromReadinessAnswers(sample),
      4.8
    );
    const model = buildDashboardModel({
      doc,
      timeline: [],
      watchlist: [],
      rates: {
        ...emptyRates,
        rateWithInsurance: 4.8,
        updatedAt: "2026-07-20T00:00:00.000Z",
      },
    });
    assert.equal(model.isPersonalized, true);
    assert.ok(model.readiness?.score);
    assert.ok(model.buyingPower?.max != null || model.buyingPower?.safe != null);
    assert.ok(model.marketRates.every((r) => r.relevanceNote.length > 0));
    assert.ok(!model.marketRates.some((r) => r.label.includes("Dubaj 15")));
    assert.equal(model.nextAction.id.length > 0, true);
  });

  it("foreign purchase does not invent local foreign rates", () => {
    const doc = buildFinancialPassportDocument(
      fromReadinessAnswers({
        ...sample,
        intent: "foreign_purchase",
        targetCountry: "SAE (Dubaj)",
        hasCzCollateral: true,
        czCollateralEquity: 2_000_000,
      }),
      5
    );
    const model = buildDashboardModel({
      doc,
      timeline: [],
      watchlist: [],
      rates: { ...emptyRates, rateWithInsurance: 4.9, updatedAt: null },
    });
    const foreign = model.marketRates.find((r) => r.id === "foreign_local");
    assert.ok(foreign);
    assert.equal(foreign!.ratePercent, null);
    assert.equal(foreign!.claimKind, "NEOVERENO");
  });

  it("next action asks for income when missing", () => {
    const doc = buildFinancialPassportDocument(
      fromReadinessAnswers({ ...sample, netIncome: 0 }),
      5
    );
    const action = resolveNextBestAction({
      doc,
      properties: [],
      watchlist: [],
    });
    assert.equal(action.id, "add_income");
  });

  it("education recommends limited lessons", () => {
    const recs = recommendEducation(null);
    assert.ok(recs.length <= 3);
    assert.ok(recs.length >= 1);
  });
});
