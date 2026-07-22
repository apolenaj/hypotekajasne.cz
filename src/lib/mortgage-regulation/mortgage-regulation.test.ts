/**
 * MortgageRegulationEngine unit tests — PROMPT 4.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGE_PURPOSE_DEPENDENCY_NOTICE,
  evaluateMortgageRegulation,
  resolveAppliedBucket,
  resolveCzPeriod,
} from "@/lib/mortgage-regulation";

const base = {
  country: "cz" as const,
  applicantType: "individual" as const,
  numberOfOwnedResidentialProperties: null as number | null,
  investmentPurpose: false as boolean | null,
  effectiveDate: "2026-07-21",
};

describe("resolveAppliedBucket", () => {
  it("owner_occupied stays owner when no investment signals", () => {
    assert.equal(
      resolveAppliedBucket({
        purpose: "owner_occupied",
        investmentPurpose: false,
        numberOfOwnedResidentialProperties: 0,
      }),
      "owner_occupied"
    );
  });

  it("investment purpose and additional_residential map to investment", () => {
    assert.equal(
      resolveAppliedBucket({
        purpose: "investment",
        investmentPurpose: null,
        numberOfOwnedResidentialProperties: 0,
      }),
      "investment"
    );
    assert.equal(
      resolveAppliedBucket({
        purpose: "additional_residential",
        investmentPurpose: null,
        numberOfOwnedResidentialProperties: 0,
      }),
      "investment"
    );
  });

  it("2+ owned residential → investment (3rd+ purchase)", () => {
    assert.equal(
      resolveAppliedBucket({
        purpose: "owner_occupied",
        investmentPurpose: false,
        numberOfOwnedResidentialProperties: 2,
      }),
      "investment"
    );
  });
});

describe("evaluateMortgageRegulation — age / purpose", () => {
  it("young applicant under 36 gets 90% LTV for owner-occupied", () => {
    const r = evaluateMortgageRegulation({
      ...base,
      purpose: "owner_occupied",
      age: 30,
    });
    assert.equal(r.maxLtv, 90);
    assert.equal(r.youngLtvApplied, true);
    assert.equal(r.appliedBucket, "owner_occupied");
    assert.equal(r.dtiStatus, "deactivated");
    assert.equal(r.dstiStatus, "deactivated");
    assert.match(r.explanation, /90/);
    assert.ok(r.assumptions.includes(AGE_PURPOSE_DEPENDENCY_NOTICE));
  });

  it("applicant at/above 36 gets 80% LTV", () => {
    const r = evaluateMortgageRegulation({
      ...base,
      purpose: "owner_occupied",
      age: 36,
    });
    assert.equal(r.maxLtv, 80);
    assert.equal(r.youngLtvApplied, false);
  });

  it("unknown age never uses 90% young LTV", () => {
    const ages: Array<number | null | undefined> = [null, undefined, 0, -1];
    for (const age of ages) {
      const r = evaluateMortgageRegulation({
        ...base,
        purpose: "owner_occupied",
        age,
      });
      assert.equal(r.maxLtv, 80, `age=${String(age)}`);
      assert.equal(r.youngLtvApplied, false);
      assert.ok(
        r.assumptions.some((a) => a.includes("age_unknown_no_young_ltv_boost"))
      );
    }
  });

  it("investment case uses 70% LTV and DTI 7 after 2026-04-01", () => {
    const r = evaluateMortgageRegulation({
      ...base,
      purpose: "investment",
      age: 30,
      effectiveDate: "2026-04-01",
    });
    assert.equal(r.maxLtv, 70);
    assert.equal(r.youngLtvApplied, false);
    assert.equal(r.dtiStatus, "recommended_limit");
    assert.equal(r.dtiLimit, 7);
    assert.equal(r.appliedBucket, "investment");
  });

  it("standard owner-occupied without young boost", () => {
    const r = evaluateMortgageRegulation({
      ...base,
      purpose: "owner_occupied",
      age: 45,
    });
    assert.equal(r.maxLtv, 80);
    assert.equal(r.ruleType, "CNB_RECOMMENDATION");
    assert.match(r.frameworkDisclaimer, /Orientační regulační/);
  });
});

describe("evaluateMortgageRegulation — effective date periods", () => {
  it("before 2026-04-01 investment LTV is not the post-2026 70%", () => {
    const pre = evaluateMortgageRegulation({
      ...base,
      purpose: "investment",
      age: 40,
      effectiveDate: "2026-03-31",
    });
    assert.equal(resolveCzPeriod("2026-03-31").id, "cz-pre-2026-04");
    assert.equal(pre.maxLtv, 80);
    assert.equal(pre.dtiStatus, "deactivated");
    assert.equal(pre.dtiLimit, null);
  });

  it("on/after 2026-04-01 investment LTV is 70%", () => {
    const post = evaluateMortgageRegulation({
      ...base,
      purpose: "investment",
      age: 40,
      effectiveDate: "2026-04-01",
    });
    assert.equal(resolveCzPeriod("2026-04-01").id, "cz-from-2026-04");
    assert.equal(post.maxLtv, 70);
    assert.equal(post.dtiLimit, 7);
  });

  it("young LTV still age-gated before rule change", () => {
    const young = evaluateMortgageRegulation({
      ...base,
      purpose: "owner_occupied",
      age: 28,
      effectiveDate: "2025-06-01",
    });
    const unknown = evaluateMortgageRegulation({
      ...base,
      purpose: "owner_occupied",
      age: null,
      effectiveDate: "2025-06-01",
    });
    assert.equal(young.maxLtv, 90);
    assert.equal(unknown.maxLtv, 80);
  });
});
