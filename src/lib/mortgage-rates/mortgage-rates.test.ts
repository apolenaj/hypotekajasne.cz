/**
 * Domain helpers (history / mapping) — runtime SoT is mortgageRateService.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planMortgageRateSupersede } from "@/lib/mortgage-rates/history";
import { mapRowToMortgageRateRecord } from "@/lib/mortgage-rates/select";
import {
  MORTGAGE_PURPOSES,
  MORTGAGE_RATE_KINDS,
  isMortgagePurpose,
  isMortgageRateKind,
  type MortgageRateRecord,
  type MortgageRateRow,
} from "@/lib/mortgage-rates/types";

const NOW = Date.parse("2026-08-08T12:00:00.000Z");

function daysAgo(days: number): string {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();
}

function row(overrides: Partial<MortgageRateRow> = {}): MortgageRateRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    country_code: "CZ",
    purpose: "purchase",
    fixation_years: 5,
    ltv_min: 0,
    ltv_max: 80,
    ltv_min_exclusive: false,
    ltv_max_exclusive: false,
    rate: 4.89,
    rate_kind: "illustrative",
    provider_name: null,
    source_name: "Owner weekly review",
    source_url: null,
    checked_at: daysAgo(3),
    valid_from: daysAgo(30),
    valid_to: null,
    is_active: true,
    notes: "Orientační reference",
    ...overrides,
  };
}

describe("central mortgage rate enums", () => {
  it("allows purchase / refinance / investment purposes only", () => {
    assert.deepEqual([...MORTGAGE_PURPOSES], [
      "purchase",
      "refinance",
      "investment",
    ]);
    assert.equal(isMortgagePurpose("investment"), true);
    assert.equal(isMortgagePurpose("construction"), false);
  });

  it("allows illustrative / model / market_reference kinds only", () => {
    assert.deepEqual([...MORTGAGE_RATE_KINDS], [
      "illustrative",
      "model",
      "market_reference",
    ]);
    assert.equal(isMortgageRateKind("guaranteed"), false);
    assert.equal(isMortgageRateKind("offer"), false);
  });
});

describe("history-preserving supersede plan", () => {
  it("deactivates old row and inserts a new active row", () => {
    const previous = mapRowToMortgageRateRecord(row()) as MortgageRateRecord;
    const at = "2026-08-08T12:00:00.000Z";
    const plan = planMortgageRateSupersede({
      previous,
      rate: 4.75,
      checkedAt: at,
    });

    assert.equal(plan.deactivate.id, previous.id);
    assert.equal(plan.deactivate.isActive, false);
    assert.equal(plan.deactivate.validTo, at);
    assert.equal(plan.insert.isActive, true);
    assert.equal(plan.insert.validFrom, at);
    assert.equal(plan.insert.validTo, null);
    assert.equal(plan.insert.rate, 4.75);
  });

  it("rejects superseding an inactive historical row", () => {
    const previous = mapRowToMortgageRateRecord(
      row({ is_active: false, valid_to: daysAgo(1) })
    ) as MortgageRateRecord;
    assert.throws(() =>
      planMortgageRateSupersede({
        previous,
        rate: 4.5,
        checkedAt: "2026-08-08T12:00:00.000Z",
      })
    );
  });
});
