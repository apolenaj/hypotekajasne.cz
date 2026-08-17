/**
 * Delete a Phase 6.2 synthetic lead by exact marker (or email+name pair).
 *
 *   PHASE62_MARKER=phase_6_2_<ts> E2E_DELETE_TEST_LEAD=1 npx tsx scripts/delete-phase62-synthetic-lead.ts
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  if (process.env.E2E_DELETE_TEST_LEAD !== "1") {
    console.error("Refusing to run without E2E_DELETE_TEST_LEAD=1");
    process.exit(1);
  }

  const marker = process.env.PHASE62_MARKER?.trim();
  if (!marker || !/^phase_6_2_[a-z0-9_-]+$/i.test(marker)) {
    console.error("PHASE62_MARKER must match phase_6_2_<token>");
    process.exit(1);
  }

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: before, error: findErr } = await supabase
    .from("leads")
    .select("id, metadata")
    .contains("metadata", { test_marker: marker });

  if (findErr) {
    console.error(findErr.message);
    process.exit(1);
  }

  console.log("Matching rows before delete:", before?.length ?? 0);
  for (const row of before ?? []) {
    console.log("row", row.id);
  }

  if (!before?.length) {
    console.log("Nothing to delete.");
    return;
  }

  const ids = before.map((r) => r.id);
  const { error: delErr } = await supabase.from("leads").delete().in("id", ids);
  if (delErr) {
    console.error(delErr.message);
    process.exit(1);
  }

  const { data: after, error: afterErr } = await supabase
    .from("leads")
    .select("id")
    .contains("metadata", { test_marker: marker });

  if (afterErr) {
    console.error(afterErr.message);
    process.exit(1);
  }

  if ((after?.length ?? 0) > 0) {
    console.error("Rows still remain after delete:", after?.length);
    process.exit(1);
  }

  console.log("Deleted synthetic Phase 6.2 lead(s); zero matching rows remain.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
