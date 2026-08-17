/**
 * One controlled Phase 6.2 synthetic lead on production, then exact delete.
 * Uses .env.local service role. Never prints PII beyond marker/id.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const raw = readFileSync(".env.local", "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[line.slice(0, i).trim()] = v;
  }
  return out;
}

const marker = `phase_6_2_vercel_${Date.now()}`;
const email = `phase62.${Date.now()}@example.com`;
const name = "PHASE62 VERCEL SYNTHETIC";

const env = loadEnvLocal();
let url = (env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const key = (env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
if (!url || !key) {
  console.error("MISSING_CREDENTIALS");
  process.exit(2);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const before = await sb
  .from("leads")
  .select("id")
  .contains("metadata", { test_marker: marker });
if ((before.data?.length ?? 0) > 0) {
  console.error("MARKER_ALREADY_EXISTS");
  process.exit(1);
}

const payload = {
  name,
  email,
  phone: "+420777000062",
  source: "lead_gen",
  notes: `synthetic ${marker}`,
  metadata: {
    test_marker: marker,
    page_intent: "refinance",
    gclid: "should-be-stripped",
  },
  consent: {
    policyVersion: "2026-08-07.2",
    privacyAccepted: true,
    partnerTransferAccepted: false,
    partnerTransferScope: "none",
    marketingAccepted: false,
    consentedAt: new Date().toISOString(),
    sourcePath: "/temata/refinancovani",
  },
};

const res = await fetch("https://www.hypotekajasne.cz/api/leads", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});
const json = await res.json();
console.log(
  JSON.stringify({
    httpStatus: res.status,
    ok: json.ok === true,
    leadIdPresent: typeof json.leadId === "string" && json.leadId.length > 10,
    leadId: json.leadId || null,
    marker,
  })
);

if (!json.ok || !json.leadId) {
  console.error("INSERT_FAILED", json.error || "unknown");
  process.exit(1);
}

const leadId = json.leadId;
const { data: row, error } = await sb
  .from("leads")
  .select("id, source, metadata")
  .eq("id", leadId)
  .maybeSingle();

if (error || !row) {
  console.error("DB_LOOKUP_FAILED");
  process.exit(1);
}

const meta = row.metadata || {};
const pageIntent = meta.page_intent ?? null;
const hasGclid = Object.prototype.hasOwnProperty.call(meta, "gclid");
console.log(
  JSON.stringify({
    dbIdMatches: row.id === leadId,
    page_intent: pageIntent,
    markerInMeta: meta.test_marker === marker,
    gclidStripped: !hasGclid,
    source: row.source,
  })
);

const { error: delErr } = await sb.from("leads").delete().eq("id", leadId);
if (delErr) {
  console.error("DELETE_FAILED");
  process.exit(1);
}

const { data: after } = await sb
  .from("leads")
  .select("id")
  .contains("metadata", { test_marker: marker });
const { data: byId } = await sb.from("leads").select("id").eq("id", leadId);

console.log(
  JSON.stringify({
    cleanup: true,
    remainingByMarker: after?.length ?? 0,
    remainingById: byId?.length ?? 0,
  })
);

if ((after?.length ?? 0) > 0 || (byId?.length ?? 0) > 0) {
  process.exit(1);
}
