/**
 * Generate sample PDFs to tmp/ for QA (page count via pdf-lib / buffer heuristics).
 * Usage: npx tsx --tsconfig tsconfig.pipeline-tests.json scripts/generate-rentgen-sample-pdfs.ts
 */

import fs from "node:fs";
import path from "node:path";
import { runControlModel } from "../src/lib/property-rentgen/control-model";
import { renderDigitalSamplePdfBuffer } from "../src/lib/property-rentgen/control-model-sample-pdf";
import { renderPremiumCaseStudyPdfBuffer } from "../src/lib/property-rentgen/premium-case-study-pdf";

function countPdfPages(buf: Buffer): number {
  const text = buf.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches?.length ?? 0;
}

async function main() {
  const outDir = path.join(process.cwd(), "tmp", "rentgen-pdfs");
  fs.mkdirSync(outDir, { recursive: true });

  const digital = await renderDigitalSamplePdfBuffer(runControlModel(), "demo");
  const premium = await renderPremiumCaseStudyPdfBuffer();

  const digitalPath = path.join(outDir, "digital-999.pdf");
  const premiumPath = path.join(outDir, "premium-4990.pdf");
  fs.writeFileSync(digitalPath, digital);
  fs.writeFileSync(premiumPath, premium);

  const dPages = countPdfPages(digital);
  const pPages = countPdfPages(premium);

  console.log(
    JSON.stringify(
      {
        digitalPath,
        premiumPath,
        digitalBytes: digital.length,
        premiumBytes: premium.length,
        digitalPagesApprox: dPages,
        premiumPagesApprox: pPages,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
