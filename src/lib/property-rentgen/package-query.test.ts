import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analysisPackageFromQuery,
  packageQueryValue,
  samplePackageFromQuery,
} from "@/lib/property-rentgen/package-query";

describe("analysisPackageFromQuery", () => {
  it("maps balicek query to digital / premium tiers", () => {
    assert.equal(analysisPackageFromQuery("999"), "digital");
    assert.equal(analysisPackageFromQuery("digital"), "digital");
    assert.equal(analysisPackageFromQuery("4990"), "premium");
    assert.equal(analysisPackageFromQuery("premium"), "premium");
    assert.equal(analysisPackageFromQuery(null), "digital");
    assert.equal(analysisPackageFromQuery(""), "digital");
    assert.equal(analysisPackageFromQuery("free"), "digital");
  });

  it("round-trips package query values for paid tiers", () => {
    assert.equal(packageQueryValue("digital"), "999");
    assert.equal(packageQueryValue("premium"), "4990");
    assert.equal(
      analysisPackageFromQuery(packageQueryValue("premium")),
      "premium"
    );
  });

  it("maps sample page toggle the same way", () => {
    assert.equal(samplePackageFromQuery("4990"), "premium");
    assert.equal(samplePackageFromQuery("999"), "digital");
  });
});
