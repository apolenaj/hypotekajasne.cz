/**
 * Write production + verification SQL from the verified CZ mortgage manifest.
 * Does not execute SQL against Supabase.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  EXPECTED_IMPORT_READY_RATES,
  generateMortgageMarketImportSql,
} from "../src/lib/mortgage-market/import/generate-sql";
import { validateMortgageMarketImport } from "../src/lib/mortgage-market/import/validate";
import { verifyEvidenceIntegrity } from "../src/lib/mortgage-market/import/evidence-integrity";
import { CZ_2026_08_09_MANIFEST } from "../src/lib/mortgage-market/import/data/cz-2026-08-09";

const validation = validateMortgageMarketImport(CZ_2026_08_09_MANIFEST);
if (validation.issues.length > 0) {
  console.error("Manifest validator failed", validation.issues);
  process.exit(1);
}

const integrity = verifyEvidenceIntegrity(CZ_2026_08_09_MANIFEST);
if (integrity.zeroInference !== "PASS") {
  console.error("Evidence integrity failed", integrity.issues);
  process.exit(1);
}

const report = generateMortgageMarketImportSql(CZ_2026_08_09_MANIFEST);

if (report.generatedRateInserts !== EXPECTED_IMPORT_READY_RATES) {
  console.error(
    `STOP: generated ${report.generatedRateInserts} != expected ${EXPECTED_IMPORT_READY_RATES}`
  );
  process.exit(1);
}
if (report.difference !== 0) {
  console.error("STOP: reconciliation difference != 0");
  process.exit(1);
}
if (
  report.forbiddenValuesPresent.csStale509 ||
  report.forbiddenValuesPresent.kbStale539 ||
  report.forbiddenValuesPresent.kbStale579 ||
  report.forbiddenValuesPresent.csobHoldRates ||
  report.forbiddenValuesPresent.rbKlasikRates
) {
  console.error("STOP: forbidden values present in generated rates");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "supabase", "imports");
mkdirSync(outDir, { recursive: true });

const productionPath = path.join(
  outDir,
  "cz_mortgage_market_2026_08_09.sql"
);
const verifyPath = path.join(
  outDir,
  "cz_mortgage_market_2026_08_09_verify.sql"
);

writeFileSync(productionPath, report.productionSql, "utf8");
writeFileSync(verifyPath, report.verifySql, "utf8");

console.log(
  JSON.stringify(
    {
      production: productionPath,
      verification: verifyPath,
      reconciliation: {
        manifestImportReadyRates: report.manifestImportReadyRates,
        generatedRateInserts: report.generatedRateInserts,
        difference: report.difference,
      },
      byLender: report.byLender,
      excludedHoldRateIds: report.excludedHoldRateIds,
      products: report.products,
      conditions: report.conditions,
      fees: report.fees,
      examples: report.examples,
      eligibility: report.eligibility,
      evidence: report.evidence,
    },
    null,
    2
  )
);
