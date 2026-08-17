/**
 * Verify Phase 6.2 lifecycle/revenue schema on the configured Supabase project.
 * Prints only column presence — no secrets, no row PII.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const raw = readFileSync(".env.local", "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

async function main() {
  const env = loadEnvLocal();
  let url = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  if (!url || !key) {
    console.error("MISSING_CREDENTIALS");
    process.exit(2);
  }

  const sb = createClient(url, key, {
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

  for (const col of cols) {
    const { error } = await sb.from("leads").select(col).limit(1);
    if (error) {
      console.log(`MISSING ${col}: ${error.message.slice(0, 120)}`);
    } else {
      console.log(`PRESENT ${col}`);
    }
  }

  for (const table of ["lead_lifecycle_events", "lead_ops_funnel_daily"]) {
    const { error } = await sb.from(table).select("*").limit(1);
    if (error) {
      console.log(`MISSING ${table}: ${error.message.slice(0, 120)}`);
    } else {
      console.log(`PRESENT ${table}`);
    }
  }
}

main().catch((e) => {
  console.error(String(e).slice(0, 200));
  process.exit(1);
});
