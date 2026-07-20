import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFinancialPassportDocument,
  fromReadinessAnswers,
  overallFromDimensions,
  computeDimensionScores,
  runSimulation,
  toMajetioHandoff,
  rankScoreLevers,
} from "@/lib/financial-passport";
import { buildFinancialPassport } from "@/lib/majetio/passport";
import {
  EMPTY_ANSWERS,
  calculateReadiness,
  type ReadinessAnswers,
} from "@/lib/mortgage-readiness";

const sample: ReadinessAnswers = {
  ...EMPTY_ANSWERS,
  intent: "owner_occupied",
  age: 35,
  incomeType: "employee",
  netIncome: 70_000,
  ownFunds: 800_000,
  targetPrice: 5_000_000,
  noRecentDefaults: true,
  employmentMonths: 24,
};

describe("Financial Passport v2 document", () => {
  it("builds 7 dimensions and weighted overall", () => {
    const profile = fromReadinessAnswers(sample);
    const doc = buildFinancialPassportDocument(profile, 4.5);
    assert.equal(doc.version, 2);
    assert.equal(doc.readiness.dimensions.length, 7);
    const recomputed = overallFromDimensions(doc.readiness.dimensions);
    assert.equal(doc.readiness.overall, recomputed);
    assert.ok(doc.readiness.overall > 0 && doc.readiness.overall <= 100);
    assert.ok(doc.financing.estimatedMaximum != null);
    assert.ok(doc.financing.safeMonthlyPayment != null);
  });

  it("does not expose PII in majetio handoff", () => {
    const doc = buildFinancialPassportDocument(fromReadinessAnswers(sample), 5);
    const handoff = toMajetioHandoff(doc);
    const json = JSON.stringify(handoff);
    assert.equal(json.includes("email"), false);
    assert.equal(json.includes("phone"), false);
    assert.equal(handoff.version, 1);
    assert.equal(handoff.purpose, "owner_occupied");
  });

  it("legacy buildFinancialPassport stays compatible", () => {
    const result = calculateReadiness(sample, 4.5);
    const fp = buildFinancialPassport(sample, result, 4.5);
    assert.equal(fp.version, 1);
    assert.ok(fp.ownFunds === 800_000);
    assert.equal(fp.country, "Česká republika");
  });

  it("simulation increases score when paying off loans", () => {
    const profile = fromReadinessAnswers({
      ...sample,
      otherLiabilities: 8_000,
      creditLimitPayments: 3_000,
    });
    const sim = runSimulation(profile, "pay_off_loan", 0, 5);
    assert.ok(sim.scoreDelta >= 0);
  });

  it("ranks score levers", () => {
    const profile = fromReadinessAnswers({
      ...sample,
      creditLimitPayments: 4_000,
    });
    const dims = computeDimensionScores(profile, 5);
    const overall = overallFromDimensions(dims);
    const levers = rankScoreLevers(profile, 5, overall);
    assert.ok(Array.isArray(levers));
  });
});
