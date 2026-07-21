/**
 * Moje možnosti — orchestration tests (reuse existing engines).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_PROFILE } from "@/lib/financial-passport";
import {
  buildMojeMoznostiResult,
  canComputeFirstResult,
  profileToMatchingForm,
} from "@/lib/moje-moznosti";

describe("moje-moznosti", () => {
  it("requires intent + income for first result", () => {
    assert.equal(canComputeFirstResult(EMPTY_PROFILE), false);
    assert.equal(
      canComputeFirstResult({
        ...EMPTY_PROFILE,
        intent: "owner_occupied",
        netIncome: 60_000,
        ownFunds: 800_000,
      }),
      true
    );
  });

  it("builds finance + readiness + markets without inventing approval", () => {
    const result = buildMojeMoznostiResult(
      {
        ...EMPTY_PROFILE,
        intent: "owner_occupied",
        netIncome: 60_000,
        ownFunds: 800_000,
        incomeType: "employee",
        age: 35,
      },
      5,
      "MODEL"
    );

    assert.equal(result.finance.claimKind, "MODEL");
    assert.ok(result.finance.modelMaxBudget == null || result.finance.modelMaxBudget > 0);
    assert.ok(result.readiness.score >= 0 && result.readiness.score <= 100);
    assert.ok(result.markets.markets.length >= 1);
    assert.ok(result.nextActions.length >= 3);
    assert.match(result.finance.claimNote, /ne schválení/i);
    assert.ok(!JSON.stringify(result).toLowerCase().includes("schváleno bankou"));
  });

  it("maps profile to matching form without PII", () => {
    const form = profileToMatchingForm({
      ...EMPTY_PROFILE,
      intent: "investment",
      ownFunds: 1_000_000,
    });
    assert.equal(form.name, "");
    assert.equal(form.email, "");
    assert.equal(form.phone, "");
    assert.ok(Number(form.capital) >= 1_000_000);
  });
});
