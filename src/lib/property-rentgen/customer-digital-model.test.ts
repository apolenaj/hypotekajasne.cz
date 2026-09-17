import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTROL_GOLDEN,
  CONTROL_MODEL_INPUTS,
  runControlModel,
} from "@/lib/property-rentgen/control-model";
import {
  buildControlInputsFromCustomer,
  canRunCustomerDigitalModel,
  runCustomerDigitalModelFromManual,
} from "@/lib/property-rentgen/customer-digital-model";
import { EMPTY_MANUAL_INPUT } from "@/lib/property-rentgen/preview";

describe("customer digital model", () => {
  it("does not silently use control-model purchase price or rent", () => {
    const outcome = runCustomerDigitalModelFromManual({
      ...EMPTY_MANUAL_INPUT,
      priceCzk: 3_500_000,
      areaM2: 55,
      rentMonthlyCzk: 16_500,
      equityCzk: 1_050_000,
      purpose: "investment",
    });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    assert.equal(outcome.result.inputs.purchasePriceCzk, 3_500_000);
    assert.equal(outcome.result.inputs.monthlyRentCzk, 16_500);
    assert.notEqual(
      outcome.result.inputs.purchasePriceCzk,
      CONTROL_MODEL_INPUTS.purchasePriceCzk
    );
    assert.notEqual(
      outcome.result.monthlyCashFlowCzk,
      CONTROL_GOLDEN.monthlyCashFlowCzk
    );
  });

  it("blocks when rent is missing (missing ≠ zero)", () => {
    const outcome = runCustomerDigitalModelFromManual({
      ...EMPTY_MANUAL_INPUT,
      priceCzk: 3_500_000,
      areaM2: 55,
      rentMonthlyCzk: null,
      equityCzk: 1_050_000,
    });
    assert.equal(outcome.ok, false);
    if (outcome.ok) return;
    assert.ok(outcome.missing.some((m) => m.includes("nájem")));
  });

  it("maps equity to loan without inventing demo loan amount", () => {
    const inputs = buildControlInputsFromCustomer({
      purchasePriceCzk: 4_000_000,
      areaM2: 60,
      monthlyRentCzk: 18_000,
      equityTowardPurchaseCzk: 1_200_000,
    });
    assert.equal(inputs.loanAmountCzk, 2_800_000);
    assert.equal(inputs.loanToPurchaseRatio, 0.7);
    const r = runControlModel(inputs);
    assert.ok(Number.isFinite(r.monthlyCashFlowCzk));
  });

  it("canRunCustomerDigitalModel requires core fields", () => {
    assert.equal(
      canRunCustomerDigitalModel({
        ...EMPTY_MANUAL_INPUT,
        priceCzk: 1,
        areaM2: 1,
        rentMonthlyCzk: 1,
        equityCzk: 0,
      }),
      true
    );
    assert.equal(
      canRunCustomerDigitalModel({
        ...EMPTY_MANUAL_INPUT,
        priceCzk: 1,
        areaM2: 1,
        rentMonthlyCzk: null,
        equityCzk: 0,
      }),
      false
    );
  });
});
