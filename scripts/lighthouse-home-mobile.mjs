/**
 * Mobile Lighthouse benchmark for homepage — 3+ runs, median metrics.
 * Usage: node scripts/lighthouse-home-mobile.mjs [url] [runs] [label]
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] ?? "http://localhost:3000/";
const runs = Math.max(3, Number(process.argv[3] ?? 3));
const label = process.argv[4] ?? "run";
const outDir = join(process.cwd(), ".lighthouse-runs");

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "tmp"), { recursive: true });

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function auditMetric(audit) {
  if (!audit || audit.score == null) return null;
  return audit.numericValue ?? null;
}

function extractLcpNode(audits) {
  const breakdown = audits["lcp-breakdown-insight"]?.details?.items ?? [];
  const node = breakdown.find((item) => item?.type === "node");
  if (node) {
    return {
      snippet: node.snippet ?? null,
      selector: node.selector ?? null,
      nodeLabel: node.nodeLabel ?? null,
    };
  }
  return {
    snippet: audits["largest-contentful-paint-element"]?.displayValue ?? null,
    selector: null,
    nodeLabel: null,
  };
}

function runLighthouse(jsonPath) {
  try {
    execFileSync(
      "npx",
      [
        "lighthouse",
        url,
        "--quiet",
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--only-categories=performance",
        "--form-factor=mobile",
        "--screenEmulation.mobile",
        "--throttling-method=simulate",
        "--output=json",
        `--output-path=${jsonPath}`,
      ],
      {
        stdio: "pipe",
        shell: true,
        env: {
          ...process.env,
          TEMP: join(outDir, "tmp"),
          TMP: join(outDir, "tmp"),
        },
      }
    );
  } catch {
    // Windows may throw EPERM during Chrome temp cleanup after a successful audit.
  }
  if (!existsSync(jsonPath)) {
    throw new Error(`Lighthouse did not write ${jsonPath}`);
  }
}

const results = [];

for (let i = 0; i < runs; i += 1) {
  const jsonPath = join(outDir, `${label}-${i + 1}.json`);
  console.log(`Run ${i + 1}/${runs}…`);
  runLighthouse(jsonPath);

  const lhr = JSON.parse(readFileSync(jsonPath, "utf8"));
  const audits = lhr.audits ?? {};
  const lcpNode = extractLcpNode(audits);
  results.push({
    performance: Math.round((lhr.categories?.performance?.score ?? 0) * 100),
    fcp: auditMetric(audits["first-contentful-paint"]),
    lcp: auditMetric(audits["largest-contentful-paint"]),
    tbt: auditMetric(audits["total-blocking-time"]),
    cls: auditMetric(audits["cumulative-layout-shift"]),
    ttfb: auditMetric(audits["server-response-time"]),
    lcpElement: lcpNode.snippet,
    lcpElementSelector: lcpNode.selector,
    lcpElementLabel: lcpNode.nodeLabel,
  });
}

const summary = {
  label,
  url,
  runs,
  performance: median(results.map((r) => r.performance)),
  fcp: median(results.map((r) => r.fcp)),
  lcp: median(results.map((r) => r.lcp)),
  tbt: median(results.map((r) => r.tbt)),
  cls: median(results.map((r) => r.cls)),
  ttfb: median(results.map((r) => r.ttfb)),
  lcpElements: [...new Set(results.map((r) => r.lcpElement).filter(Boolean))],
  lcpSelectors: [...new Set(results.map((r) => r.lcpElementSelector).filter(Boolean))],
  lcpLabels: [...new Set(results.map((r) => r.lcpElementLabel).filter(Boolean))],
  raw: results,
};

const summaryPath = join(outDir, `summary-${label}.json`);
writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log("\n=== Mobile Lighthouse median ===");
console.log(JSON.stringify(summary, null, 2));
console.log(`\nSaved: ${summaryPath}`);
