/**
 * Phase 2 Step 2.3 — SQL generation reconciles to verified manifest.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXPECTED_IMPORT_READY_RATES,
  generateMortgageMarketImportSql,
} from "@/lib/mortgage-market/import/generate-sql";
import { CZ_2026_08_09_MANIFEST } from "@/lib/mortgage-market/import/data/cz-2026-08-09";

describe("generateMortgageMarketImportSql", () => {
  it("emits exactly 65 IMPORT_READY rates and excludes HOLD/forbidden values", () => {
    const report = generateMortgageMarketImportSql(CZ_2026_08_09_MANIFEST);

    assert.equal(report.manifestImportReadyRates, EXPECTED_IMPORT_READY_RATES);
    assert.equal(report.generatedRateInserts, 65);
    assert.equal(report.difference, 0);
    assert.equal(report.excludedHoldRateIds.length, 7);

    assert.equal(report.forbiddenValuesPresent.cs494, false);
    assert.equal(report.forbiddenValuesPresent.kb514, false);
    assert.equal(report.forbiddenValuesPresent.csobHoldRates, false);
    assert.equal(report.forbiddenValuesPresent.rbKlasikRates, false);

    assert.match(report.productionSql, /^begin;/m);
    assert.match(report.productionSql, /^commit;/m);
    assert.equal(
      (report.productionSql.match(/insert into public\.mortgage_rate_variants/g) ?? [])
        .length,
      65
    );

    const rateInsertBlock =
      report.productionSql.split("-- 4) rate variants (IMPORT_READY only)")[1]?.split(
        "-- 5) rate conditions"
      )[0] ?? "";
    assert.equal(
      (rateInsertBlock.match(/insert into public\.mortgage_rate_variants/g) ?? [])
        .length,
      65
    );
    assert.ok(!rateInsertBlock.includes("[manifest:cs-web-campaign-"));
    assert.ok(!rateInsertBlock.includes("[manifest:csob-"));
    assert.doesNotMatch(rateInsertBlock, /,\s*4\.94\s*,/);
    assert.doesNotMatch(rateInsertBlock, /,\s*5\.14\s*,/);
    assert.ok(!rateInsertBlock.includes("retail-klasik"));

    // Lender rate counts
    assert.equal(report.byLender["air-bank"], 20);
    assert.equal(report.byLender["moneta"], 15);
    assert.equal(report.byLender["unicredit"], 6);
    assert.equal(report.byLender["ceska-sporitelna"], 9);
    assert.equal(report.byLender["komercni-banka"], 15);
    assert.equal(report.byLender["csob"] ?? 0, 0);
    assert.equal(report.byLender["raiffeisenbank"] ?? 0, 0);

    // Verify SQL is read-only
    assert.doesNotMatch(report.verifySql, /^\s*(insert|update|delete|truncate)\b/im);
    assert.match(report.verifySql, /cs_494_count/);
    assert.match(report.verifySql, /kb_514_count/);
  });
});
