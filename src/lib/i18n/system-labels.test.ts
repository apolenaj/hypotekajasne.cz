import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  claimKindLabel,
  dataStatusTextLabel,
  ensureCzechUiLabel,
  readinessBandLabel,
  rateUiKindLabel,
} from "@/lib/i18n/system-labels";

describe("system-labels CS mapping", () => {
  it("maps readiness bands to Czech (never raw snake_case)", () => {
    assert.equal(
      readinessBandLabel("moderate_readiness"),
      "Střední modelová připravenost"
    );
    assert.equal(
      readinessBandLabel("high_readiness"),
      "Vysoká modelová připravenost"
    );
    assert.equal(
      readinessBandLabel("low_readiness"),
      "Nízká modelová připravenost"
    );
    assert.ok(!readinessBandLabel("moderate_readiness").includes("_"));
  });

  it("maps rate UI kind LIVE to Czech prose", () => {
    assert.equal(rateUiKindLabel("LIVE"), "Aktuální data");
    assert.ok(!rateUiKindLabel("LIVE").includes("LIVE"));
  });

  it("maps claim kinds and data status for prose UI", () => {
    assert.equal(claimKindLabel("MODEL"), "Model");
    assert.equal(dataStatusTextLabel("LIVE"), "Aktuální");
    assert.equal(dataStatusTextLabel("STALE"), "Vyžaduje aktualizaci");
  });

  it("ensureCzechUiLabel catches leaked snake_case", () => {
    assert.equal(
      ensureCzechUiLabel("building_readiness"),
      "Budování modelové připravenosti"
    );
    assert.equal(ensureCzechUiLabel("Běžná česká věta."), "Běžná česká věta.");
  });
});
