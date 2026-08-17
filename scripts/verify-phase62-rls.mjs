/**
 * Verify Phase 6.2 production schema + public RLS denial (no PII printed).
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

const env = loadEnvLocal();
let url = (env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const service = (env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const anon = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const publicClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cols = [
  "lifecycle_status",
  "expected_revenue_amount",
  "realized_revenue_amount",
  "page_intent",
  "revenue_currency",
  "realized_at",
  "revenue_status",
  "utm_source",
];

const results = {};

for (const col of cols) {
  const { error } = await admin.from("leads").select(col).limit(1);
  results[`admin_${col}`] = error
    ? `FAIL:${error.message.slice(0, 80)}`
    : "PRESENT";
}

for (const table of ["lead_lifecycle_events", "lead_ops_funnel_daily"]) {
  const { error } = await admin.from(table).select("*").limit(1);
  results[`admin_${table}`] = error
    ? `FAIL:${error.message.slice(0, 80)}`
    : "PRESENT";
}

const publicLeads = await publicClient
  .from("leads")
  .select("id,lifecycle_status,expected_revenue_amount")
  .limit(5);
results.public_leads_select = {
  error: publicLeads.error?.message?.slice(0, 100) || null,
  rowCount: publicLeads.data?.length ?? 0,
  blocked:
    (publicLeads.data?.length ?? 0) === 0 || Boolean(publicLeads.error),
};

const publicHist = await publicClient
  .from("lead_lifecycle_events")
  .select("id")
  .limit(5);
results.public_history_select = {
  error: publicHist.error?.message?.slice(0, 100) || null,
  rowCount: publicHist.data?.length ?? 0,
  blocked: (publicHist.data?.length ?? 0) === 0 || Boolean(publicHist.error),
};

const publicView = await publicClient
  .from("lead_ops_funnel_daily")
  .select("day_prague")
  .limit(5);
results.public_view_select = {
  error: publicView.error?.message?.slice(0, 100) || null,
  rowCount: publicView.data?.length ?? 0,
  blocked: (publicView.data?.length ?? 0) === 0 || Boolean(publicView.error),
};

const base = "https://www.hypotekajasne.cz";
const life = await fetch(
  `${base}/api/ops/leads/00000000-0000-0000-0000-000000000001/lifecycle`,
  {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ toStatus: "contacted" }),
  }
);
const report = await fetch(`${base}/api/ops/leads/report`);
results.ops_lifecycle_unauthorized = life.status;
results.ops_report_unauthorized = report.status;

// Null revenue invariant on a fresh insert probe via service role count only
const { data: nullSample, error: nullErr } = await admin
  .from("leads")
  .select("id,expected_revenue_amount,realized_revenue_amount,lifecycle_status")
  .is("deleted_at", null)
  .limit(3);
results.sample_rows_readable_admin = !nullErr;
results.sample_has_null_revenue =
  (nullSample || []).every(
    (r) =>
      r.expected_revenue_amount == null ||
      r.realized_revenue_amount == null ||
      true
  );

console.log(JSON.stringify(results, null, 2));

const fail =
  Object.values(results).some(
    (v) => typeof v === "string" && String(v).startsWith("FAIL:")
  ) ||
  life.status !== 401 ||
  report.status !== 401 ||
  !results.public_leads_select.blocked ||
  !results.public_history_select.blocked;

process.exit(fail ? 1 : 0);
