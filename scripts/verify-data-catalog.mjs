/**
 * Ověření Source of Truth katalogu — `npm run check:data`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const catalogPath = path.join(root, "src", "lib", "data", "catalog.ts");
const typesPath = path.join(root, "src", "lib", "data", "types.ts");
const indexPath = path.join(root, "src", "lib", "data", "index.ts");
const ratePolicyPath = path.join(root, "src", "lib", "scrape", "rate-policy.ts");
const auditPath = path.join(root, "docs", "DATA_AUDIT.md");

const requiredFiles = [
  catalogPath,
  typesPath,
  indexPath,
  ratePolicyPath,
  auditPath,
  path.join(root, "src", "lib", "data", "display.ts"),
  path.join(root, "src", "lib", "data", "records.ts"),
  path.join(root, "src", "lib", "data", "static-regulatory.ts"),
  path.join(root, "src", "lib", "data", "static-market.ts"),
  path.join(root, "src", "lib", "data", "live-rates.ts"),
];

let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed += 1;
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) fail(`chybí soubor ${path.relative(root, file)}`);
  else ok(`soubor ${path.relative(root, file)}`);
}

const catalogSrc = fs.readFileSync(catalogPath, "utf8");
const idMatches = [...catalogSrc.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
const ids = idMatches.filter((id) => !id.includes("${"));
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);

if (dupes.length) fail(`duplicitní katalog ID: ${[...new Set(dupes)].join(", ")}`);
else ok(`${ids.length} unikátních katalog ID`);

const typesSrc = fs.readFileSync(typesPath, "utf8");
const statusBlock =
  typesSrc.includes("LIVE") &&
  typesSrc.includes("VERIFIED") &&
  typesSrc.includes("MODELLED") &&
  typesSrc.includes("PARTNER_QUOTE") &&
  typesSrc.includes("STALE");
if (!statusBlock) fail("DataStatus neobsahuje všechny statusy");
else ok("DataStatus kompletní");

const requiredFields = [
  "value",
  "unit",
  "country",
  "source",
  "sourceUrl",
  "sourceType",
  "validFrom",
  "lastFetchedAt",
  "lastVerifiedAt",
  "status",
  "confidence",
  "notes",
];
for (const field of requiredFields) {
  if (!typesSrc.includes(field)) fail(`DataRecord chybí pole ${field}`);
}
ok("DataRecord má povinná pole");

const ratePolicy = fs.readFileSync(ratePolicyPath, "utf8");
if (
  !ratePolicy.includes("KB_INSIDER_RATES") ||
  !ratePolicy.includes("ORIENTATIONAL_WITHOUT_SURCHARGE")
) {
  fail(
    "rate-policy.ts musí exportovat KB_INSIDER_RATES a ORIENTATIONAL_WITHOUT_SURCHARGE"
  );
} else ok("rate-policy konstanty");

const banking = fs.readFileSync(path.join(root, "src", "lib", "banking.ts"), "utf8");
if (!banking.includes("REGULATORY_RECORDS")) {
  fail("banking.ts musí číst DSTI prahy z REGULATORY_RECORDS");
} else ok("banking.ts ↔ REGULATORY_RECORDS");

if (failed > 0) {
  console.error(`\ncheck:data FAILED (${failed})`);
  process.exit(1);
}
console.log("\ncheck:data PASSED");
