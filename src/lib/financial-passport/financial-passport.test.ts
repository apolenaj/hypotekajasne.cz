import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFinancialPassportDocument,
  fromReadinessAnswers,
  overallFromDimensions,
  computeDimensionScores,
  runSimulation,
  runWhatIf,
  toMajetioHandoff,
  rankScoreLevers,
  whatIfFromProfile,
  SCORE_DIMENSIONS,
  SCORE_DIMENSION_WEIGHTS,
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
  it("builds PROMPT 17 dimensions and weighted overall", () => {
    const profile = fromReadinessAnswers(sample);
    const doc = buildFinancialPassportDocument(profile, 4.5);
    assert.equal(doc.version, 2);
    assert.equal(doc.readiness.dimensions.length, 7);
    assert.deepEqual([...SCORE_DIMENSIONS], [
      "income_stability",
      "equity",
      "liquidity",
      "debt_load",
      "affordability_stress",
      "documentation_readiness",
      "regulatory_fit",
    ]);
    const weightSum = Object.values(SCORE_DIMENSION_WEIGHTS).reduce(
      (a, b) => a + b,
      0
    );
    assert.ok(Math.abs(weightSum - 1) < 0.001);
    const recomputed = overallFromDimensions(doc.readiness.dimensions);
    assert.equal(doc.readiness.overall, recomputed);
    assert.ok(doc.readiness.overall > 0 && doc.readiness.overall <= 100);
    assert.ok(doc.financing.estimatedMaximum != null);
    assert.ok(doc.financing.safeMonthlyPayment != null);
    assert.ok(doc.readiness.bandLabel.includes("model"));
    assert.ok(doc.readiness.financingStatusLabel.includes("model"));
  });

  it("each dimension has score + explanation", () => {
    const profile = fromReadinessAnswers(sample);
    const dims = computeDimensionScores(profile, 5);
    for (const d of dims) {
      assert.ok(d.score >= 0 && d.score <= 100);
      assert.ok(d.weight > 0);
      assert.ok(d.explanation.length > 10);
    }
  });

  it("next actions are model-only (no bank approval claims)", () => {
    const doc = buildFinancialPassportDocument(fromReadinessAnswers(sample), 5);
    assert.ok(doc.readiness.nextActions.length > 0);
    const text = JSON.stringify(doc.readiness.nextActions).toLowerCase();
    const forbidden = ["banka vás schválí", "banka schválí", "budete schváleni"];
    for (const phrase of forbidden) {
      assert.equal(text.includes(phrase), false, phrase);
    }
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

  it("what-if recalculates income, capital and rate", () => {
    const profile = fromReadinessAnswers(sample);
    const base = whatIfFromProfile(profile, 5);
    const r1 = runWhatIf(profile, {
      ...base,
      incomeDeltaCzk: 10_000,
      liabilitiesDeltaCzk: 0,
      capitalDeltaCzk: 0,
      targetPriceDeltaCzk: 0,
      modelRatePercent: 5,
    }, 5);
    assert.ok(r1.scoreDelta >= 0);

    const r2 = runWhatIf(profile, {
      ...base,
      incomeDeltaCzk: 0,
      liabilitiesDeltaCzk: 0,
      capitalDeltaCzk: 300_000,
      targetPriceDeltaCzk: 0,
      modelRatePercent: 5,
    }, 5);
    assert.ok(r2.scoreDelta >= 0);

    const r3 = runWhatIf(profile, {
      ...base,
      modelRatePercent: 8.5,
    }, 5);
    const stressBefore = r3.baseline.readiness.dimensions.find(
      (d) => d.id === "affordability_stress"
    )?.score;
    const stressAfter = r3.simulated.readiness.dimensions.find(
      (d) => d.id === "affordability_stress"
    )?.score;
    assert.notEqual(stressBefore, stressAfter);
  });

  it("regulatory_fit uses CZ engine for owner-occupied", () => {
    const profile = fromReadinessAnswers(sample);
    const dims = computeDimensionScores(profile, 5);
    const reg = dims.find((d) => d.id === "regulatory_fit");
    assert.ok(reg);
    assert.ok(reg.explanation.includes("LTV"));
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
