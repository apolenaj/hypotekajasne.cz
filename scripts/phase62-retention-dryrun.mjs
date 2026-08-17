/**
 * Authorized retention dry-run against production.
 * Prefer: npx vercel env run -e production -- node scripts/phase62-retention-dryrun.mjs
 * Never prints secrets.
 */
import { readFileSync, unlinkSync, existsSync } from "node:fs";

function loadEnvFile(path) {
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i);
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

let secret = process.env.CRON_SECRET?.trim() || "";
const file = ".env.vercel.production";
if (!secret && existsSync(file)) {
  const env = loadEnvFile(file);
  unlinkSync(file);
  secret = env.CRON_SECRET?.trim() || "";
}

if (!secret) {
  console.error("CRON_SECRET missing (use vercel env run -e production)");
  process.exit(1);
}

const r = await fetch(
  "https://www.hypotekajasne.cz/api/cron/privacy-retention?dryRun=true",
  { headers: { authorization: `Bearer ${secret}` } }
);
const body = await r.json();
console.log(
  JSON.stringify(
    {
      status: r.status,
      keys: Object.keys(body).sort(),
      dryRun: body.dryRun,
      ok: body.ok,
      candidateCount: body.candidateCount,
      hasCandidateIds: "candidateIds" in body,
      runIdPresent: Boolean(body.runId),
      errorCount: body.errorCount,
      scanned: body.scanned,
    },
    null,
    2
  )
);
if (r.status !== 200 || body.dryRun !== true || "candidateIds" in body) {
  process.exit(1);
}
